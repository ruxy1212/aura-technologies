import ConfBar from "./ConfBar";

// ─── Expression label + score bar ─────────────────────────────────────────────
const EXPRESSION_COLORS = {
  happiness: '#48bb78',
  surprise:  '#ecc94b',
  fear:      '#fc8181',
  anger:     '#f56565',
  sadness:   '#63b3ed',
  disgust:   '#9f7aea',
  contempt:  '#ed8936',
  neutral:   '#718096',
};

export default function ExpressionPanel({ expression }) {
  const label = expression?.label ?? 'neutral';
  const confidence = expression?.confidence ?? 0;
  const scores = expression?.scores ?? {};
  const accent = EXPRESSION_COLORS[label] ?? '#718096';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '22px',
          fontWeight: '700',
          color: accent,
          minWidth: '120px',          // fixed width — label swap never shifts layout
          display: 'inline-block',
          transition: 'color 0.3s ease',
          textTransform: 'capitalize',
        }}>
          {label}
        </span>
        <ConfBar value={confidence} />
      </div>

      {/* All 8 emotion scores as fixed-layout mini bars */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '5px 16px',
      }}>
        {['happiness','sadness','anger','fear','surprise','disgust','contempt','neutral'].map(emo => (
          <div key={emo} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              color: '#4a5568',
              width: '58px',          // fixed column — names never wrap
              flexShrink: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {emo.slice(0, 7)}
            </span>
            <div style={{
              flex: 1,
              height: '3px',
              background: '#1a2a3a',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.round((scores[emo] ?? 0) * 100)}%`,
                height: '100%',
                background: EXPRESSION_COLORS[emo],
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              color: '#4a5568',
              width: '24px',          // fixed width for "0.00" values
              textAlign: 'right',
              flexShrink: 0,
            }}>
              {((scores[emo] ?? 0) * 100).toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}