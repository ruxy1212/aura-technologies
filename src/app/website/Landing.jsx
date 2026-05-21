import { Link } from 'react-router-dom';
import styles from './Landing.module.css';
import Hero from './Hero';

const PRODUCTS = [
  {
    title: 'Telemetry',
    badge: 'LIVE NOW',
    description: 'Remote photoplethysmography and multimodal intellisense. Extract real-time biometric signals from any standard camera without wearables.',
  },
  {
    title: 'Sentience',
    badge: 'COMING SOON',
    description: 'Voice-based intellisense. Listens and interprets vocal signals to analyze stress, depression, and advanced cognitive states in real time.',
  }
];

const FEATURES = [
  { label: 'Pulse Rate', cu: '2.0 CU/min', body: 'Extract real-time heart rate via subtle skin color changes.' },
  { label: 'Heart Rate Variability', cu: '1.0 CU/min', body: 'Analyze inter-beat intervals to measure stress and recovery.' },
  { label: 'Breathing Rate & Flow', cu: '2.0 CU/min', body: 'Track chest and shoulder movement for respiratory metrics.' },
  { label: 'Facial Expression', cu: '1.0 CU/min', body: 'Capture emotional responses directly from facial landmarks.' },
  { label: 'Eye Blink Detection', cu: '0.5 CU/min', body: 'Monitor blink frequency and duration for cognitive load.' },
  { label: 'Talking Detection', cu: '0.5 CU/min', body: 'Determine when the user is speaking with high precision.' },
];

const SDKS = [
  { name: 'REST API / WebSockets', status: 'Available', link: '/docs' },
  { name: 'Android SDK', status: 'Coming Soon' },
  { name: 'iOS SDK', status: 'Coming Soon' },
  { name: 'Desktop Native (C++)', status: 'Coming Soon' }
];

const PRICING = [
  {
    plan: 'Starter',
    price: 'Free',
    detail: '1,000 CU / month',
    items: ['Demo access', 'API key', 'Community support'],
    isAvailable: true,
  },
  {
    plan: 'Pro',
    price: 'Custom',
    detail: 'Usage-based CU',
    items: ['Higher CU limits', 'Priority support', 'Volume pricing'],
    isAvailable: false,
  },
  {
    plan: 'Enterprise',
    price: 'Custom',
    detail: 'Dedicated infra',
    items: ['SLA + onboarding', 'Private deployments', 'Compliance review'],
    isAvailable: false,
  },
];

const FAQS = [
  {
    q: 'What is AuRa Telemetry?',
    a: 'AuRa Telemetry is a contactless health-sensing SDK that turns a standard camera into a real-time biometric sensor. It tracks micromovements and color variations to extract anonymized health metrics (pulse, HRV, breathing) without wearables.',
  },
  {
    q: 'What physiological signals are measured?',
    a: 'Current metrics include Pulse Rate, Heart Rate Variability (HRV), Breathing Rate & Flow, Facial Expression, Eye Blink Detection, and Talking Detection.',
  },
  {
    q: 'Is AuRa FDA-approved?',
    a: 'No. AuRa Telemetry provides informational signals intended for wellness applications, product experiences, and research. It is not an FDA-approved medical device and should not be used for medical diagnosis, treatment, or decision-making.',
  },
  {
    q: 'How does AuRa protect user privacy?',
    a: 'Privacy is built in by design. The SDK does not store or transmit any video or facial images. Only purely anonymized telemetry metrics are extracted and securely delivered to your application.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'Our REST API and WebSocket endpoints are available now. SDKs for Android, iOS, and native Desktop (C++) are currently in development and coming soon.',
  },
];

export default function Landing() {
  return (
    <div className={styles.root}>
      <Hero />
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>AURA TECHNOLOGIES</p>
          <h1 className={styles.title}>
            Multimodal Intellisense infrastructure.
          </h1>
          <p className={styles.subtitle}>
            Empower your applications with real-time biometric signals derived from video and voice. Ship responsive wellness and engagement experiences without specialized hardware.
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
          <p className={styles.eyebrow}>PRODUCTS</p>
          <h2 className={styles.sectionTitle}>Two engines. Infinite possibilities.</h2>
        </div>
        <div className={styles.productsGrid}>
          {PRODUCTS.map(product => (
            <article key={product.title} className={styles.productCard}>
              <div className={styles.productHeader}>
                <h3>{product.title}</h3>
                <span className={product.badge === 'LIVE NOW' ? styles.badgeLive : styles.badgeSoon}>
                  {product.badge}
                </span>
              </div>
              <p>{product.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>TELEMETRY FEATURES</p>
          <h2 className={styles.sectionTitle}>Signals you can build on.</h2>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map(feature => (
            <article key={feature.label} className={styles.featureCard}>
              <div className={styles.featureHeader}>
                <h3>{feature.label}</h3>
                <span className={styles.featureCu}>{feature.cu}</span>
              </div>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>PLATFORMS</p>
          <h2 className={styles.sectionTitle}>Integrate anywhere.</h2>
        </div>
        <div className={styles.sdkGrid}>
          {SDKS.map(sdk => (
            <div key={sdk.name} className={sdk.status === 'Available' ? styles.sdkCardLive : styles.sdkCardSoon}>
              <div className={styles.sdkHeader}>
                <h3>{sdk.name}</h3>
                <span className={styles.sdkStatus}>{sdk.status}</span>
              </div>
              {sdk.link && (
                <Link to={sdk.link} className={styles.sdkLink}>View Documentation &rarr;</Link>
              )}
            </div>
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
              {plan.isAvailable ? (
                <Link className={styles.priceCta} to="/auth">GET STARTED</Link>
              ) : (
                <button className={styles.priceCta} disabled>COMING SOON</button>
              )}
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
              Tell us about your product and we will map the right pipeline, pricing, and rollout plan.
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
