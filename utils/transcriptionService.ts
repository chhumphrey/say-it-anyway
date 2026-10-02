// On-device speech-to-text for journal recordings, via whisper.rn running
// the base.en ggml model entirely on-device.
//
// PRIVACY: nothing here ever sends audio or transcript text off the device.
// The only network call this module makes is a one-time download of the
// public whisper.cpp model file itself (just neural network weights, not
// user data), which is then cached locally and never re-fetched.
import { initWhisper, type WhisperContext } from 'whisper.rn';
import { Directory, File, Paths } from 'expo-file-system';

import AudioWavDecoder from '@/modules/audio-wav-decoder/src';
import { TranscriptionStageError, type TranscriptionFailureStage } from '@/utils/transcriptionStageError';

export type { TranscriptionFailureStage };
export { TranscriptionStageError };

// Quantized base.en (~60MB download) rather than the full fp16 model
// (~148MB) -- a much smaller one-time download and smaller memory
// footprint on-device, at a small, generally-imperceptible cost to
// transcription accuracy for short spoken-word journal entries.
const MODEL_FILENAME = 'ggml-base.en-q5_1.bin';
const MODEL_URL = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${MODEL_FILENAME}`;

const MODELS_DIR_NAME = 'whisper-models';
const TMP_DIR_NAME = 'whisper-tmp';

// Lazily created, and created only once -- every caller awaits the same
// promise instead of re-initializing (and re-downloading) the model.
let whisperContextPromise: Promise<WhisperContext> | null = null;

export interface TranscriptionDownloadProgress {
  bytesWritten: number;
  totalBytes: number;
}

export interface TranscriptionAttemptCallbacks {
  // Fired only when the model actually needs downloading (never on a cached
  // model), driven by the download layer's own progress events -- whisper.rn
  // itself only accepts a local file path and exposes no download progress.
  onDownloadProgress?: (progress: TranscriptionDownloadProgress) => void;
  // Fired once the model is ready (downloaded/cached and initialized) and
  // the actual transcription is about to start. whisper.rn exposes no real
  // progress signal for file-based transcription, so this is a single
  // start marker, not a percentage.
  onTranscribingStart?: () => void;
}

function getModelsDirectory(): Directory {
  const dir = new Directory(Paths.document, MODELS_DIR_NAME);
  if (!dir.exists) {
    dir.create({ idempotent: true });
  }
  return dir;
}

async function ensureModelDownloaded(
  onDownloadProgress?: (progress: TranscriptionDownloadProgress) => void
): Promise<File> {
  const modelFile = new File(getModelsDirectory(), MODEL_FILENAME);
  if (modelFile.exists) {
    return modelFile;
  }
  console.log('TranscriptionService: downloading base.en model (one-time, then cached locally)...');
  const task = File.createDownloadTask(MODEL_URL, getModelsDirectory(), {
    onProgress: onDownloadProgress,
  });
  const downloaded = await task.downloadAsync();
  if (!downloaded) {
    throw new Error('Model download did not complete');
  }
  console.log('TranscriptionService: model downloaded to', downloaded.uri);
  return downloaded;
}

async function getWhisperContext(
  onDownloadProgress?: (progress: TranscriptionDownloadProgress) => void
): Promise<WhisperContext> {
  if (!whisperContextPromise) {
    whisperContextPromise = (async () => {
      const modelFile = await ensureModelDownloaded(onDownloadProgress);
      return initWhisper({ filePath: modelFile.uri });
    })().catch((error) => {
      // Allow the next transcribe() call to retry instead of permanently
      // failing every future call because of one bad attempt (e.g. the
      // download failing due to no network on first-ever use).
      whisperContextPromise = null;
      throw error;
    });
  }
  return whisperContextPromise;
}

function isWavFile(uri: string): boolean {
  return uri.toLowerCase().split('?')[0].endsWith('.wav');
}

function describeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

// whisper.rn's transcribe() only reads raw WAV/PCM. Recordings made by this
// app are compressed (.m4a on iOS, .3gp on Android), so they're decoded to a
// temporary mono 16kHz WAV file first, via the AudioWavDecoder native module
// (AVAssetReader / MediaExtractor+MediaCodec -- no ffmpeg).
async function ensureWavFile(sourceUri: string): Promise<{ path: string; isTemporary: boolean }> {
  if (isWavFile(sourceUri)) {
    return { path: sourceUri, isTemporary: false };
  }

  const tmpDir = new Directory(Paths.cache, TMP_DIR_NAME);
  if (!tmpDir.exists) {
    tmpDir.create({ idempotent: true });
  }
  const destFile = new File(tmpDir, `decoded-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);

  const result = await AudioWavDecoder.decodeToWav(sourceUri, destFile.uri);
  return { path: result.uri, isTemporary: true };
}

export const TranscriptionService = {
  /**
   * Transcribes the audio recording at `audioUri` and returns the resulting
   * text. Initializes the whisper.rn model on first use (downloading it if
   * it isn't cached yet); every subsequent call reuses the same model
   * instance.
   */
  async transcribe(audioUri: string, callbacks?: TranscriptionAttemptCallbacks): Promise<string> {
    let context;
    try {
      context = await getWhisperContext(callbacks?.onDownloadProgress);
    } catch (error) {
      throw new TranscriptionStageError('model', `Model download or initialization failed: ${describeError(error)}`);
    }

    callbacks?.onTranscribingStart?.();

    let wavPath: string;
    let isTemporary: boolean;
    try {
      ({ path: wavPath, isTemporary } = await ensureWavFile(audioUri));
    } catch (error) {
      throw new TranscriptionStageError('decode', `Could not decode this recording: ${describeError(error)}`);
    }

    try {
      const { promise } = context.transcribe(wavPath, { language: 'en' });
      const { result } = await promise;
      return (result ?? '').trim();
    } catch (error) {
      throw new TranscriptionStageError('transcribe', `Transcription failed: ${describeError(error)}`);
    } finally {
      if (isTemporary) {
        try {
          new File(wavPath).delete();
        } catch (cleanupError) {
          console.warn('TranscriptionService: failed to clean up temporary WAV file', cleanupError);
        }
      }
    }
  },

  /**
   * Downloads and initializes the model without transcribing anything.
   * Useful for warming the model up ahead of time (e.g. right after the
   * app launches) so the first real transcription isn't slowed down by a
   * cold start.
   */
  async warmUp(): Promise<void> {
    await getWhisperContext();
  },
};
