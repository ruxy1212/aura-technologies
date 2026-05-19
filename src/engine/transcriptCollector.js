/**
 * Aura Transcript Collector
 *
 * Wraps the Web Speech API (SpeechRecognition) to produce timestamped
 * transcript segments that align with the acoustic timeline.
 *
 * Key design decisions:
 *  - We use continuous recognition mode so it doesn't stop after a pause
 *  - We record only final (not interim) results to avoid double-counting
 *  - Each segment gets a startMs/endMs relative to session start
 *  - The session clock is provided externally (from AudioEngine.getElapsedMs)
 *    so both systems share the same time reference
 */

export class TranscriptCollector {
  /**
   * @param {object}   options
   * @param {function} options.getElapsedMs  - Returns current session time in ms
   * @param {function} options.onSegment     - Called with a new TranscriptSegment
   * @param {function} options.onError       - Called with a user-readable error string
   * @param {string}  [options.language]     - BCP-47 language tag, default 'en-US'
   */
  constructor({ getElapsedMs, onSegment, onError, language = 'en-US' }) {
    this._getElapsedMs = getElapsedMs;
    this._onSegment = onSegment;
    this._onError = onError;
    this._language = language;

    this._recognition = null;
    this._isRunning = false;
    this._segments = [];

    // Track when each recognition result started
    // (SpeechRecognition doesn't give us start times, so we record the
    //  timestamp when the previous result ended as the start of the next)
    this._lastSegmentEndMs = 0;
  }

  /**
   * Check if the browser supports SpeechRecognition.
   * @returns {boolean}
   */
  static isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Start continuous speech recognition.
   */
  start() {
    if (this._isRunning) return;

    if (!TranscriptCollector.isSupported()) {
      // Not a fatal error — the app still works, just without transcript
      this._onError('Speech recognition not supported in this browser. Transcript unavailable.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    this._recognition = new SpeechRecognition();
    this._recognition.continuous = true;
    this._recognition.interimResults = false; // final results only
    this._recognition.lang = this._language;
    this._recognition.maxAlternatives = 1;

    this._recognition.onresult = (event) => {
      // Process only newly arrived results (event.resultIndex onwards)
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) continue;

        const text = result[0].transcript.trim();
        if (!text) continue;

        const endMs = this._getElapsedMs();
        // Estimate start as where the last segment ended
        // (this is an approximation — SpeechRecognition gives no start time)
        const startMs = this._lastSegmentEndMs;
        this._lastSegmentEndMs = endMs;

        /**
         * @typedef {object} TranscriptSegment
         * @property {string} text    - The recognized text
         * @property {number} startMs - Estimated start of this utterance (ms)
         * @property {number} endMs   - When this result was finalized (ms)
         */
        const segment = { text, startMs, endMs };
        this._segments.push(segment);
        this._onSegment(segment);
      }
    };

    this._recognition.onerror = (event) => {
      // 'no-speech' is expected during pauses — not an error
      if (event.error === 'no-speech') return;
      this._onError(`Speech recognition error: ${event.error}`);
    };

    this._recognition.onend = () => {
      // SpeechRecognition stops after silence or network issues.
      // Restart automatically if we're still supposed to be running.
      if (this._isRunning) {
        try {
          this._recognition.start();
        } catch {
          // Ignore — can throw if called too quickly after stop
        }
      }
    };

    this._recognition.start();
    this._isRunning = true;
  }

  /**
   * Stop recognition.
   */
  stop() {
    if (!this._isRunning) return;
    this._isRunning = false;
    try {
      this._recognition?.stop();
    } catch {
      // Ignore errors on stop
    }
    this._recognition = null;
  }

  /**
   * Return all collected segments so far.
   * @returns {TranscriptSegment[]}
   */
  getSegments() {
    return [...this._segments];
  }

  /**
   * Reset all collected segments.
   */
  reset() {
    this._segments = [];
    this._lastSegmentEndMs = 0;
  }
}