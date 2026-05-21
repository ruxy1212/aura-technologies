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
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className="text-primary-fixed uppercase text-[10px] tracking-[0.3em]">PRODUCTS</p>
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
          <p className="text-primary-fixed uppercase text-[10px] tracking-[0.3em]">TELEMETRY FEATURES</p>
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
          <p className="text-primary-fixed uppercase text-[10px] tracking-[0.3em]">PLATFORMS</p>
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
          <p className="text-primary-fixed uppercase text-[10px] tracking-[0.3em]">PRICING</p>
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
                <Link className="font-label-caps text-label-caps bg-primary text-on-primary px-8 py-3 rounded-md rounded-DEFAULT hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.2)] w-full sm:w-auto" to="/auth">GET STARTED</Link>
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
            <p className="text-primary-fixed uppercase text-[10px] tracking-[0.3em]">CONTACT</p>
            <h2 className={styles.sectionTitle}>Ready for a custom deployment?</h2>
            <p className={styles.ctaSubtitle}>
              Tell us about your product and we will map the right pipeline, pricing, and rollout plan.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <a href="mailto:support@auratechnologies.com" className="font-data-mono text-data-mono border border-outline-variant/50 text-on-surface px-8 py-4 rounded-DEFAULT hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2 bg-surface/50 backdrop-blur-sm relative group overflow-hidden active:scale-95 w-full sm:w-auto">
              <span className="relative z-10">CONTACT SALES</span>
              <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </a>
            <Link to="/demo" className="font-label-caps text-label-caps bg-primary text-on-primary px-8 py-4 rounded-DEFAULT hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.2)] w-full sm:w-auto">
              SEE LIVE DEMO
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className="text-primary-fixed uppercase text-[10px] tracking-[0.3em]">FAQ</p>
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
