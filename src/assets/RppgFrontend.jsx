import { useEffect, useRef, useState } from 'react';

export default function RppgLiveDashboard() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const loopRef = useRef(null);

  const [metrics, setMetrics] = useState({ bpm: 'Disconnected', faceDetected: false, buffer: '0/150' });
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Initialize Web Camera Stream access 
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 30 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      initWebSocket();
    } catch (err) {
      console.error("Error connecting to hardware camera stream: ", err);
    }
  };

  // Wire up our persistent low-latency WebSockets communications pipeline
  const initWebSocket = () => {
    const ws = new WebSocket('ws://127.0.0.1:8006/ws/stream');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsStreaming(true);
      console.log('Connected to backend telemetry system.');
      // Start processing loops once connection handshakes settle cleanly
      loopRef.current = requestAnimationFrame(captureAndSendFrame);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMetrics({
        bpm: data.bpm,
        faceDetected: data.face_detected,
        buffer: data.buffer_status
      });

      // Maintain a clean log profile of real-time measurements if a reading exists
      if (typeof data.bpm === 'number') {
        setLogs((prev) => [
          { time: new Date().toLocaleTimeString(), bpm: data.bpm },
          ...prev.slice(0, 19), // Pin history buffer array to latest 20 measurements
        ]);
      }
    };

    ws.onclose = () => {
      setIsStreaming(false);
      cancelAnimationFrame(loopRef.current);
      console.log('Telemetry link severed.');
    };
  };

  // Capture canvas snapshots from running element matrices and forward out down WS
  const captureAndSendFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && wsRef.current?.readyState === WebSocket.OPEN) {
      const ctx = canvas.getContext('2d');
      // Render structural viewport snapshot inside hidden canvas component layers
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert layout to compression parameters standard 
      const base64Frame = canvas.toDataURL('image/jpeg', 0.7);
      
      wsRef.current.send(JSON.stringify({ image: base64Frame }));
    }
    
    // Recurse at roughly 30 ticks per second based on operational thread timing
    loopRef.current = setTimeout(() => {
      requestAnimationFrame(captureAndSendFrame);
    }, 1000 / 30); 
  };

  const stopPipeline = () => {
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      cancelAnimationFrame(loopRef.current);
    }
    if (wsRef.current) wsRef.current.close();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsStreaming(false);
    setMetrics({ bpm: 'Disconnected', faceDetected: false, buffer: '0/150' });
  };

  useEffect(() => {
    return () => stopPipeline();
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'flex-start' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '-0.02em', color: 'var(--white)' }}>aura</span>
        <span style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--white-dim)', marginTop: '2px' }}>voice pattern analysis</span>
      </div> */}
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
        <h2>Live rPPG Heart Rate Dashboard</h2>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        {/* Left Side: Video Stream Display Viewport */}
        <div style={{ position: 'relative', width: '640px', height: '480px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
          <video ref={videoRef} autoPlay playsInline muted width="640" height="480" style={{ transform: 'scaleX(-1)' }} />
          <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
          
          {!isStreaming ? (
            <button onClick={startCamera} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '12px 24px', fontSize: '16px', cursor: 'pointer', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px' }}>
              Launch Live Stream
            </button>
          ) : (
            <button onClick={stopPipeline} style={{ position: 'absolute', bottom: '16px', left: '16px', padding: '8px 16px', cursor: 'pointer', background: '#ff0000', color: '#fff', border: 'none', borderRadius: '6px' }}>
              Disconnect
            </button>
          )}
        </div>

        {/* Right Side: Telemetry Metrics Display Panels */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '20px', background: '#f5f5f7', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h3>Telemetry Status</h3>
            <p><strong>Face Tracking:</strong> <span style={{ color: metrics.faceDetected ? 'green' : 'red' }}>{metrics.faceDetected ? 'LOCKED' : 'SEARCHING...'}</span></p>
            <p><strong>Signal Buffer:</strong> {metrics.buffer}</p>
            <hr />
            <h1 style={{ fontSize: '48px', margin: '12px 0', color: '#0070f3' }}>
              {metrics.bpm} <span style={{ fontSize: '20px', color: '#666' }}>{typeof metrics.bpm === 'number' && 'BPM'}</span>
            </h1>
          </div>

          <div style={{ padding: '20px', background: '#f5f5f7', borderRadius: '12px', flex: 1, overflowY: 'auto', maxHeight: '240px' }}>
            <h4>Real-time Measurement Log</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {logs.map((log, idx) => (
                <li key={idx} style={{ padding: '6px 0', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{log.time}</span>
                  <strong>{log.bpm} BPM</strong>
                </li>
              ))}
              {logs.length === 0 && <span style={{ color: '#888', fontSize: '14px' }}>Awaiting clean stable signal lock...</span>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}