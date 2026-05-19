import styles from './ProcessingScreen.module.css';

const STEPS = [
  'mapping acoustic timeline',
  'computing baseline deviation',
  'detecting signal divergence',
  'surfacing unspoken moments',
];

export function ProcessingScreen() {
  return (
    <div className={styles.root}>
      <span className={styles.wordmark}>aura</span>

      <div className={styles.center}>
        <div className={styles.orbStill}>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle
              cx="60" cy="60" r="40"
              fill="none"
              stroke="var(--white-ghost)"
              strokeWidth="0.6"
            />
            <circle cx="60" cy="60" r="2" fill="var(--white-ghost)" />
          </svg>
        </div>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={styles.step}
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              <span className={styles.stepDot} />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}