import styles from './EcgLine.module.css';

// A single animated ECG trace used on the login screen.
// Pure SVG + CSS animation — no JS timers.
export default function EcgLine({ width = 420, height = 60, color }) {
  // The ECG path: flatline → P wave → QRS complex → T wave → flatline
  const path =
    'M0,30 L80,30 L90,28 L95,32 L100,30 ' +
    'L110,30 L115,5 L120,55 L125,30 L135,22 L145,30 ' +
    'L155,30 L162,24 L170,30 L180,30 ' +
    'L260,30 L270,28 L275,32 L280,30 ' +
    'L290,30 L295,5 L300,55 L305,30 L315,22 L325,30 ' +
    'L335,30 L342,24 L350,30 L420,30';

  return (
    <svg
      className={styles.ecg}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ecgFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color ?? 'var(--signal)'} stopOpacity="0" />
          <stop offset="20%"  stopColor={color ?? 'var(--signal)'} stopOpacity="0.8" />
          <stop offset="70%"  stopColor={color ?? 'var(--signal)'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color ?? 'var(--signal)'} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Glow duplicate */}
      <path
        d={path}
        fill="none"
        stroke={color ?? 'var(--signal)'}
        strokeWidth="3"
        strokeOpacity="0.25"
        filter="url(#blur)"
        className={styles.trace}
      />
      <filter id="blur">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      {/* Main trace */}
      <path
        d={path}
        fill="none"
        stroke="url(#ecgFade)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.trace}
      />
    </svg>
  );
}