// ─── Panel wrapper ─────────────────────────────────────────────────────────────
export default function Panel({ title, badge, children, style = {} }) {
  return (
    <div style={{
      background: '#0f1923',
      border: '1px solid #1e2d3d',
      borderRadius: '10px',
      padding: '16px 18px',
      ...style,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#4a7fa5',
        }}>
          {title}
        </span>
        {badge && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: '4px',
            background: '#0d2137',
            color: '#4a7fa5',
            border: '1px solid #1e2d3d',
          }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}