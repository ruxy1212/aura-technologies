// ─── Confidence bar ────────────────────────────────────────────────────────────
export default function ConfBar({ value }) {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct > 70 ? '#48bb78' : pct > 40 ? '#ecc94b' : '#fc8181';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
      <div style={{
        flex: 1,
        height: '3px',
        background: '#1a2a3a',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: '2px',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        color: color,
        minWidth: '30px',
        textAlign: 'right',
      }}>
        {pct}%
      </span>
    </div>
  );
}