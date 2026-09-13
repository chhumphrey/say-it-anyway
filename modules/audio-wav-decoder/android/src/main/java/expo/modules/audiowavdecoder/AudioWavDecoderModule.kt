package expo.modules.audiowavdecoder

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.net.URI
import java.nio.ByteBuffer
import java.nio.ByteOrder

// Decodes a compressed audio recording (AMR-NB/.3gp, AAC/.m4a, etc.) to a
// mono 16 kHz 16-bit PCM WAV file using MediaExtractor + MediaCodec, which
// are built into every Android device -- no ffmpeg, no third-party decoder.
// whisper.rn's transcribe() only reads raw WAV/PCM, so this is the bridge
// between what the app records and what whisper.rn can consume.
class AudioWavDecoderModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AudioWavDecoder")

    AsyncFunction("decodeToWav") { sourceUri: String, destUri: String ->
      AudioWavDecoder.decode(sourceUri, destUri)
    }
  }
}

private const val TARGET_SAMPLE_RATE = 16000
private const val TARGET_CHANNELS = 1
private const val DEQUEUE_TIMEOUT_US = 10_000L

object AudioWavDecoder {
  fun decode(sourceUri: String, destUri: String): Map<String, Any> {
    val sourcePath = uriToPath(sourceUri)
    val destPath = uriToPath(destUri)

    val destDir = File(destPath).parentFile
    if (destDir == null || !destDir.exists()) {
      throw IllegalArgumentException("Destination directory does not exist: $destDir")
    }

    val extractor = MediaExtractor()
    extractor.setDataSource(sourcePath)

    var trackIndex = -1
    var format: MediaFormat? = null
    for (i in 0 until extractor.trackCount) {
      val f = extractor.getTrackFormat(i)
      val mime = f.getString(MediaFormat.KEY_MIME) ?: continue
      if (mime.startsWith("audio/")) {
        trackIndex = i
        format = f
        break
      }
    }
    if (trackIndex == -1 || format == null) {
      extractor.release()
      throw IllegalStateException("Source file has no audio track")
    }
    extractor.selectTrack(trackIndex)

    val mime = format.getString(MediaFormat.KEY_MIME)!!

    // The format the extractor reports is the *encoded* stream's format.
    // The decoder may report a different (real) PCM sample rate/channel
    // count once decoding actually starts (e.g. AMR-NB is always 8kHz mono
    // regardless of what the container says), so these are updated from
    // the decoder's own output format once available.
    var sampleRate = format.getInteger(MediaFormat.KEY_SAMPLE_RATE)
    var channels = format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
    val pcmChunks = ArrayList<ByteArray>()

    // Held outside the try so a failure in createDecoderByType/configure/
    // start (before `codec` is assigned) can't leak the extractor, and a
    // failure mid-decode still releases whatever was created.
    var codec: MediaCodec? = null
    try {
      val c = MediaCodec.createDecoderByType(mime)
      codec = c
      c.configure(format, null, null, 0)
      c.start()

      var sawInputEos = false
      var sawOutputEos = false
      val bufferInfo = MediaCodec.BufferInfo()

      while (!sawOutputEos) {
        if (!sawInputEos) {
          val inputIndex = c.dequeueInputBuffer(DEQUEUE_TIMEOUT_US)
          if (inputIndex >= 0) {
            val inputBuffer = c.getInputBuffer(inputIndex)
              ?: throw IllegalStateException("Decoder returned a null input buffer")
            val sampleSize = extractor.readSampleData(inputBuffer, 0)
            if (sampleSize < 0) {
              c.queueInputBuffer(inputIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
              sawInputEos = true
            } else {
              val presentationTimeUs = extractor.sampleTime
              c.queueInputBuffer(inputIndex, 0, sampleSize, presentationTimeUs, 0)
              extractor.advance()
            }
          }
        }

        val outputIndex = c.dequeueOutputBuffer(bufferInfo, DEQUEUE_TIMEOUT_US)
        when {
          outputIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
            val outFormat = c.outputFormat
            sampleRate = outFormat.getInteger(MediaFormat.KEY_SAMPLE_RATE)
            channels = outFormat.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
          }
          outputIndex == MediaCodec.INFO_TRY_AGAIN_LATER -> {
            // No output ready yet; loop back and feed more input.
          }
          outputIndex >= 0 -> {
            if (bufferInfo.size > 0) {
              val outputBuffer = c.getOutputBuffer(outputIndex)
                ?: throw IllegalStateException("Decoder returned a null output buffer")
              val chunk = ByteArray(bufferInfo.size)
              outputBuffer.position(bufferInfo.offset)
              outputBuffer.limit(bufferInfo.offset + bufferInfo.size)
              outputBuffer.get(chunk)
              pcmChunks.add(chunk)
            }
            c.releaseOutputBuffer(outputIndex, false)
            if (bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
              sawOutputEos = true
            }
          }
        }
      }
    } finally {
      try {
        codec?.stop()
      } catch (ignored: Exception) {
        // stop() throws if the codec never reached the Executing state
        // (e.g. configure()/start() itself failed) -- nothing to stop.
      }
      codec?.release()
      extractor.release()
    }

    if (pcmChunks.isEmpty()) {
      throw IllegalStateException("No audio samples were decoded")
    }

    var pcm16 = concatAsShorts(pcmChunks)
    if (channels > 1) {
      pcm16 = downmixToMono(pcm16, channels)
    }
    if (sampleRate != TARGET_SAMPLE_RATE) {
      pcm16 = resampleLinear(pcm16, sampleRate, TARGET_SAMPLE_RATE)
    }

    val pcmBytes = shortsToLittleEndianBytes(pcm16)
    writeWavFile(destPath, pcmBytes, TARGET_SAMPLE_RATE, TARGET_CHANNELS, 16)

    return mapOf(
      "uri" to "file://$destPath",
      "sampleRate" to TARGET_SAMPLE_RATE,
      "channels" to TARGET_CHANNELS,
    )
  }

  private fun uriToPath(uriString: String): String {
    return if (uriString.startsWith("file://")) {
      URI(uriString).path
    } else {
      uriString
    }
  }

  // MediaCodec's decoded PCM output is 16-bit little-endian, interleaved by
  // channel. Concatenate the raw byte chunks and view them as shorts.
  private fun concatAsShorts(chunks: List<ByteArray>): ShortArray {
    val totalBytes = chunks.sumOf { it.size }
    val buffer = ByteBuffer.allocate(totalBytes).order(ByteOrder.LITTLE_ENDIAN)
    for (chunk in chunks) buffer.put(chunk)
    buffer.rewind()
    val shorts = ShortArray(totalBytes / 2)
    buffer.asShortBuffer().get(shorts)
    return shorts
  }

  private fun downmixToMono(samples: ShortArray, channels: Int): ShortArray {
    val frameCount = samples.size / channels
    val mono = ShortArray(frameCount)
    for (i in 0 until frameCount) {
      var sum = 0
      for (c in 0 until channels) {
        sum += samples[i * channels + c]
      }
      mono[i] = (sum / channels).toShort()
    }
    return mono
  }

  // Simple linear-interpolation resampler. Good enough for speech going
  // into whisper -- whisper.cpp itself expects 16kHz input and does not
  // resample on our behalf, so this has to happen before transcription.
  private fun resampleLinear(samples: ShortArray, fromRate: Int, toRate: Int): ShortArray {
    if (samples.isEmpty() || fromRate == toRate) return samples
    val ratio = toRate.toDouble() / fromRate.toDouble()
    val outLength = (samples.size * ratio).toInt().coerceAtLeast(1)
    val out = ShortArray(outLength)
    for (i in 0 until outLength) {
      val srcPos = i / ratio
      val srcIndex = srcPos.toInt()
      val frac = srcPos - srcIndex
      val s0 = samples[srcIndex.coerceIn(0, samples.size - 1)]
      val s1 = samples[(srcIndex + 1).coerceIn(0, samples.size - 1)]
      out[i] = (s0 + (s1 - s0) * frac).toInt().toShort()
    }
    return out
  }

  private fun shortsToLittleEndianBytes(samples: ShortArray): ByteArray {
    val buffer = ByteBuffer.allocate(samples.size * 2).order(ByteOrder.LITTLE_ENDIAN)
    buffer.asShortBuffer().put(samples)
    return buffer.array()
  }

  private fun writeWavFile(path: String, pcmData: ByteArray, sampleRate: Int, channels: Int, bitsPerSample: Int) {
    val byteRate = sampleRate * channels * (bitsPerSample / 8)
    val blockAlign = channels * (bitsPerSample / 8)
    val dataSize = pcmData.size
    val riffSize = 36 + dataSize

    val header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN)
    header.put("RIFF".toByteArray(Charsets.US_ASCII))
    header.putInt(riffSize)
    header.put("WAVE".toByteArray(Charsets.US_ASCII))
    header.put("fmt ".toByteArray(Charsets.US_ASCII))
    header.putInt(16) // fmt chunk size (PCM)
    header.putShort(1) // audio format = 1 (PCM)
    header.putShort(channels.toShort())
    header.putInt(sampleRate)
    header.putInt(byteRate)
    header.putShort(blockAlign.toShort())
    header.putShort(bitsPerSample.toShort())
    header.put("data".toByteArray(Charsets.US_ASCII))
    header.putInt(dataSize)

    val file = File(path)
    if (file.exists()) file.delete()
    FileOutputStream(file).use { out ->
      out.write(header.array())
      out.write(pcmData)
    }
  }
}
