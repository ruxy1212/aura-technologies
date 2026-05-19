/**
 * Aura Audio Engine
 *
 * Responsibilities:
 *  1. Request microphone access
 *  2. Route the mic stream into the Web Audio API graph
 *  3. Run Meyda for real-time acoustic feature extraction (~86fps)
 *  4. Run autocorrelation pitch detection on the same buffer
 *  5. Detect speech vs silence via RMS threshold
 *  6. Emit a structured frame object to a consumer callback every buffer tick
 *
 * Nothing in this file calls any external API.
 * Nothing in this file has side-effects beyond the AudioContext graph.
 */

import Meyda from 'meyda';

// ─── Constants ───────────────────────────────────────────────────────────────

// Buffer size: 512 samples @ 44100Hz = ~11.6ms per frame = ~86 frames/sec
const BUFFER_SIZE = 512;

// Features we ask Meyda to compute each frame.
// Chosen because each maps to a distinct biomarker dimension:
//   rms             → vocal energy / loudness
//   spectralCentroid → voice brightness (higher = brighter / more alert)
//   zcr             → zero crossing rate (noisiness indicator)
//   mfcc            → timbre fingerprint (13 coefficients, captures vocal quality)
//   spectralFlux    → rate of spectral change (agitation / sudden emotional shifts)
const MEYDA_FEATURES = ['rms', 'spectralCentroid', 'zcr', 'mfcc', 'spectralFlux'];

// Frames whose RMS falls below this threshold are treated as silence/pause.
// 0.01 = very quiet. Calibrated for typical laptop microphone in a quiet room.
// Consumer code may override this after construction.
const DEFAULT_SILENCE_THRESHOLD = 0.01;

// Minimum voiced frequency for a human voice (Hz). Used in pitch detection.
const MIN_PITCH_HZ = 70;

// Maximum voiced frequency for a human voice (Hz).
const MAX_PITCH_HZ = 400;

// ─── Autocorrelation Pitch Detection ─────────────────────────────────────────
/**
 * Detects the fundamental frequency (F0) of a voiced audio frame using
 * the autocorrelation method. Returns null if no confident pitch is found.
 *
 * How it works:
 *   Autocorrelation measures how similar a signal is to a delayed version
 *   of itself. For a periodic signal (voiced speech), the correlation peaks
 *   at the lag equal to one period of the fundamental frequency.
 *   F0 = sampleRate / lag_of_peak
 *
 * @param {Float32Array} buffer   - Raw PCM samples from the audio frame
 * @param {number}       sampleRate - AudioContext sample rate (typically 44100)
 * @returns {number|null} Fundamental frequency in Hz, or null if unvoiced
 */
function detectPitch(buffer, sampleRate) {
  const n = buffer.length;

  // Convert frequency bounds to sample lag bounds
  const minLag = Math.floor(sampleRate / MAX_PITCH_HZ); // ~110 samples
  const maxLag = Math.ceil(sampleRate / MIN_PITCH_HZ);  // ~630 samples

  // Guard: if buffer is too short for the lag range, return null
  if (maxLag >= n) return null;

  // Step 1: Compute the autocorrelation for each lag in our voice range
  let bestLag = -1;
  let bestCorrelation = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let correlation = 0;
    for (let i = 0; i < n - lag; i++) {
      correlation += buffer[i] * buffer[i + lag];
    }
    // Normalize by the number of terms summed
    correlation /= (n - lag);

    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  // Step 2: Confidence check.
  // Compute the zero-lag autocorrelation (signal's own power).
  // If the best correlation is less than 10% of the signal's power,
  // the signal is likely unvoiced noise — return null.
  let zeroCorrPower = 0;
  for (let i = 0; i < n; i++) {
    zeroCorrPower += buffer[i] * buffer[i];
  }
  zeroCorrPower /= n;

  if (zeroCorrPower < 1e-6) return null; // silence
  if (bestCorrelation / zeroCorrPower < 0.1) return null; // unvoiced

  return sampleRate / bestLag;
}

// ─── AudioEngine Class ───────────────────────────────────────────────────────

export class AudioEngine {
  /**
   * @param {object}   options
   * @param {function} options.onFrame       - Called with a FrameData object ~86x/sec
   * @param {function} options.onError       - Called if mic access fails
   * @param {number}  [options.silenceThreshold] - RMS below which = silence
   */
  constructor({ onFrame, onError, silenceThreshold = DEFAULT_SILENCE_THRESHOLD }) {
    this._onFrame = onFrame;
    this._onError = onError;
    this._silenceThreshold = silenceThreshold;

    // These are set during start() and cleared during stop()
    this._audioContext = null;
    this._stream = null;
    this._source = null;
    this._meydaAnalyzer = null;
    this._analyserNode = null; // separate node for pitch detection raw buffer

    this._isRunning = false;
    this._sessionStartTime = null;
  }

  /**
   * Request mic access and start the audio pipeline.
   * Returns a Promise that resolves when the pipeline is active,
   * or rejects with a user-readable error string.
   */
  async start() {
    if (this._isRunning) return;

    try {
      // 1. Request microphone access
      this._stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow access and try again.'
          : `Could not access microphone: ${err.message}`;
      this._onError(msg);
      throw new Error(msg);
    }

    // 2. Create AudioContext (must be created after user gesture — Vite dev
    //    server and all modern browsers enforce this correctly when start()
    //    is called from a button click handler)
    this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this._sessionStartTime = this._audioContext.currentTime;

    // 3. Connect mic stream into the audio graph
    this._source = this._audioContext.createMediaStreamSource(this._stream);

    // 4. Create a second AnalyserNode exclusively for raw PCM access
    //    (needed for autocorrelation pitch detection).
    //    Meyda uses its own internal ScriptProcessorNode; we need the raw
    //    Float32Array separately.
    this._analyserNode = this._audioContext.createAnalyser();
    this._analyserNode.fftSize = BUFFER_SIZE * 2; // must be power of 2; gives us BUFFER_SIZE time-domain samples
    this._source.connect(this._analyserNode);

    // Pre-allocate buffer to avoid GC churn inside the hot path
    this._pitchBuffer = new Float32Array(this._analyserNode.fftSize);

    // 5. Create the Meyda analyzer
    this._meydaAnalyzer = Meyda.createMeydaAnalyzer({
      audioContext: this._audioContext,
      source: this._source,
      bufferSize: BUFFER_SIZE,
      featureExtractors: MEYDA_FEATURES,
      callback: (features) => this._onMeydaFrame(features),
    });

    this._meydaAnalyzer.start();
    this._isRunning = true;
  }

  /**
   * Stop recording and tear down the audio graph.
   */
  stop() {
    if (!this._isRunning) return;

    this._meydaAnalyzer?.stop();

    // Stop all mic tracks so the browser stops showing the recording indicator
    this._stream?.getTracks().forEach((t) => t.stop());

    this._audioContext?.close();

    this._meydaAnalyzer = null;
    this._source = null;
    this._analyserNode = null;
    this._stream = null;
    this._audioContext = null;
    this._isRunning = false;
  }

  /**
   * Returns the elapsed session time in milliseconds.
   * Returns 0 if the engine is not running.
   */
  getElapsedMs() {
    if (!this._isRunning || !this._audioContext) return 0;
    return (this._audioContext.currentTime - this._sessionStartTime) * 1000;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  /**
   * Called by Meyda ~86 times per second with the latest extracted features.
   * We augment with pitch (via our own autocorrelation) and speech detection,
   * then emit the complete FrameData to the consumer.
   *
   * @param {object} features - Meyda feature object
   */
  _onMeydaFrame(features) {
    if (!features || !this._isRunning) return;

    // Guard against Meyda returning null features during startup
    const rms = features.rms ?? 0;

    // Detect speech vs silence
    const isSpeech = rms > this._silenceThreshold;

    // Run pitch detection on the raw buffer from the AnalyserNode
    let f0 = null;
    if (isSpeech && this._analyserNode) {
      this._analyserNode.getFloatTimeDomainData(this._pitchBuffer);
      f0 = detectPitch(this._pitchBuffer, this._audioContext.sampleRate);
    }

    /**
     * FrameData shape — this is the contract between the engine and consumers.
     *
     * @typedef {object} FrameData
     * @property {number}      timestampMs       - Ms since session start
     * @property {boolean}     isSpeech          - True if above silence threshold
     * @property {number}      rms               - Vocal energy [0..1]
     * @property {number|null} spectralCentroid  - Voice brightness (Hz)
     * @property {number}      zcr               - Zero crossing rate [0..1]
     * @property {number[]}    mfcc              - 13 MFCC coefficients
     * @property {number|null} spectralFlux      - Spectral change rate
     * @property {number|null} f0                - Fundamental pitch (Hz), null if unvoiced
     */
    const frame = {
      timestampMs: this.getElapsedMs(),
      isSpeech,
      rms,
      spectralCentroid: features.spectralCentroid ?? null,
      zcr: features.zcr ?? 0,
      mfcc: features.mfcc ?? [],
      spectralFlux: features.spectralFlux ?? null,
      f0,
    };

    this._onFrame(frame);
  }
}