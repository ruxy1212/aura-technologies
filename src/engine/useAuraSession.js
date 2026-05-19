/**
 * useAuraSession — React hook
 *
 * Orchestrates the three engine layers into a single, clean interface
 * for React components. Manages session state machine:
 *
 *   idle → requesting → recording → processing → complete → idle
 *
 * Components only interact with this hook. They never touch the engine directly.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { AudioEngine } from './audioEngine';
import { SignalProcessor } from './signalProcessor';
import { TranscriptCollector } from './transcriptCollector';
import { analyzeWithGemini } from './geminiAnalysis';

// Session duration in ms
const SESSION_DURATION_MS = 60_000;

/**
 * @typedef {'idle'|'requesting'|'recording'|'processing'|'complete'|'error'} SessionState
 */

/**
 * @typedef {object} AuraSession
 * @property {SessionState} state            - Current session state
 * @property {number}       elapsedMs        - Ms elapsed in current session
 * @property {number}       rmsLevel         - Current RMS for the pulse indicator [0..1]
 * @property {boolean}      isSpeech         - Whether voice is currently detected
 * @property {object|null}  report           - SignalProcessor report (after session ends)
 * @property {object[]}     unspokenMoments  - Gemini's findings (after processing)
 * @property {string|null}  error            - User-readable error message
 * @property {function}     startSession     - Call to begin recording
 * @property {function}     stopSession      - Call to end recording early
 */

export function useAuraSession() {
  const [state, setState] = useState('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [rmsLevel, setRmsLevel] = useState(0);
  const [spectralCentroid, setSpectralCentroid] = useState(null);
  const [isSpeech, setIsSpeech] = useState(false);
  const [report, setReport] = useState(null);
  const [unspokenMoments, setUnspokenMoments] = useState([]);
  const [error, setError] = useState(null);

  // Engine refs — these are not React state because they don't need to
  // trigger re-renders. Only their outputs (the state above) trigger renders.
  const engineRef = useRef(null);
  const processorRef = useRef(null);
  const transcriptRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedTimerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.stop();
      transcriptRef.current?.stop();
      clearTimeout(timerRef.current);
      clearInterval(elapsedTimerRef.current);
    };
  }, []);

  /**
   * Called internally when the session ends (either naturally at 60s or manually).
   */
  const endSession = useCallback(async () => {
    clearTimeout(timerRef.current);
    clearInterval(elapsedTimerRef.current);

    // Stop collectors
    engineRef.current?.stop();
    transcriptRef.current?.stop();

    setState('processing');

    // Compute the report
    const segments = transcriptRef.current?.getSegments() ?? [];
    const sessionReport = processorRef.current?.computeReport(segments);
    setReport(sessionReport);

    // Send to Gemini
    try {
      const moments = await analyzeWithGemini(sessionReport);
      setUnspokenMoments(moments);
      setState('complete');
    } catch (err) {
      console.error('Gemini analysis failed:', err);
      // Don't block the user from seeing results — just show without AI layer
      setUnspokenMoments([]);
      setState('complete');
    }
  }, []);

  /**
   * Start a new session.
   */
  const startSession = useCallback(async () => {
    if (state !== 'idle') return;

    setError(null);
    setReport(null);
    setUnspokenMoments([]);
    setElapsedMs(0);
    setState('requesting');

    // Create fresh instances
    const processor = new SignalProcessor();
    processorRef.current = processor;

    const engine = new AudioEngine({
      onFrame: (frame) => {
        // Update live UI indicators
        setRmsLevel(frame.rms);
        setSpectralCentroid(frame.spectralCentroid);
        setIsSpeech(frame.isSpeech);
        // Feed into signal processor
        processor.ingest(frame);
      },
      onError: (msg) => {
        setError(msg);
        setState('error');
      },
    });
    engineRef.current = engine;

    try {
      await engine.start();
    } catch {
      // onError already called inside engine.start()
      return;
    }

    // Start transcript collector (non-fatal if unsupported)
    const transcript = new TranscriptCollector({
      getElapsedMs: () => engine.getElapsedMs(),
      onSegment: () => {}, // segments collected on session end
      onError: (msg) => console.warn('Transcript:', msg), // non-fatal
    });
    transcriptRef.current = transcript;
    transcript.start();

    setState('recording');

    // Update elapsed time display every 100ms
    const startTime = Date.now();
    elapsedTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      if (elapsed >= SESSION_DURATION_MS) {
        clearInterval(elapsedTimerRef.current);
      }
    }, 100);

    // Auto-end after SESSION_DURATION_MS
    timerRef.current = setTimeout(() => {
      endSession();
    }, SESSION_DURATION_MS);
  }, [state, endSession]);

  /**
   * Manually end the session early.
   */
  const stopSession = useCallback(() => {
    if (state !== 'recording') return;
    endSession();
  }, [state, endSession]);

  /**
   * Reset back to idle.
   */
  const reset = useCallback(() => {
    engineRef.current?.stop();
    transcriptRef.current?.stop();
    clearTimeout(timerRef.current);
    clearInterval(elapsedTimerRef.current);
    processorRef.current = null;
    engineRef.current = null;
    transcriptRef.current = null;
    setReport(null);
    setUnspokenMoments([]);
    setError(null);
    setElapsedMs(0);
    setRmsLevel(0);
    setIsSpeech(false);
    setState('idle');
  }, []);

  return {
    state,
    elapsedMs,
    rmsLevel,
    spectralCentroid,
    isSpeech,
    report,
    unspokenMoments,
    error,
    startSession,
    stopSession,
    reset,
    sessionDurationMs: SESSION_DURATION_MS,
  };
}