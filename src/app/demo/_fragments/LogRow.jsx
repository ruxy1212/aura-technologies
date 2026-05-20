export default function LogRow({ time, bpm }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '80px 1fr',   // fixed columns — values never shift
      gap: '8px',
      padding: '5px 0',
      borderBottom: '1px solid #0f1923',
      alignItems: 'center',
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        color: '#4a5568',
      }}>
        {time}
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        color: '#63b3ed',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {bpm} BPM
      </span>
    </div>
  );
}