import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

const FEATURES = [
  {
    title: 'Live rPPG telemetry',
    body: 'Stream webcam frames and receive heart rate, HRV, breathing, and expression signals in real time.',
  },
  {
    title: 'Low-latency pipeline',
    body: 'Optimized inference loop keeps update cadence tight for monitoring and UX feedback loops.',
  },
  {
    title: 'Flexible integration',
    body: 'REST for auth and account data, WebSocket for high-frequency telemetry. Works across browsers.',
  },
];

const PRICING = [
  {
    plan: 'Starter',
    price: 'Free',
    detail: '1,000 CU / month',
    items: ['Demo access', 'API key', 'Community support'],
  },
  {
    plan: 'Pro',
    price: 'Custom',
    detail: 'Usage-based CU',
    items: ['Higher CU limits', 'Priority support', 'Volume pricing'],
  },
  {
    plan: 'Enterprise',
    price: 'Custom',
    detail: 'Dedicated infra',
    items: ['SLA + onboarding', 'Private deployments', 'Compliance review'],
  },
];

const FAQS = [
  {
    q: 'Is this a medical device?',
    a: 'No. Aura rPPG provides informational signals for product experiences, research, and wellness insights.',
  },
  {
    q: 'What video data is required?',
    a: 'We accept JPEG frames over WebSocket. A 640x480 stream at ~30 FPS is recommended for best results.',
  },
  {
    q: 'How do I get an API key?',
    a: 'Use the magic-link flow on the auth page. The key is returned after verification.',
  },
  {
    q: 'Can I talk to the team?',
    a: 'Yes. Email us any time and we will follow up quickly.',
  },
];

export default function Landing() {
  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>REMOTE PHOTOPLETHYSMOGRAPHY</p>
          <h1 className={styles.title}>
            Real-time biometric signals from a standard camera.
          </h1>
          <p className={styles.subtitle}>
            Aura rPPG turns webcam frames into live telemetry for pulse, HRV, breathing, and expression.
            Ship responsive wellness and engagement experiences without specialized hardware.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} to="/demo">LAUNCH LIVE DEMO</Link>
            <Link className={styles.secondaryCta} to="/auth">REQUEST API KEY</Link>
          </div>
          <div className={styles.heroStats}>
            <div>
              <span className={styles.statLabel}>LATENCY</span>
              <span className={styles.statValue}>&lt; 33ms</span>
            </div>
            <div>
              <span className={styles.statLabel}>ACCURACY</span>
              <span className={styles.statValue}>±2 BPM</span>
            </div>
            <div>
              <span className={styles.statLabel}>STREAM</span>
              <span className={styles.statValue}>30 FPS</span>
            </div>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.panelHeader}>
            <span>LIVE SIGNAL PREVIEW</span>
            <span className={styles.panelDot} />
          </div>
          <div className={styles.panelBody}>
            <div className={styles.panelMetric}>
              <span>HEART RATE</span>
              <strong>78 BPM</strong>
            </div>
            <div className={styles.panelMetric}>
              <span>BREATHING</span>
              <strong>14 BRPM</strong>
            </div>
            <div className={styles.panelMetric}>
              <span>EXPRESSION</span>
              <strong>CALM</strong>
            </div>
            <div className={styles.panelWave}>
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>FEATURES</p>
          <h2 className={styles.sectionTitle}>Telemetry that feels alive.</h2>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map(feature => (
            <article key={feature.title} className={styles.featureCard}>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>PRICING</p>
          <h2 className={styles.sectionTitle}>Choose a plan that scales with your deployment.</h2>
        </div>
        <div className={styles.pricingGrid}>
          {PRICING.map(plan => (
            <article key={plan.plan} className={styles.priceCard}>
              <div>
                <p className={styles.pricePlan}>{plan.plan}</p>
                <h3 className={styles.priceValue}>{plan.price}</h3>
                <p className={styles.priceDetail}>{plan.detail}</p>
              </div>
              <ul>
                {plan.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className={styles.priceCta} to="/auth">GET STARTED</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <div>
            <p className={styles.eyebrow}>CONTACT</p>
            <h2 className={styles.sectionTitle}>Ready for a custom deployment?</h2>
            <p className={styles.ctaSubtitle}>
              Tell us about your product and we will map the right rPPG pipeline, pricing, and rollout plan.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a className={styles.primaryCta} href="mailto:support@aurappg.com">
              CONTACT SALES
            </a>
            <Link className={styles.secondaryCta} to="/demo">SEE LIVE DEMO</Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>FAQ</p>
          <h2 className={styles.sectionTitle}>Questions, answered.</h2>
        </div>
        <div className={styles.faqGrid}>
          {FAQS.map(item => (
            <details key={item.q} className={styles.faqItem}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
