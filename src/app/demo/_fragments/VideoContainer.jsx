export default function VideoContainer({ isStreaming, videoRef, canvasRef, status, talking, startCamera, stopPipeline }) {
  return (
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
  )
}