import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./_fragments/Header";
import VideoContainer from "./_fragments/VideoContainer";
import Panel from "./_fragments/Panel";
import LogRow from "./_fragments/LogRow";
import MetricCell from "./_fragments/MetricCell";
import Sparkline from "./_fragments/Sparkline";
import ConfBar from "./_fragments/ConfBar";
import ExpressionPanel from "./_fragments/ExpressionPanel";

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
    const d = JSON.parse(event.data);

    if (d.pulse_rate) {
      if (typeof d.pulse_rate.bpm === 'number') {
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

    if (d.breathing) {
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
    // const ws = new WebSocket('ws://127.0.0.1:8007/ws/stream'); //for local
    const ws = new WebSocket('wss://aura-backend-py.onrender.com/ws/stream');
    wsRef.current = ws;

    ws.onopen = () => { console.log('it is open');
      setIsStreaming(true);
    };

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
        <Header isStreaming={isStreaming} />

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
            <VideoContainer isStreaming={isStreaming} videoRef={videoRef} canvasRef={canvasRef} status={status} talking={talking} startCamera={startCamera} stopPipeline={stopPipeline} />

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