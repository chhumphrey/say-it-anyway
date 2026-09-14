import { NativeModule, requireNativeModule } from 'expo';

import { DecodeToWavResult } from './AudioWavDecoder.types';

declare class AudioWavDecoderModule extends NativeModule<{}> {
  /**
   * Decodes a compressed audio file (AAC/.m4a on iOS, AMR-NB or AAC/.3gp on
   * Android) to a mono 16 kHz 16-bit PCM WAV file at `destUri`, using each
   * platform's own built-in decoder (AVAssetReader on iOS, MediaExtractor +
   * MediaCodec on Android). No third-party or ffmpeg-based decoding.
   *
   * @param sourceUri file:// URI of the source recording to decode.
   * @param destUri file:// URI to write the resulting WAV file to. The
   *   destination directory must already exist.
   */
  decodeToWav(sourceUri: string, destUri: string): Promise<DecodeToWavResult>;
}

export default requireNativeModule<AudioWavDecoderModule>('AudioWavDecoder');
