import { useState } from 'react';
import styles from './Docs.module.css';

// ── Helpers ──────────────────────────────────────────────────────────────
function Section({ id, title, children }) {
  return (
    <section className={styles.section} id={id}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Endpoint({ method, path, description, children }) {
  const methodClass = {
    GET:  styles.get,
    POST: styles.post,
    WS:   styles.ws,
  }[method] ?? '';

  return (
    <div className={styles.endpoint}>
      <div className={styles.endpointHeader}>
        <span className={`${styles.method} ${methodClass}`}>{method}</span>
        <code className={styles.path}>{path}</code>
        <span className={styles.endpointDesc}>{description}</span>
      </div>
      {children && <div className={styles.endpointBody}>{children}</div>}
    </div>
  );
}

function ParamTable({ rows }) {
  return (
    <table className={styles.paramTable}>
      <thead>
        <tr>
          <th>FIELD</th>
          <th>TYPE</th>
          <th>REQ</th>
          <th>DESCRIPTION</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([field, type, req, desc]) => (
          <tr key={field}>
            <td><code>{field}</code></td>
            <td><span className={styles.typeTag}>{type}</span></td>
            <td>{req ? <span className={styles.req}>●</span> : <span className={styles.opt}>○</span>}</td>
            <td>{desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CodeBlock({ lang = 'json', children }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(children.trim()).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.codeWrapper}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{lang}</span>
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      <pre className={styles.pre}><code>{children.trim()}</code></pre>
    </div>
  );
}

function ResponseBlock({ label, children }) {
  return (
    <div className={styles.responseBlock}>
      <span className={styles.responseLabel}>{label}</span>
      {children}
    </div>
  );
}

// ── TOC items ─────────────────────────────────────────────────────────────
const TOC = [
  { id: 'overview',      label: 'Overview' },
  { id: 'auth',          label: 'Authentication' },
  { id: 'magic-link',    label: '  POST /auth/magic-link' },
  { id: 'verify',        label: '  GET /auth/verify' },
  { id: 'profile',       label: 'User & Profile' },
  { id: 'me',            label: '  GET /me' },
  { id: 'rotate',        label: '  POST /me/rotate-key' },
  { id: 'websocket',     label: 'WebSocket Stream' },
  { id: 'ws-handshake',  label: '  Handshake' },
  { id: 'ws-frame',      label: '  Frame messages' },
  { id: 'ws-payload',    label: '  Response payload' },
  { id: 'features',      label: 'Features & CU' },
  { id: 'errors',        label: 'Errors' },
];

// ── Page ──────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [activeId, setActiveId] = useState('overview');

  function scrollTo(id) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className={styles.root}>
      {/* TOC sidebar */}
      <nav className={styles.toc}>
        <p className={styles.tocHeading}>CONTENTS</p>
        {TOC.map(item => (
          <button
            key={item.id}
            className={`${styles.tocItem} ${activeId === item.id ? styles.tocActive : ''} ${item.label.startsWith('  ') ? styles.tocSub : ''}`}
            onClick={() => scrollTo(item.id)}
          >
            {item.label.trimStart()}
          </button>
        ))}
      </nav>

      {/* Doc body */}
      <article className={styles.body}>

        {/* ── Overview ── */}
        <Section id="overview" title="OVERVIEW">
          <p className={styles.prose}>
            The rPPG API streams biometric telemetry derived from standard webcam video
            via remote photoplethysmography. Connect over WebSocket, send JPEG frames,
            receive real-time vitals. REST endpoints handle auth and account management.
          </p>
          <div className={styles.baseUrlBox}>
            <span className={styles.dimLabel}>BASE URL</span>
            <code className={styles.baseUrl}>{import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8007'}</code>
          </div>
          <div className={styles.infoGrid}>
            {[
              ['Protocol',    'HTTPS + WSS'],
              ['Auth',        'Bearer token (API key)'],
              ['Frame format','JPEG base64 data URI'],
              ['Response',    'JSON'],
            ].map(([k, v]) => (
              <div key={k} className={styles.infoCell}>
                <span className={styles.dimLabel}>{k.toUpperCase()}</span>
                <code className={styles.infoVal}>{v}</code>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Auth ── */}
        <Section id="auth" title="AUTHENTICATION">
          <p className={styles.prose}>
            rPPG uses magic-link authentication — no passwords. Request a link,
            click it, receive an API key. Store the key and pass it with every request.
          </p>

          <Endpoint id="magic-link" method="POST" path="/auth/magic-link" description="Request a login link">
            <p className={styles.prose}>
              Creates the user account on first call. Existing users just receive a new link.
              In <code>DEV_MODE</code> the token is returned directly in the response body.
            </p>
            <ParamTable rows={[
              ['email',    'string', true,  'Valid email address'],
              ['company',  'string', false, 'Organisation name'],
              ['use_case', 'string', false, 'How you plan to use the API'],
            ]} />
            <CodeBlock lang="bash">{`
curl -X POST https://your-api.onrender.com/auth/magic-link \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@company.com","company":"Acme","use_case":"Patient monitoring"}'
            `}</CodeBlock>
            <ResponseBlock label="200 OK">
              <CodeBlock lang="json">{`
{
  "detail": "Check your email for a login link.",
  "dev_token": null
}
            `}</CodeBlock>
            </ResponseBlock>
          </Endpoint>

          <Endpoint id="verify" method="GET" path="/auth/verify?token=…" description="Exchange token for API key">
            <p className={styles.prose}>
              Marks the token used (one-time). Returns the permanent API key.
              Tokens expire after 15 minutes.
            </p>
            <CodeBlock lang="bash">{`
curl "https://your-api.onrender.com/auth/verify?token=YOUR_TOKEN"
            `}</CodeBlock>
            <ResponseBlock label="200 OK">
              <CodeBlock lang="json">{`
{
  "api_key": "aurppg_Kx9m...",
  "email":   "you@company.com"
}
            `}</CodeBlock>
            </ResponseBlock>
          </Endpoint>
        </Section>

        {/* ── Profile ── */}
        <Section id="profile" title="USER & PROFILE">
          <p className={styles.prose}>
            All REST endpoints require the API key as a Bearer token.
          </p>

          <Endpoint id="me" method="GET" path="/me" description="Fetch profile and CU balance">
            <CodeBlock lang="bash">{`
curl https://your-api.onrender.com/me \\
  -H "Authorization: Bearer aurppg_Kx9m..."
            `}</CodeBlock>
            <ResponseBlock label="200 OK">
              <CodeBlock lang="json">{`
{
  "email":         "you@company.com",
  "company":       "Acme",
  "use_case":      "Patient monitoring",
  "api_key":       "aurppg_Kx9m...",
  "plan_id":       "free",
  "plan_name":     "Free",
  "cu_remaining":  847.3,
  "cu_per_month":  1000,
  "cu_reset_at":   "2026-06-01T00:00:00+00:00"
}
            `}</CodeBlock>
            </ResponseBlock>
          </Endpoint>

          <Endpoint id="rotate" method="POST" path="/me/rotate-key" description="Rotate API key">
            <p className={styles.prose}>
              Immediately invalidates the old key and returns a new one.
            </p>
            <CodeBlock lang="bash">{`
curl -X POST https://your-api.onrender.com/me/rotate-key \\
  -H "Authorization: Bearer aurppg_Kx9m..."
            `}</CodeBlock>
            <ResponseBlock label="200 OK">
              <CodeBlock lang="json">{`{ "api_key": "aurppg_NEW..." }`}</CodeBlock>
            </ResponseBlock>
          </Endpoint>
        </Section>

        {/* ── WebSocket ── */}
        <Section id="websocket" title="WEBSOCKET STREAM">
          <p className={styles.prose}>
            Real-time biometric data is delivered over a persistent WebSocket connection.
            The server processes each JPEG frame you send and immediately replies with
            a telemetry payload.
          </p>

          <div className={styles.wsUrl}>
            <span className={styles.dimLabel}>ENDPOINT</span>
            <code>wss://your-api.onrender.com/ws/stream?api_key=aurppg_Kx9m...</code>
          </div>

          <Endpoint id="ws-handshake" method="WS" path="First message → server" description="Session handshake">
            <p className={styles.prose}>
              The first message after connecting must be the handshake JSON.
              Pass an empty <code>features</code> array (or omit it) to enable all features.
            </p>
            <CodeBlock lang="json">{`
{
  "api_key":  "aurppg_Kx9m...",
  "features": ["pulse_rate", "hrv", "breathing"]
}
            `}</CodeBlock>
            <ResponseBlock label="Server reply">
              <CodeBlock lang="json">{`
{
  "status":       "ready",
  "features":     ["pulse_rate", "hrv", "breathing"],
  "cu_remaining": 847.3
}
            `}</CodeBlock>
            </ResponseBlock>
          </Endpoint>

          <Endpoint id="ws-frame" method="WS" path="Each subsequent message" description="Send a video frame">
            <CodeBlock lang="javascript">{`
// Capture from <video> element via canvas
const canvas = document.createElement('canvas');
canvas.width  = video.videoWidth;
canvas.height = video.videoHeight;
canvas.getContext('2d').drawImage(video, 0, 0);
const dataUri = canvas.toDataURL('image/jpeg', 0.7);

ws.send(JSON.stringify({ image: dataUri }));
            `}</CodeBlock>
          </Endpoint>

          <Endpoint id="ws-payload" method="WS" path="Server → client" description="Telemetry payload">
            <CodeBlock lang="json">{`
{
  "face_detected":   true,
  "buffer_status":   "150/150",
  "motion_artifact": false,
  "cu_remaining":    841.2,

  "pulse_rate": {
    "bpm":        72.4,
    "snr":        4.1,
    "confidence": 0.82,
    "waveform":   [0.12, 0.45, ...]
  },
  "hrv": {
    "rmssd":      28.3,
    "sdnn":       41.1,
    "ibi_ms":     [823, 811, 836, ...],
    "confidence": 0.71
  },
  "breathing": {
    "brpm":            15.2,
    "confidence":      0.68,
    "upper_waveform":  [0.03, 0.12, ...],
    "lower_waveform":  [-0.01, 0.08, ...],
    "out_of_frame":    false
  },
  "expression": {
    "label":      "neutral",
    "confidence": 0.74,
    "scores":     { "happiness": 0.12, "neutral": 0.74, ... }
  },
  "blink": {
    "count":     14,
    "ear":       0.28,
    "threshold": 0.21
  },
  "talking":  false,
  "mar":      0.08
}
            `}</CodeBlock>
          </Endpoint>
        </Section>

        {/* ── Features & CU ── */}
        <Section id="features" title="FEATURES & COMPUTE UNITS">
          <p className={styles.prose}>
            Each feature has a per-minute cost. CU are deducted every 10 seconds
            from your monthly balance (1,000 CU on the Free plan, resetting the 1st of each month).
            The connection closes automatically when your balance reaches zero.
          </p>
          <table className={styles.featureTable}>
            <thead>
              <tr>
                <th>KEY</th>
                <th>FEATURE</th>
                <th>CU / MIN</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['pulse_rate', 'Pulse Rate (CHROM + Welch PSD)',              '2.0'],
                ['hrv',        'Heart Rate Variability (RMSSD, SDNN)',        '1.0'],
                ['breathing',  'Breathing Rate + Optical Flow Waveforms',     '2.0'],
                ['expression', 'Facial Expression (8 classes, blendshapes)',  '1.0'],
                ['blink',      'Eye Blink Detection (EAR)',                   '0.5'],
                ['talking',    'Talking Detection (MAR + variance)',          '0.5'],
              ].map(([key, feat, cu]) => (
                <tr key={key}>
                  <td><code>{key}</code></td>
                  <td>{feat}</td>
                  <td className={styles.cuCell}>{cu}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td><code>—</code></td>
                <td>All features (empty array or omitted)</td>
                <td className={styles.cuCell}>7.0</td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* ── Errors ── */}
        <Section id="errors" title="ERRORS">
          <p className={styles.prose}>
            REST endpoints return standard HTTP status codes. WebSocket errors
            are sent as a JSON message before the connection closes with code 1008.
          </p>
          <table className={styles.featureTable}>
            <thead>
              <tr><th>CODE</th><th>MEANING</th></tr>
            </thead>
            <tbody>
              {[
                ['401', 'Missing or invalid API key'],
                ['404', 'Magic link token not found'],
                ['410', 'Token already used or expired'],
                ['422', 'Validation error — check request body'],
                ['WS 1008', 'Invalid API key or CU exhausted'],
              ].map(([code, meaning]) => (
                <tr key={code}>
                  <td><code>{code}</code></td>
                  <td>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ResponseBlock label="WS error shape">
            <CodeBlock lang="json">{`
{ "error": "Compute units exhausted", "cu_remaining": 0 }
            `}</CodeBlock>
          </ResponseBlock>
        </Section>

      </article>
    </div>
  );
}