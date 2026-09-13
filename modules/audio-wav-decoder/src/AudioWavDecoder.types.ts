// Result of decoding a compressed audio file (.m4a, .3gp, etc.) down to a
// mono 16 kHz 16-bit PCM WAV file, which is the only format whisper.rn's
// native transcribe() can read.
export type DecodeToWavResult = {
  // file:// URI of the WAV file written to `destUri`.
  uri: string;
  sampleRate: number;
  channels: number;
};
