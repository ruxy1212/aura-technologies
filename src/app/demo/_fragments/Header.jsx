import { Link } from "react-router-dom";

export default function Header({ isStreaming }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    }}>
      <div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center'}}>
          <Link to="/">
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
          </Link>
          <div className="h-10 w-0.5 bg-white hidden md:block" />
          <h1 className="hidden md:block" style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '22px',
            fontWeight: '800',
            color: '#e2e8f0',
            letterSpacing: '-0.02em',
          }}>
            Telemetry
          </h1>
        </div>
        <p style={{ fontSize: '10px', color: '#4a5568', letterSpacing: '0.1em', marginTop: '2px' }}>
          <span className="md:hidden">rPPG</span>
          <span className="hidden md:inline">REMOTE PHOTOPLETHYSMOGRAPHY</span>
          · MULTIMODAL INTELLISENSE
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className={`status-dot${isStreaming ? ' live' : ''}`} />
        <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: isStreaming ? '#48bb78' : '#fc8181' }}>
          {isStreaming ? 'STREAMING' : 'OFFLINE'}
        </span>
      </div>
    </div>
  )
}