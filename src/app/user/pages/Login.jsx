import { useState, useEffect } from 'react';
import { requestMagicLink, verifyMagicLink, fetchProfile, updateProfile } from '../../../api/client';
import EcgLine from '../components/EcgLine';
import styles from './Login.module.css';

const STEPS = { EMAIL: 'email', SENT: 'sent', VERIFYING: 'verifying', COMPANY_INFO: 'company_info' };

export default function LoginPage({ onLogin }) {
  const [step, setStep]         = useState(STEPS.EMAIL);
  const [email, setEmail]       = useState('');
  const [company, setCompany]   = useState('');
  const [useCase, setUseCase]   = useState('');
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  // Resend logic
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Handle ?token= in URL (magic link click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      window.history.replaceState({}, document.title, window.location.pathname);
      handleVerification(t);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (resendDisabled && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, resendTimer]);

  async function handleVerification(token) {
    setStep(STEPS.VERIFYING);
    try {
      const { api_key } = await verifyMagicLink(token);
      localStorage.setItem('api_key', api_key);
      const profile = await fetchProfile();
      
      if (profile.company && profile.use_case) {
        onLogin(api_key);
      } else {
        setTempApiKey(api_key);
        setStep(STEPS.COMPANY_INFO);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Token may be invalid or expired.');
      setStep(STEPS.EMAIL);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await requestMagicLink(email, undefined, undefined);
      setStep(STEPS.SENT);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError('');
    setBusy(true);
    try {
      await requestMagicLink(email, undefined, undefined);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function startResendTimer() {
    setResendDisabled(true);
    setResendTimer(60);
  }

  async function handleCompanySubmit(e) {
    if (e) e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(company || undefined, useCase || undefined);
      onLogin(tempApiKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function skipCompanyInfo() {
    onLogin(tempApiKey);
  }

  return (
    <div className={styles.root}>
      {/* Left panel — branding */}
      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logoMark}>
            <span className={styles.logoText}>
              <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" height="40">
                <defs>
                  <linearGradient id="auraWebGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#00D4FF', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: '1' }} />
                  </linearGradient>
                </defs>
                <g fill="none" stroke="url(#auraWebGradient)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 55 L35 15 L50 55 M28 42 L42 42" />
                  <path d="M50 55 Q55 55 58 50 L58 30 M58 30 L58 45 Q58 55 68 55 Q78 55 78 45 L78 30" />
                  <path d="M78 55 L88 55 L88 30 M88 30 L88 42 L100 42 Q112 42 112 30 Q112 18 100 18 L88 18 M100 42 L115 55" />
                  <path d="M115 55 C130 55 135 55 145 55 L155 55 L165 10 L185 70 L200 35 L215 55 L225 55" />
                  <path d="M168 45 L190 45" strokeWidth="4.5" />
                </g>
              </svg>
            </span>
          </div>
          <p className={styles.tagline}>
            Contactless health-sensing SDK and<br />voice-based intellisense infrastructure
          </p>
          <div className={styles.ecgWrapper}>
            <EcgLine width={380} height={56} />
            <EcgLine width={380} height={56} color="rgba(0,229,255,0.35)" />
          </div>
          <ul className={`${styles.statList} hidden md:flex`}>
            {[
              ['PLATFORM', 'REST & WebSockets'],
              ['TELEMETRY', 'Live Now'],
              ['SENTIENCE', 'Coming Soon'],
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
            <span className={styles.cardTitle}>AURA TERMINAL</span>
          </div>

          {step === STEPS.EMAIL && (
            <form onSubmit={handleEmailSubmit} className={styles.form}>
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
              {error && <p className={styles.error}>{error}</p>}
              <button className={styles.btn} type="submit" disabled={busy}>
                {busy ? 'SENDING...' : 'CONTINUE →'}
              </button>
            </form>
          )}

          {step === STEPS.VERIFYING && (
            <div className={styles.form}>
              <p className={styles.subtext}>Authenticating your session...</p>
              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}

          {step === STEPS.COMPANY_INFO && (
            <form onSubmit={handleCompanySubmit} className={styles.form}>
              <p className={styles.subtext}>
                First time? A few details help us calibrate your experience.
                <button
                  type="button"
                  className={styles.skipLink}
                  onClick={skipCompanyInfo}
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
                autoFocus
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
                {busy ? 'SAVING...' : 'SAVE & CONTINUE →'}
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
              <button
                className={styles.btnGhost}
                onClick={handleResend}
                disabled={resendDisabled || busy}
              >
                {resendDisabled ? `RESEND LINK (${resendTimer}s)` : 'RESEND LINK'}
              </button>
            </div>
          )}
        </div>

        <p className={styles.footnote}>
          No passwords. No OAuth. Just a link.
        </p>
      </div>
      <ul className={`${styles.statList} pb-14 flex md:hidden`}>
        {[
          ['PLATFORM', 'REST & WebSockets'],
          ['TELEMETRY', 'Live Now'],
          ['SENTIENCE', 'Coming Soon'],
        ].map(([label, val]) => (
          <li key={label} className={styles.statItem}>
            <span className={styles.statLabel}>{label}</span>
            <span className={styles.statValue}>{val}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}