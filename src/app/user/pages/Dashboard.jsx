import { useState } from 'react';
import { rotateKey } from '../../../api/client';
import CuGauge from '../components/CuGauge';
import styles from './Dashboard.module.css';

const FEATURE_WEIGHTS = [
  { key: 'pulse_rate', label: 'Pulse Rate',              cu: '2.0 CU/min' },
  { key: 'hrv',        label: 'Heart Rate Variability',  cu: '1.0 CU/min' },
  { key: 'breathing',  label: 'Breathing Rate & Flow',   cu: '2.0 CU/min' },
  { key: 'expression', label: 'Facial Expression',       cu: '1.0 CU/min' },
  { key: 'blink',      label: 'Eye Blink Detection',     cu: '0.5 CU/min' },
  { key: 'talking',    label: 'Talking Detection',       cu: '0.5 CU/min' },
];

function Panel({ title, tag, children }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>{title}</span>
        {tag && <span className={styles.panelTag}>{tag}</span>}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

function InfoRow({ label, value, mono, accent }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${mono ? styles.monoVal : ''} ${accent ? styles.accentVal : ''}`}>
        {value}
      </span>
    </div>
  );
}

import usePageTitle from '../../../hooks/usePageTitle';

export default function DashboardPage({ user, onRefresh }) {
  usePageTitle('Dashboard');

  const [keyVisible, setKeyVisible]   = useState(false);
  const [rotating, setRotating]       = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [rotateError, setRotateError] = useState('');
  const [justRotated, setJustRotated] = useState(false);
  const [copied, setCopied]           = useState(false);

  const resetDate = user?.cu_reset_at
    ? new Date(user.cu_reset_at).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : '—';

  async function handleRotate() {
    setConfirmRotate(true);
  }

  async function performRotate() {
    setConfirmRotate(false);
    setRotating(true);
    setRotateError('');
    try {
      const resp = await rotateKey();
      if (resp && resp.api_key) {
        localStorage.setItem('api_key', resp.api_key);
      }
      await onRefresh();
      setJustRotated(true);
      setKeyVisible(true);
      setTimeout(() => setJustRotated(false), 3000);
    } catch (err) {
      setRotateError(err.message);
    } finally {
      setRotating(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(user.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const maskedKey = user?.api_key
    ? user.api_key.slice(0, 12) + '••••••••••••••••••••' + user.api_key.slice(-4)
    : '';

  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <h1 className={styles.title}>DASHBOARD</h1>
        <span className={styles.subtitle}>
          {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
        </span>
      </div>

      <div className={styles.grid}>

        {/* ── CU Usage ── */}
        <Panel title="COMPUTE UNITS" tag={user?.plan_name ?? 'FREE'}>
          <CuGauge
            remaining={user?.cu_remaining ?? 0}
            total={user?.cu_per_month ?? 1000}
          />
          <div className={styles.divider} />
          <InfoRow label="RESETS ON"  value={resetDate} />
          <InfoRow label="PLAN"       value={user?.plan_name ?? '—'} accent />
        </Panel>

        {/* ── Profile ── */}
        <Panel title="PROFILE">
          <InfoRow label="EMAIL"    value={user?.email ?? '—'} mono />
          <InfoRow label="COMPANY"  value={user?.company  || '—'} />
          <InfoRow label="USE CASE" value={user?.use_case || '—'} />
        </Panel>

        {/* ── API Key ── wide card */}
        <Panel title="API KEY" tag="SECRET">
          <div className={styles.keyRow}>
            <code className={styles.keyDisplay}>
              {keyVisible ? user?.api_key : maskedKey}
            </code>
            <button
              className={styles.iconBtn}
              onClick={() => setKeyVisible(v => !v)}
              title={keyVisible ? 'Hide' : 'Reveal'}
            >
              {keyVisible ? '○' : '●'}
            </button>
            <button
              className={styles.iconBtn}
              onClick={handleCopy}
              title="Copy"
            >
              {copied ? '✓' : '⎘'}
            </button>
          </div>

          {justRotated && (
            <p className={styles.successMsg}>
              ✓ New key generated — save it now, it will not be shown again in full.
            </p>
          )}
          {rotateError && <p className={styles.errorMsg}>{rotateError}</p>}

          <div className={styles.keyHint}>
            Use as: <code>Authorization: Bearer &lt;key&gt;</code>
            &nbsp;or <code>?api_key=&lt;key&gt;</code> for WebSocket
          </div>

          <button
            className={styles.rotateBtn}
            onClick={handleRotate}
            disabled={rotating}
          >
            {rotating ? 'ROTATING...' : '⟳ ROTATE KEY'}
          </button>
        </Panel>

        {/* ── Feature weights ── */}
        <Panel title="TELEMETRY PRICING" tag="CU/MIN">
          <table className={styles.featureTable}>
            <thead>
              <tr>
                <th>FEATURE</th>
                <th>KEY</th>
                <th>COST</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_WEIGHTS.map(f => (
                <tr key={f.key}>
                  <td>{f.label}</td>
                  <td><code>{f.key}</code></td>
                  <td className={styles.cuCell}>{f.cu}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td colSpan={2}>ALL FEATURES (default)</td>
                <td className={styles.cuCell}>7.0 CU/min</td>
              </tr>
            </tbody>
          </table>
        </Panel>

      </div>

      {confirmRotate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Rotate API Key?</h3>
            <p>Your current key will stop working immediately.</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalBtn} 
                onClick={() => setConfirmRotate(false)}
              >
                CANCEL
              </button>
              <button 
                className={`${styles.modalBtn} ${styles.dangerBtn}`} 
                onClick={performRotate}
              >
                ROTATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}