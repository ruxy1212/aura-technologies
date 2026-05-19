import styles from './StartScreen.module.css';

export function StartScreen({ onStart, isRequesting }) {
  return (
    <div className={styles.root}>
      <div className={styles.wordmark}>
        <span className={styles.word}>aura</span>
        <span className={styles.tagline}>voice pattern analysis</span>
      </div>

      <div className={styles.center}>
        <p className={styles.prompt}>
          speak for sixty seconds.<br />
          <em>say anything.</em>
        </p>

        <button
          className={styles.button}
          onClick={onStart}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <span className={styles.requesting}>allowing microphone…</span>
          ) : (
            <span>begin session</span>
          )}
        </button>
      </div>

      <div className={styles.footnote}>
        your voice never leaves this device until the session ends
      </div>
    </div>
  );
}