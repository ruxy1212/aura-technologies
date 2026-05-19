/**
 * App.jsx — Root component
 *
 * Owns the session hook and routes between the four screens based on state:
 *   idle        → StartScreen
 *   requesting  → StartScreen (button disabled)
 *   recording   → RecordingScreen
 *   processing  → ProcessingScreen
 *   complete    → ResultsScreen
 *   error       → ErrorScreen (inline)
 */

import { useAuraSession } from './engine/useAuraSession';
import { StartScreen }     from './components/StartScreen';
import { RecordingScreen } from './components/RecordingScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultsScreen }   from './components/ResultsScreen';
import styles from './App.module.css';

export default function App() {
  const {
    state,
    elapsedMs,
    sessionDurationMs,
    rmsLevel,
    spectralCentroid,
    isSpeech,
    report,
    unspokenMoments,
    error,
    startSession,
    stopSession,
    reset,
  } = useAuraSession();

  return (
    <div className={styles.shell}>
      {/* ── Idle / requesting ── */}
      {(state === 'idle' || state === 'requesting') && (
        <StartScreen
          onStart={startSession}
          isRequesting={state === 'requesting'}
        />
      )}

      {/* ── Recording ── */}
      {state === 'recording' && (
        <RecordingScreen
          elapsedMs={elapsedMs}
          sessionDurationMs={sessionDurationMs}
          rmsLevel={rmsLevel}
          spectralCentroid={spectralCentroid}
          isSpeech={isSpeech}
          onStop={stopSession}
        />
      )}

      {/* ── Processing ── */}
      {state === 'processing' && (
        <ProcessingScreen />
      )}

      {/* ── Complete ── */}
      {state === 'complete' && (
        <ResultsScreen
          report={report}
          unspokenMoments={unspokenMoments}
          onReset={reset}
        />
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div className={styles.error}>
          <span className={styles.errorWordmark}>aura</span>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.errorBtn} onClick={reset}>
            try again
          </button>
        </div>
      )}
    </div>
  );
}