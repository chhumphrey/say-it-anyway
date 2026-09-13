import { registerWebModule, NativeModule } from 'expo';

import { DecodeToWavResult } from './AudioWavDecoder.types';

class AudioWavDecoderModule extends NativeModule<{}> {
  async decodeToWav(_sourceUri: string, _destUri: string): Promise<DecodeToWavResult> {
    throw new Error('AudioWavDecoder is not supported on web.');
  }
}

export default registerWebModule(AudioWavDecoderModule, 'AudioWavDecoderModule');
