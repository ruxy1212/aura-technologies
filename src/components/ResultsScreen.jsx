import { useMemo } from 'react';
import styles from './ResultsScreen.module.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

/** Map a 0–1 score to a CSS color using our palette */
function scoreToColor(score) {
  if (score < 0.15) return 'var(--white-ghost)';
  if (score < 0.30) return '#5a5450';
  if (score < 0.50) return 'var(--white-dim)';
  if (score < 0.70) return 'var(--amber-dim)';
  return 'var(--amber)';
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, color = 'var(--white-dim)', height = 32 }) {
  if (!values?.length) return <div style={{ height }} />;

  const max = Math.max(...values, 0.001);
  const w = 140;
  const h = height;
  const step = w / (values.length - 1 || 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * h * 0.85;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Signal Card ─────────────────────────────────────────────────────────────

function SignalCard({ label, value, unit, sparkValues, color, delay = 0 }) {
  return (
    <div className={styles.signalCard} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.signalLabel}>{label}</div>
      <div className={styles.signalValue} style={{ color }}>
        {value !== null && value !== undefined ? (
          <>{typeof value === 'number' ? value.toFixed(1) : value}<span className={styles.signalUnit}>{unit}</span></>
        ) : (
          <span style={{ color: 'var(--white-ghost)' }}>—</span>
        )}
      </div>
      <Sparkline values={sparkValues} color={color} />
    </div>
  );
}

// ─── Unspoken Moment Card ────────────────────────────────────────────────────

function UnspokenMoment({ moment, index }) {
  return (
    <div
      className={styles.momentCard}
      style={{ animationDelay: `${0.8 + index * 0.35}s` }}
    >
      <div className={styles.momentTimestamp}>{formatMs(moment.timestampMs)}</div>
      <div className={styles.momentText}>"{moment.text}"</div>
      <div className={styles.momentSignal}>{moment.signal}</div>
      <div className={styles.momentObservation}>{moment.observation}</div>
    </div>
  );
}

// ─── Aura Timeline ───────────────────────────────────────────────────────────

function AuraTimeline({ acousticTimeline, sessionDurationMs, unspokenMoments }) {
  if (!acousticTimeline?.length) return null;

  const W = 600;
  const H = 48;

  const segments = acousticTimeline.map((w, i) => {
    const [start, end] = w.windowMs;
    const x = (start / sessionDurationMs) * W;
    const width = Math.max(((end - start) / sessionDurationMs) * W - 1, 1);
    const opacity = 0.15 + w.avgDeviationScore * 0.85;
    const fill = scoreToColor(w.avgDeviationScore);

    return { x, width, opacity, fill, key: i, window: w };
  });

  const momentMarkers = (unspokenMoments || []).map((m) => ({
    x: (m.timestampMs / sessionDurationMs) * W,
    key: m.timestampMs,
  }));

  return (
    <div className={styles.timelineWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.timelineSvg}>
        {/* Background track */}
        <rect x={0} y={H / 2 - 1} width={W} height={1} fill="var(--white-ghost)" />

        {/* Deviation segments */}
        {segments.map((s) => (
          <rect
            key={s.key}
            x={s.x}
            y={H / 2 - 8}
            width={s.width}
            height={16}
            fill={s.fill}
            opacity={s.opacity}
            rx={1}
            className={styles.timelineSegment}
            style={{ animationDelay: `${s.key * 0.04}s` }}
          />
        ))}

        {/* Unspoken moment markers */}
        {momentMarkers.map((m) => (
          <g key={m.key}>
            <line
              x1={m.x} y1={0}
              x2={m.x} y2={H}
              stroke="var(--amber)"
              strokeWidth="1"
              opacity="0.8"
              strokeDasharray="2 2"
            />
            <circle cx={m.x} cy={H / 2} r={3} fill="var(--amber)" opacity="0.9" />
          </g>
        ))}
      </svg>

      {/* Time labels */}
      <div className={styles.timelineLabels}>
        <span>00:00</span>
        <span>{formatMs(sessionDurationMs / 2)}</span>
        <span>{formatMs(sessionDurationMs)}</span>
      </div>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

export function ResultsScreen({ report, unspokenMoments, onReset }) {
  const { acousticTimeline = [], baseline, sessionDurationMs = 60000, transcriptSegments = [] } = report || {};

  // Extract sparkline data from the acoustic timeline
  const rmsValues = useMemo(
    () => acousticTimeline.map((w) => w.avgRms ?? 0),
    [acousticTimeline]
  );

  const jitterValues = useMemo(
    () => acousticTimeline.map((w) => w.jitter ?? 0),
    [acousticTimeline]
  );

  const speechDensityValues = useMemo(
    () => acousticTimeline.map((w) => w.speechDensity ?? 0),
    [acousticTimeline]
  );

  const deviationValues = useMemo(
    () => acousticTimeline.map((w) => w.avgDeviationScore ?? 0),
    [acousticTimeline]
  );

  const hasUnspoken = unspokenMoments?.length > 0;

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.wordmark}>aura</span>
        <button className={styles.resetBtn} onClick={onReset}>new session</button>
      </div>

      <div className={styles.body}>

        {/* Section: Timeline */}
        <section className={styles.section} style={{ animationDelay: '0.1s' }}>
          <div className={styles.sectionLabel}>acoustic map</div>
          <AuraTimeline
            acousticTimeline={acousticTimeline}
            sessionDurationMs={sessionDurationMs}
            unspokenMoments={unspokenMoments}
          />
          <div className={styles.timelineLegend}>
            <span><span className={styles.legendDot} style={{ background: 'var(--white-ghost)' }} />calm</span>
            <span><span className={styles.legendDot} style={{ background: 'var(--white-dim)' }} />active</span>
            <span><span className={styles.legendDot} style={{ background: 'var(--amber)' }} />unspoken moment</span>
          </div>
        </section>

        {/* Section: Signal Cards */}
        <section className={styles.section} style={{ animationDelay: '0.3s' }}>
          <div className={styles.sectionLabel}>signal readings</div>
          <div className={styles.signalGrid}>
            <SignalCard
              label="vocal energy"
              value={baseline?.rms != null ? baseline.rms * 100 : null}
              unit=" avg"
              sparkValues={rmsValues}
              color="var(--white-dim)"
              delay={0.35}
            />
            <SignalCard
              label="pitch stability"
              value={jitterValues.length ? (1 - Math.min(jitterValues.reduce((a,b)=>a+b,0)/jitterValues.length, 1)) * 100 : null}
              unit="%"
              sparkValues={jitterValues.map(v => 1 - v)}
              color="var(--white-dim)"
              delay={0.45}
            />
            <SignalCard
              label="speech density"
              value={speechDensityValues.length ? speechDensityValues.reduce((a,b)=>a+b,0)/speechDensityValues.length * 100 : null}
              unit="%"
              sparkValues={speechDensityValues}
              color="var(--white-dim)"
              delay={0.55}
            />
            <SignalCard
              label="deviation index"
              value={deviationValues.length ? deviationValues.reduce((a,b)=>a+b,0)/deviationValues.length * 100 : null}
              unit=""
              sparkValues={deviationValues}
              color={deviationValues.reduce((a,b)=>a+b,0)/Math.max(deviationValues.length,1) > 0.3 ? 'var(--amber)' : 'var(--white-dim)'}
              delay={0.65}
            />
          </div>
        </section>

        {/* Section: Unspoken Moments */}
        <section className={styles.section} style={{ animationDelay: '0.6s' }}>
          <div className={styles.sectionLabel}>
            unspoken moments
            <span className={styles.sectionCount}>
              {hasUnspoken ? unspokenMoments.length : '0'} detected
            </span>
          </div>

          {hasUnspoken ? (
            <div className={styles.moments}>
              {unspokenMoments.map((m, i) => (
                <UnspokenMoment key={m.timestampMs} moment={m} index={i} />
              ))}
            </div>
          ) : (
            <div className={styles.noMoments}>
              your voice and words were in agreement throughout this session.
            </div>
          )}
        </section>

        {/* Section: Transcript */}
        {transcriptSegments?.length > 0 && (
          <section className={styles.section} style={{ animationDelay: '0.8s' }}>
            <div className={styles.sectionLabel}>session transcript</div>
            <div className={styles.transcript}>
              {transcriptSegments.map((seg, i) => (
                <span
                  key={i}
                  className={styles.transcriptSeg}
                  style={{
                    color: seg.acousticIntensityScore > 0.4
                      ? 'var(--amber-dim)'
                      : seg.acousticIntensityScore > 0.25
                      ? 'var(--white-dim)'
                      : 'var(--white-ghost)',
                  }}
                >
                  {seg.text}{' '}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className={styles.disclaimer}>
          aura measures acoustic patterns only. this is not medical advice.
        </div>
      </div>
    </div>
  );
}