import ExpoModulesCore
import AVFoundation

// Decodes a compressed audio recording (AAC/.m4a) to a mono 16 kHz 16-bit
// PCM WAV file using AVAssetReader — no ffmpeg, no third-party decoder.
// whisper.rn's transcribe() only reads raw WAV/PCM, so this is the bridge
// between what the app records and what whisper.rn can consume.
public class AudioWavDecoderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AudioWavDecoder")

    AsyncFunction("decodeToWav") { (sourceUri: String, destUri: String) throws -> [String: Any] in
      try AudioWavDecoderModule.decode(sourceUri: sourceUri, destUri: destUri)
    }
  }

  private static let targetSampleRate: Double = 16000
  private static let targetChannels: UInt32 = 1

  private static func decode(sourceUri: String, destUri: String) throws -> [String: Any] {
    guard let sourceURL = URL(string: sourceUri) else {
      throw AudioWavDecoderError.invalidArgument("Invalid sourceUri: \(sourceUri)")
    }
    guard let destURL = URL(string: destUri) else {
      throw AudioWavDecoderError.invalidArgument("Invalid destUri: \(destUri)")
    }

    let asset = AVURLAsset(url: sourceURL)
    guard let track = asset.tracks(withMediaType: .audio).first else {
      throw AudioWavDecoderError.decodeFailed("Source file has no audio track")
    }

    let reader = try AVAssetReader(asset: asset)

    // Ask AVAssetReader to hand us mono 16kHz signed 16-bit PCM directly --
    // it decodes AAC (or whatever the source codec is) and resamples/
    // downmixes for us, so no manual resampling code is needed here.
    let outputSettings: [String: Any] = [
      AVFormatIDKey: kAudioFormatLinearPCM,
      AVSampleRateKey: targetSampleRate,
      AVNumberOfChannelsKey: targetChannels,
      AVLinearPCMBitDepthKey: 16,
      AVLinearPCMIsBigEndianKey: false,
      AVLinearPCMIsFloatKey: false,
      AVLinearPCMIsNonInterleaved: false,
    ]
    let output = AVAssetReaderTrackOutput(track: track, outputSettings: outputSettings)
    guard reader.canAdd(output) else {
      throw AudioWavDecoderError.decodeFailed("Could not configure PCM output for this asset")
    }
    reader.add(output)

    guard reader.startReading() else {
      throw AudioWavDecoderError.decodeFailed(
        "AVAssetReader failed to start: \(reader.error?.localizedDescription ?? "unknown error")"
      )
    }

    var pcmData = Data()
    while let sampleBuffer = output.copyNextSampleBuffer() {
      guard let blockBuffer = CMSampleBufferGetDataBuffer(sampleBuffer) else { continue }
      var length = 0
      var dataPointer: UnsafeMutablePointer<Int8>?
      let status = CMBlockBufferGetDataPointer(
        blockBuffer, atOffset: 0, lengthAtOffsetOut: nil, totalLengthOut: &length, dataPointerOut: &dataPointer
      )
      if status == kCMBlockBufferNoErr, let dataPointer = dataPointer, length > 0 {
        pcmData.append(UnsafeBufferPointer(start: dataPointer, count: length))
      }
    }

    if reader.status == .failed {
      throw AudioWavDecoderError.decodeFailed(
        reader.error?.localizedDescription ?? "AVAssetReader failed while decoding"
      )
    }
    if pcmData.isEmpty {
      throw AudioWavDecoderError.decodeFailed("No audio samples were decoded")
    }

    let wavData = WavWriter.wrap(
      pcmData: pcmData, sampleRate: UInt32(targetSampleRate), channels: UInt16(targetChannels), bitsPerSample: 16
    )

    let destPath = destURL.path
    let destDir = (destPath as NSString).deletingLastPathComponent
    if !FileManager.default.fileExists(atPath: destDir) {
      throw AudioWavDecoderError.invalidArgument("Destination directory does not exist: \(destDir)")
    }
    if FileManager.default.fileExists(atPath: destPath) {
      try FileManager.default.removeItem(atPath: destPath)
    }
    try wavData.write(to: destURL, options: .atomic)

    return [
      "uri": destURL.absoluteString,
      "sampleRate": Int(targetSampleRate),
      "channels": Int(targetChannels),
    ]
  }
}

enum AudioWavDecoderError: Error, LocalizedError {
  case invalidArgument(String)
  case decodeFailed(String)

  var errorDescription: String? {
    switch self {
    case .invalidArgument(let message): return message
    case .decodeFailed(let message): return message
    }
  }
}

// Minimal RIFF/WAVE header writer for 16-bit PCM.
enum WavWriter {
  static func wrap(pcmData: Data, sampleRate: UInt32, channels: UInt16, bitsPerSample: UInt16) -> Data {
    let byteRate = sampleRate * UInt32(channels) * UInt32(bitsPerSample / 8)
    let blockAlign = channels * (bitsPerSample / 8)
    let dataSize = UInt32(pcmData.count)
    let riffSize = 36 + dataSize

    var header = Data()
    header.append(contentsOf: "RIFF".utf8)
    header.append(littleEndian: riffSize)
    header.append(contentsOf: "WAVE".utf8)
    header.append(contentsOf: "fmt ".utf8)
    header.append(littleEndian: UInt32(16)) // fmt chunk size (PCM)
    header.append(littleEndian: UInt16(1)) // audio format = 1 (PCM)
    header.append(littleEndian: channels)
    header.append(littleEndian: sampleRate)
    header.append(littleEndian: byteRate)
    header.append(littleEndian: blockAlign)
    header.append(littleEndian: bitsPerSample)
    header.append(contentsOf: "data".utf8)
    header.append(littleEndian: dataSize)

    return header + pcmData
  }
}

private extension Data {
  mutating func append(littleEndian value: UInt32) {
    var v = value.littleEndian
    append(UnsafeBufferPointer(start: &v, count: 1))
  }
  mutating func append(littleEndian value: UInt16) {
    var v = value.littleEndian
    append(UnsafeBufferPointer(start: &v, count: 1))
  }
}
