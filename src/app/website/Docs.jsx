import { useState } from 'react';
import styles from './Docs.module.css';

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
    GET: styles.get,
    POST: styles.post,
    WS: styles.ws,
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

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'auth', label: 'Authentication' },
  { id: 'magic-link', label: '  POST /auth/magic-link' },
  { id: 'verify', label: '  GET /auth/verify' },
  { id: 'profile', label: 'User & Profile' },
  { id: 'me', label: '  GET /me' },
  { id: 'rotate', label: '  POST /me/rotate-key' },
  { id: 'websocket', label: 'WebSocket Stream' },
  { id: 'ws-handshake', label: '  Handshake' },
  { id: 'ws-frame', label: '  Frame messages' },
  { id: 'ws-payload', label: '  Response payload' },
  { id: 'features', label: 'Features & CU' },
  { id: 'errors', label: 'Errors' },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState('overview');

  function scrollTo(id) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className={styles.root}>
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

      <article className={styles.body}>
        <Section id="overview" title="OVERVIEW">
          <p className={styles.prose}>
            Aura rPPG streams biometric telemetry derived from standard webcam video
            via remote photoplethysmography. Connect over WebSocket, send JPEG frames,
            receive real-time vitals. REST endpoints handle auth and account management.
          </p>
          <div className={styles.baseUrlBox}>
            <span className={styles.dimLabel}>BASE URL</span>
            <code className={styles.baseUrl}>{import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8007'}</code>
          </div>
          <div className={styles.infoGrid}>
            {[
              ['Protocol', 'HTTPS + WSS'],
              ['Auth', 'Bearer token (API key)'],
              ['Frame format', 'JPEG base64 data URI'],
              ['Response', 'JSON'],
            ].map(([k, v]) => (
              <div key={k} className={styles.infoCell}>
                <span className={styles.dimLabel}>{k.toUpperCase()}</span>
                <code className={styles.infoVal}>{v}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section id="auth" title="AUTHENTICATION">
          <p className={styles.prose}>
            Aura rPPG uses magic-link authentication — no passwords. Request a link,
            click it, receive an API key. Store the key and pass it with every request.
          </p>

          <Endpoint method="POST" path="/auth/magic-link" description="Request a login link">
            <p className={styles.prose}>
              Creates the user account on first call. Existing users just receive a new link.
              In <code>DEV_MODE</code> the token is returned directly in the response body.
            </p>
            <ParamTable rows={[
              ['email', 'string', true, 'Valid email address'],
              ['company', 'string', false, 'Organisation name'],
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

          <Endpoint method="GET" path="/auth/verify?token=…" description="Exchange token for API key">
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
  "email": "you@company.com"
}
            `}</CodeBlock>
            </ResponseBlock>
          </Endpoint>
        </Section>

        <Section id="profile" title="USER & PROFILE">
          <p className={styles.prose}>
            All REST endpoints require the API key as a Bearer token.
          </p>

          <Endpoint method="GET" path="/me" description="Fetch profile and CU balance">
            <CodeBlock lang="bash">{`
curl https://your-api.onrender.com/me \\
  -H "Authorization: Bearer aurppg_Kx9m..."
            `}</CodeBlock>
            <ResponseBlock label="200 OK">
              <CodeBlock lang="json">{`
{
  "email": "you@company.com",
  "company": "Acme",
  "use_case": "Patient monitoring",
  "api_key": "aurppg_Kx9m...",
  "plan_id": "free",
  "plan_name": "Free",
  "cu_remaining": 847.3,
  "cu_per_month": 1000,
  "cu_reset_at": "2026-06-01T00:00:00+00:00"
}
            `}</CodeBlock>
            </ResponseBlock>
          </Endpoint>

          <Endpoint method="POST" path="/me/rotate-key" description="Rotate API key">
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

        <Section id="websocket" title="WEBSOCKET STREAM">
          <p className={styles.prose}>
            Real-time biometric data is delivered over a persistent WebSocket connection.
            The server processes each JPEG frame you send and immediately replies with
            a telemetry payload.
          </p>

          <Endpoint method="WS" path="/ws/stream" description="Live telemetry stream">
            <p className={styles.prose}>
              Connect with an API key and send JPEG frames as base64 data URIs.
              The server responds with pulse, HRV, breathing, expression, blink, and buffer status.
            </p>
            <CodeBlock lang="javascript">{`
const ws = new WebSocket('wss://your-api.onrender.com/ws/stream');
ws.onopen = () => {
  ws.send(JSON.stringify({
    image: canvas.toDataURL('image/jpeg', 0.7)
  }));
};
            `}</CodeBlock>
          </Endpoint>

          <Endpoint method="POST" path="Frame payload" description="Send JPEG frame">
            <ParamTable rows={[
              ['image', 'string', true, 'Base64 data URI JPEG frame'],
            ]} />
            <CodeBlock lang="json">{`
{ "image": "data:image/jpeg;base64,..." }
            `}</CodeBlock>
          </Endpoint>

          <Endpoint method="POST" path="Response payload" description="Server telemetry response">
            <CodeBlock lang="json">{`
{
  "pulse_rate": {
    "bpm": 73.2,
    "snr": 1.3,
    "confidence": 0.86,
    "waveform": [0.01, 0.02, 0.04]
  },
  "breathing": {
    "brpm": 14.2,
    "confidence": 0.74,
    "upper_waveform": [0.1, 0.12],
    "lower_waveform": [0.09, 0.1]
  },
  "expression": {
    "label": "neutral",
    "confidence": 0.82,
    "scores": { "neutral": 0.82, "happy": 0.1 }
  },
  "blink": { "count": 2, "ear": 0.29 },
  "talking": false,
  "face_detected": true,
  "buffer_status": "144/150"
}
            `}</CodeBlock>
          </Endpoint>
        </Section>

        <Section id="features" title="FEATURES & CU">
          <p className={styles.prose}>
            Compute Units (CU) represent processing cost. Each feature incurs CU per minute.
            See the dashboard for the live CU rate and usage breakdown.
          </p>
        </Section>

        <Section id="errors" title="ERRORS">
          <p className={styles.prose}>
            Errors are returned as JSON responses or as an <code>error</code> field in the
            WebSocket stream. Check the message and retry with a valid API key.
          </p>
        </Section>
      </article>
    </div>
  );
}
