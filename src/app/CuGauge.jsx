import styles from './CuGauge.module.css';

export default function CuGauge({ remaining, total }) {
  const pct     = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const used    = total - remaining;
  const usedPct = Math.round((used / total) * 100);

  // SVG ring
  const r          = 42;
  const cx         = 54;
  const cy         = 54;
  const circumf    = 2 * Math.PI * r;
  const dashOffset = circumf * (1 - pct);

  const color =
    pct > 0.5 ? 'var(--signal)' :
    pct > 0.2 ? 'var(--amber)'  : 'var(--red)';

  const glowColor =
    pct > 0.5 ? 'rgba(0,255,140,0.4)' :
    pct > 0.2 ? 'rgba(245,166,35,0.4)' : 'rgba(255,77,77,0.4)';

  return (
    <div className={styles.root}>
      <div className={styles.ring}>
        <svg width="108" height="108" viewBox="0 0 108 108">
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--border-mid)"
            strokeWidth="6"
          />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumf}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 6px ${glowColor})`, transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s' }}
          />
          {/* Centre text */}
          <text x={cx} y={cy - 6} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="15" fontWeight="600"
            fill={color}>
            {Math.round(remaining).toLocaleString()}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="8"
            fill="var(--text-dim)" letterSpacing="1">
            CU LEFT
          </text>
        </svg>
      </div>

      <div className={styles.details}>
        <div className={styles.row}>
          <span className={styles.dimLabel}>USED</span>
          <span className={styles.val} style={{ color }}>
            {Math.round(used).toLocaleString()} / {total.toLocaleString()}
          </span>
        </div>
        <div className={styles.barTrack}>
          <div
            className={styles.barFill}
            style={{
              width: `${usedPct}%`,
              background: color,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        </div>
        <div className={styles.row}>
          <span className={styles.dimLabel}>CONSUMED</span>
          <span className={styles.val}>{usedPct}%</span>
        </div>
      </div>
    </div>
  );
}