import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Stable metric card ───────────────────────────────────────────────────────
// Label lives on its own line. Value lives on its own line in a fixed-height,
// fixed-width block so changing values never reflow surrounding layout.
function MetricCell({ label, value, unit, accent = false, dim = false, mono = false }) {
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

// ─── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ title, badge, children, style = {} }) {
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

// ─── Confidence bar ────────────────────────────────────────────────────────────
function ConfBar({ value }) {
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

// ─── Mini sparkline (canvas-based, stable 80×36 px) ──────────────────────────
function Sparkline({ data = [], color = '#63b3ed', height = 36, width = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';

    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [data, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', opacity: data.length < 2 ? 0.2 : 1 }}
    />
  );
}

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

function ExpressionPanel({ expression }) {
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

// ─── Log entry row ─────────────────────────────────────────────────────────────
function LogRow({ time, bpm }) {
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

const TIMES = 10;
let COUNT = 0;

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function RppgDashboard() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const wsRef     = useRef(null);
  const loopRef   = useRef(null);
  const accumulatorRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);

  // Each feature group in its own state slice — granular updates, no full re-render
  const [status,     setStatus]     = useState({ faceDetected: false, buffer: '0/150', motion_artifact: false });
  const [pulseRate,  setPulseRate]  = useState({ bpm: null, snr: null, confidence: 0, waveform: [] });
  const [hrv,        setHrv]        = useState({ rmssd: null, sdnn: null, confidence: 0 });
  const [breathing,  setBreathing]  = useState({ brpm: null, confidence: 0, upper_waveform: [], lower_waveform: [] });
  const [expression, setExpression] = useState({ label: 'neutral', confidence: 0, scores: {} });
  const [blink,      setBlink]      = useState({ count: 0, ear: null });
  const [talking,    setTalking]    = useState(false);
  const [logs,       setLogs]       = useState([]);

  // Sparkline history buffers (kept in refs — no re-render needed)
  const waveformHistory    = useRef([]);
  const upperBreathHistory = useRef([]);
  const lowerBreathHistory = useRef([]);
  const [waveformSnap,    setWaveformSnap]    = useState([]);
  const [upperBreathSnap, setUpperBreathSnap] = useState([]);
  const [lowerBreathSnap, setLowerBreathSnap] = useState([]);

  const handleMessage = useCallback((event) => {
    console.log('it is having a message');
    const d = JSON.parse(event.data);
    COUNT++;
    if (COUNT < TIMES ) console.log(d); 
    // setStatus({
    //   faceDetected: d.face_detected,
    //   buffer:       d.buffer_status,
    // });

    if (d.pulse_rate) {
      // setPulseRate(d.pulse_rate);
      if (typeof d.pulse_rate.bpm === 'number') {
        // setLogs(prev => [
        //   { time: new Date().toLocaleTimeString(), bpm: d.pulse_rate.bpm },
        //   ...prev.slice(0, 19),
        // ]);
        setLogs(prev => {
          const updated = [
            { time: new Date().toLocaleTimeString(), bpm: d.pulse_rate.bpm },
            ...prev,              // newest entry at top
          ];
          return updated.slice(0, 20);  // always trim to 20, dropping the oldest off the bottom
        });

        // Append latest waveform slice to sparkline history
        if (Array.isArray(d.pulse_rate.waveform) && d.pulse_rate.waveform.length) {
          waveformHistory.current = [
            ...waveformHistory.current,
            ...d.pulse_rate.waveform,
          ].slice(-120);
          setWaveformSnap([...waveformHistory.current]);
        }
      }
    }

    // if (d.hrv)        setHrv(d.hrv);
    // if (d.expression) setExpression(d.expression);
    // if (d.blink)      setBlink(d.blink);
    // if (typeof d.talking === 'boolean') setTalking(d.talking);

    if (d.breathing) {
      // setBreathing(d.breathing);
      if (d.breathing.upper_waveform?.length) {
        upperBreathHistory.current = [...upperBreathHistory.current, ...d.breathing.upper_waveform].slice(-90);
        setUpperBreathSnap([...upperBreathHistory.current]);
      }
      if (d.breathing.lower_waveform?.length) {
        lowerBreathHistory.current = [...lowerBreathHistory.current, ...d.breathing.lower_waveform].slice(-90);
        setLowerBreathSnap([...lowerBreathHistory.current]);
      }
    }
    accumulatorRef.current = d;
  }, []);

  const captureAndSendFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && wsRef.current?.readyState === WebSocket.OPEN) {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      wsRef.current.send(JSON.stringify({ image: canvas.toDataURL('image/jpeg', 0.7) }));
    }
    loopRef.current = setTimeout(() => requestAnimationFrame(captureAndSendFrame), 1000 / 30);
  }, []);

  const initWebSocket = useCallback(() => {
    // const ws = new WebSocket('ws://127.0.0.1:8007/ws/stream');
    const ws = new WebSocket('wss://aura-backend-py.onrender.com/ws/stream');
    wsRef.current = ws;

    ws.onopen = () => { console.log('it is open');
      setIsStreaming(true);
    };

    // ws.onmessage = (event) => {
    //   const d = JSON.parse(event.data);

    //   // Path 1 — always runs, every frame (waveforms need continuous data)
    //   if (Array.isArray(d.pulse_rate.waveform) &&  d.pulse_rate?.waveform?.length) {
    //     waveformHistory.current = [...waveformHistory.current, ...d.pulse_rate.waveform].slice(-120);
    //     setWaveformSnap([...waveformHistory.current]);   // still live
    //   }
    //   // ... same for upper/lower breath waveforms

    //   // Path 2 — just store the latest payload, don't setState yet
    //   accumulatorRef.current = d;
    // };
    ws.onmessage = handleMessage;

    ws.onclose = () => { console.log('it is closing');
      setIsStreaming(false);
      clearTimeout(loopRef.current);
    };
  }, [handleMessage]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640, 
          height: 480, 
          frameRate: { ideal: 30 },
          exposureMode: 'continuous',       // ask browser to auto-expose
          whiteBalanceMode: 'continuous',   // ask browser to auto white-balance
          focusMode: 'continuous',
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Start the capture loop only once the video is actually playing
        videoRef.current.onplay = () => {
          loopRef.current = requestAnimationFrame(captureAndSendFrame);
        };
      }
      initWebSocket();
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopPipeline = useCallback(() => {
    clearTimeout(loopRef.current);
    cancelAnimationFrame(loopRef.current);
    if (wsRef.current) wsRef.current.close();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsStreaming(false);
    setStatus({ faceDetected: false, buffer: '0/150', motion_artifact: false });
    setPulseRate({ bpm: null, snr: null, confidence: 0, waveform: [] });
    setHrv({ rmssd: null, sdnn: null, confidence: 0 });
    setBreathing({ brpm: null, confidence: 0, upper_waveform: [], lower_waveform: [] });
    setExpression({ label: 'neutral', confidence: 0, scores: {} });
    setBlink({ count: 0, ear: null });
    setTalking(false);
    waveformHistory.current    = [];
    upperBreathHistory.current = [];
    lowerBreathHistory.current = [];
    setWaveformSnap([]);
    setUpperBreathSnap([]);
    setLowerBreathSnap([]);
  }, []);

  useEffect(() => () => stopPipeline(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      const d = accumulatorRef.current;
      if (!d) return;

      setPulseRate(d.pulse_rate);
      setHrv(d.hrv);
      setBreathing(prev => {
        if (!d?.breathing) return prev; // Guard against empty data
        return {
          ...prev,
          ...d.breathing,
          out_of_frame: d.breathing.out_of_frame ?? prev.out_of_frame ?? false
        };
      });
      setExpression(d.expression);
      setBlink(d.blink);
      setTalking(d.talking);
      setStatus({ faceDetected: d.face_detected, buffer: d.buffer_status, motion_artifact: d.motion_artifact ?? false });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Google Fonts — DM Mono + Syne */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070d14; }

        /* Scanning line overlay on the video */
        .scan-overlay::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.07) 3px,
            rgba(0,0,0,0.07) 4px
          );
          pointer-events: none;
          border-radius: 10px;
        }

        .status-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #fc8181; display: inline-block;
        }
        .status-dot.live {
          background: #48bb78;
          box-shadow: 0 0 6px #48bb78;
          animation: pulse 1.8s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.45; }
        }
      `}</style>

      <div style={{
        padding: '24px',
        fontFamily: "'DM Mono', monospace",
        background: '#070d14',
        minHeight: '100vh',
        color: '#e2e8f0',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center'}}>
              <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" style={{ height: '36px' }}>
                <defs>
                  <linearGradient id="auraDarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor:'#00D4FF',stopOpacity:'1' }} />
                    <stop offset="100%" style={{ stopColor:'#FFFFFF',stopOpacity:'1' }} />
                  </linearGradient>
                </defs>
                <g fill="none" stroke="url(#auraDarkGradient)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 55 L35 15 L50 55 M28 42 L42 42" />
                  <path d="M50 55 Q55 55 58 50 L58 30 M58 30 L58 45 Q58 55 68 55 Q78 55 78 45 L78 30" />
                  <path d="M78 55 L88 55 L88 30 M88 30 L88 42 L100 42 Q112 42 112 30 Q112 18 100 18 L88 18 M100 42 L115 55" />
                  <path d="M115 55 C130 55 135 55 145 55 L155 55 L165 10 L185 70 L200 35 L215 55 L225 55" />
                  <path d="M168 45 L190 45" strokeWidth="4.5" />
                </g>
              </svg>
              <div style={{ height: '40px', width: '2px', background: '#fff' }} />
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '22px',
                fontWeight: '800',
                color: '#e2e8f0',
                letterSpacing: '-0.02em',
              }}>
                rPPG Telemetry
              </h1>
            </div>
            <p style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '0.1em', marginTop: '2px' }}>
              REMOTE PHOTOPLETHYSMOGRAPHY · LIVE SESSION
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-dot${isStreaming ? ' live' : ''}`} />
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: isStreaming ? '#48bb78' : '#fc8181' }}>
              {isStreaming ? 'STREAMING' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Main 2-column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '640px 1fr',
          gap: '16px',
          alignItems: 'start',
        }}>

          {/* ── Left col: video + log ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '8px' }}>

            {/* Video */}
            <div className="scan-overlay" style={{
              position: 'sticky',
              width: '640px',
              height: '480px',
              background: '#0a1520',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #1e2d3d',
              flexShrink: 0,
              top: '8px',
            }}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                width="640" height="480"
                style={{ display: 'block', transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />

              {/* Face / buffer status overlay */}
              <div style={{
                position: 'absolute',
                top: '12px', left: '12px',
                display: 'flex',
                gap: '8px',
              }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'rgba(7,13,20,0.75)',
                  border: `1px solid ${status.faceDetected ? '#48bb78' : '#fc8181'}`,
                  color: isStreaming && status.faceDetected ? '#48bb78' : '#fc8181',
                }}>
                  {isStreaming ? status.faceDetected ? 'FACE LOCKED' : 'SEARCHING' : 'DISCONNECTED'}
                </span>
                {isStreaming && (
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(7,13,20,0.75)',
                    border: '1px solid #1e2d3d',
                    color: '#4a7fa5',
                  }}>
                    BUF {status.buffer}
                  </span>
                )}
                {talking && (
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(7,13,20,0.75)',
                    border: '1px solid #ecc94b',
                    color: '#ecc94b',
                  }}>
                    TALKING
                  </span>
                )}
              </div>

              {!isStreaming && (
                <button
                  onClick={startCamera}
                  className="launch-button"
                >
                  LAUNCH STREAM
                </button>
              )}

              {isStreaming && (
                <button
                  onClick={stopPipeline}
                  className="end-button"
                >
                  DISCONNECT
                </button>
              )}
            </div>

            {/* BPM log */}
            <Panel title="Heart Rate Measurement Log" badge={`${logs.length} entries`} style={{ height: '220px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {logs.length === 0
                  ? <span style={{ fontSize: '10px', color: '#2d3748' }}>Awaiting signal lock…</span>
                  : logs.map((l, i) => <LogRow key={i} time={l.time} bpm={l.bpm} />)
                }
              </div>
            </Panel>
          </div>

          {/* ── Right col: metric panels ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>

            {/* Pulse rate */}
            <Panel title="Pulse Rate" badge={pulseRate.bpm ? 'ACTIVE' : 'COMPUTING'}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <MetricCell label="Heart Rate"  value={pulseRate.bpm}  unit="BPM" accent />
                <MetricCell label="SNR"         value={pulseRate.snr}  unit="×" />
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', color: '#718096' }}>
                    PPG Waveform
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    <Sparkline data={waveformSnap} color="#63b3ed" width={180} height={36} />
                  </div>
                </div>
              </div>
              {/* <ConfBar value={pulseRate.confidence} /> */}
              <ConfBar value={pulseRate.confidence} />
              {status.motion_artifact && (
                <div style={{
                  marginTop: '8px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'rgba(236,201,75,0.10)',
                  color: '#ecc94b',
                  border: '1px solid rgba(236,201,75,0.3)',
                  display: 'inline-block',
                }}>
                  ⚠ MOTION — hold still
                </div>
              )}
            </Panel>

            {/* HRV */}
            <Panel title="Heart Rate Variability">
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <MetricCell label="RMSSD" value={hrv.rmssd} unit="ms" mono />
                <MetricCell label="SDNN"  value={hrv.sdnn}  unit="ms" mono />
                <MetricCell label="Beats analysed" value={hrv.ibi_ms?.length ?? null} mono />
              </div>
              <ConfBar value={hrv.confidence} />
            </Panel>

            {/* Breathing */}
            <Panel title="Respiration">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <MetricCell label="Breathing Rate" value={breathing.brpm} unit="br/min" accent />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', color: '#718096' }}>
                      Upper chest
                    </span>
                    <div style={{ marginTop: '4px' }}>
                      <Sparkline data={upperBreathSnap} color="#9f7aea" width={180} height={28} />
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', color: '#718096' }}>
                      Lower abdomen
                    </span>
                    <div style={{ marginTop: '4px' }}>
                      <Sparkline data={lowerBreathSnap} color="#68d391" width={180} height={28} />
                    </div>
                  </div>
                </div>
              </div>
              <ConfBar value={breathing.confidence} />
              {breathing.out_of_frame && (
                <div style={{
                  marginTop: '8px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.1em',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'rgba(113,128,150,0.10)',
                  color: '#718096',
                  border: '1px solid rgba(113,128,150,0.3)',
                  display: 'inline-block',
                }}>
                  NO CHEST IN FRAME — move camera back
                </div>
              )}
            </Panel>

            {/* Expression */}
            <Panel title="Facial Expression">
              <ExpressionPanel expression={expression} />
            </Panel>

            {/* Eye blink + talking */}
            <Panel title="Face Analysis">
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <MetricCell label="Blink Count" value={blink.count} mono />
                <MetricCell label="EAR" value={blink.ear} mono />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', color: '#718096' }}>
                    Talking
                  </span>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '11px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      background: talking ? 'rgba(236,201,75,0.12)' : 'rgba(255,255,255,0.04)',
                      color: talking ? '#ecc94b' : '#4a5568',
                      border: `1px solid ${talking ? '#ecc94b' : '#1e2d3d'}`,
                      transition: 'all 0.2s ease',
                      minWidth: '52px',    // fixed so YES/NO never resizes
                      textAlign: 'center',
                      display: 'inline-block',
                    }}>
                      {talking ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>
            </Panel>

          </div>
        </div>
      </div>
    </>
  );
}