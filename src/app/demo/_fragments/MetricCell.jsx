// ─── Stable metric card ───────────────────────────────────────────────────────
// Label lives on its own line. Value lives on its own line in a fixed-height,
// fixed-width block so changing values never reflow surrounding layout.
export default function MetricCell({ label, value, unit, accent = false, dim = false, mono = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      minWidth: 0,
    }}>
      <span style={{
        fontSize: '10px',
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: dim ? '#4a5568' : '#718096',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '4px',
        height: '36px',          // fixed height — value font change never shifts rows
        // alignItems: 'center',
      }}>
        <span style={{
          fontFamily: mono ? "'DM Mono', monospace" : "'Syne', sans-serif",
          fontSize: accent ? '28px' : '22px',
          fontWeight: accent ? '800' : '600',
          color: accent ? '#63b3ed' : (dim ? '#4a5568' : '#e2e8f0'),
          lineHeight: 1,
          minWidth: accent ? '72px' : '48px',   // fixed width prevents layout shift
          display: 'inline-block',
          tabularNums: 'tabular-nums',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value ?? '—'}
        </span>
        {unit && (
          <span style={{
            fontSize: '11px',
            fontFamily: "'DM Mono', monospace",
            color: '#4a5568',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}