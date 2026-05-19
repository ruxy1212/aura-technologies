import { AuraOrb } from './AuraOrb';
import styles from './RecordingScreen.module.css';

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function RecordingScreen({
  elapsedMs,
  sessionDurationMs,
  rmsLevel,
  spectralCentroid,
  isSpeech,
  onStop,
}) {
  const remainingMs = Math.max(0, sessionDurationMs - elapsedMs);
  const progress = Math.min(elapsedMs / sessionDurationMs, 1);

  return (
    <div className={styles.root}>

      {/* Top — wordmark only */}
      <div className={styles.top}>
        <span className={styles.wordmark}>aura</span>
        <span className={styles.status}>
          {isSpeech ? 'listening' : 'waiting'}
        </span>
      </div>

      {/* Center — the orb */}
      <div className={styles.orbWrap}>
        <div className={styles.prompt}>
          tell me about something<br />
          <em>that's been on your mind</em>
        </div>

        <AuraOrb
          rmsLevel={rmsLevel}
          spectralCentroid={spectralCentroid}
          isSpeech={isSpeech}
          state="recording"
        />

        {/* Progress ring around the orb */}
        <svg className={styles.progressRing} viewBox="0 0 320 320">
          <circle
            cx="160" cy="160" r="148"
            fill="none"
            stroke="var(--white-ghost)"
            strokeWidth="0.5"
          />
          <circle
            cx="160" cy="160" r="148"
            fill="none"
            stroke="var(--white-dim)"
            strokeWidth="0.5"
            strokeDasharray={`${2 * Math.PI * 148}`}
            strokeDashoffset={`${2 * Math.PI * 148 * (1 - progress)}`}
            strokeLinecap="round"
            transform="rotate(-90 160 160)"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
      </div>

      {/* Bottom — timer + stop */}
      <div className={styles.bottom}>
        <div className={styles.timer}>
          <span className={styles.timerLabel}>remaining</span>
          <span className={styles.timerValue}>{formatTime(remainingMs)}</span>
        </div>

        <button className={styles.stopBtn} onClick={onStop}>
          end session early
        </button>
      </div>

    </div>
  );
}