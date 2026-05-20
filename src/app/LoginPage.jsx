import { useState, useEffect } from 'react';
import { requestMagicLink, verifyMagicLink } from '../api/client';
import EcgLine from '../assets/EcgLine';
import styles from './LoginPage.module.css';

const STEPS = { EMAIL: 'email', REGISTER: 'register', SENT: 'sent', VERIFY: 'verify' };

export default function LoginPage({ onLogin }) {
  const [step, setStep]         = useState(STEPS.EMAIL);
  const [email, setEmail]       = useState('');
  const [company, setCompany]   = useState('');
  const [useCase, setUseCase]   = useState('');
  const [token, setToken]       = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);

  // Handle ?token= in URL (magic link click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) { setToken(t); setStep(STEPS.VERIFY); }
  }, []);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await requestMagicLink(email, company || undefined, useCase || undefined);
      setStep(STEPS.SENT);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { api_key } = await verifyMagicLink(token);
      onLogin(api_key);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.root}>
      {/* Left panel — branding */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logoMark}>
            <span className={styles.logoSymbol}>♥</span>
            <span className={styles.logoText}>rPPG</span>
          </div>
          <p className={styles.tagline}>
            Remote photoplethysmography<br />telemetry infrastructure
          </p>
          <div className={styles.ecgWrapper}>
            <EcgLine width={380} height={56} />
            <EcgLine width={380} height={56} color="rgba(0,255,140,0.3)" />
          </div>
          <ul className={styles.statList}>
            {[
              ['LATENCY',  '< 33 ms'],
              ['ACCURACY', '±2 BPM'],
              ['FEATURES', '6'],
            ].map(([label, val]) => (
              <li key={label} className={styles.statItem}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{val}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <span className={styles.dot} />
            <span className={styles.dot} style={{ opacity: 0.5 }} />
            <span className={styles.dot} style={{ opacity: 0.25 }} />
            <span className={styles.cardTitle}>TERMINAL</span>
          </div>

          {step === STEPS.EMAIL && (
            <form onSubmit={(e) => {
              e.preventDefault();
              setStep(STEPS.REGISTER);
            }} className={styles.form}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
              />
              <button className={styles.btn} type="submit">
                CONTINUE →
              </button>
            </form>
          )}

          {step === STEPS.REGISTER && (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <p className={styles.subtext}>
                First time? A few details help us calibrate your experience.
                <button
                  type="button"
                  className={styles.skipLink}
                  onClick={handleEmailSubmit}
                  disabled={busy}
                >
                  Skip
                </button>
              </p>
              <label className={styles.label}>COMPANY / ORGANISATION</label>
              <input
                className={styles.input}
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Acme Health Inc."
              />
              <label className={styles.label}>USE CASE</label>
              <input
                className={styles.input}
                type="text"
                value={useCase}
                onChange={e => setUseCase(e.target.value)}
                placeholder="e.g. Remote patient monitoring"
              />
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.btn} type="submit" disabled={busy}>
                {busy ? 'SENDING...' : 'SEND MAGIC LINK →'}
              </button>
            </form>
          )}

          {step === STEPS.SENT && (
            <div className={styles.form}>
              <div className={styles.sentIcon}>✓</div>
              <p className={styles.sentText}>
                Link dispatched to<br />
                <span className={styles.sentEmail}>{email}</span>
              </p>
              <p className={styles.subtext}>
                Check your inbox. The link expires in 15 minutes.
              </p>
              <div className={styles.divider} />
              <p className={styles.subtext}>Have a token already?</p>
              <button
                className={styles.btnGhost}
                onClick={() => setStep(STEPS.VERIFY)}
              >
                ENTER TOKEN MANUALLY
              </button>
            </div>
          )}

          {step === STEPS.VERIFY && (
            <form onSubmit={handleVerify} className={styles.form}>
              <label className={styles.label}>VERIFICATION TOKEN</label>
              <input
                className={styles.input}
                type="text"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="paste token here"
                required
                autoFocus
              />
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.btn} type="submit" disabled={busy}>
                {busy ? 'VERIFYING...' : 'VERIFY & ENTER →'}
              </button>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => { setStep(STEPS.EMAIL); setError(''); }}
              >
                ← BACK
              </button>
            </form>
          )}
        </div>

        <p className={styles.footnote}>
          No passwords. No OAuth. Just a link.
        </p>
      </div>
    </div>
  );
}