import styles from './Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.subtitle}>AURA TECHNOLOGIES</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>Last updated: May 21, 2026</p>
      </header>

      <section className={styles.section}>
        <h2>1. SUMMARY</h2>
        <p>
          This Privacy Policy explains how Aura Technologies ("we," "our," or "us") collects, uses, processes, 
          and protects your information when you interact with our SDKs, APIs, and WebSockets—specifically 
          the <strong>AuRa Telemetry</strong> and <strong>AuRa Sentience</strong> engines. Privacy is built 
          into our architecture by design. For developers integrating our Service into third-party applications, 
          you are entirely responsible for presenting this privacy information to your end-users and obtaining 
          any legally required consent for biometric or diagnostic data processing.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. HOW AURA PROCESSES DATA</h2>
        <p>
          Our services process real-time digital feeds (e.g., video frames or audio streams) to extract 
          health-sensing telemetry and cognitive state metrics. We employ a privacy-first approach:
        </p>
        <ul>
          <li><strong>No Video Storage:</strong> For AuRa Telemetry, video frames provided via WebSockets or REST endpoints are processed in real-time in memory to extract numerical telemetry (e.g., heart rate variations, facial expressions, blink rates) and are <strong>immediately discarded</strong>. We do not store, persist, or transmit any facial images or video files to disk.</li>
          <li><strong>No Audio Storage:</strong> For AuRa Sentience, vocal inputs used for stress, depression, or cognitive analysis are processed dynamically. We do not persist raw voice recordings or transcripts beyond the immediate processing cycle required to generate the insights.</li>
          <li><strong>Anonymized Telemetry:</strong> The resulting output (pulse rate, HRV, breathing rate, emotional state) corresponds purely to mathematical arrays and metrics. It cannot be reverse-engineered to identify an individual visually or audibly.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. INFORMATION WE COLLECT</h2>
        <p>When you use the Service as a developer or account holder, we collect:</p>
        <ul>
          <li><strong>Account & Registration Details:</strong> Email addresses used for magic-link authentication, company name, API usage intent, and billing details (if applicable).</li>
          <li><strong>Usage & Telemetry Data:</strong> We monitor API request metadata, WebSocket connection durations, IP addresses, error logs, and Compute Unit (CU) consumption for operational purposes.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. HOW WE USE YOUR INFORMATION</h2>
        <p>The information we collect is strictly used to:</p>
        <ul>
          <li>Deliver, maintain, and secure the API and WebSocket services.</li>
          <li>Bill usage and accurately calculate Compute Units deduction.</li>
          <li>Prevent fraud, enforce our Terms of Service, and troubleshoot technical issues.</li>
          <li>Communicate operational messages, such as API key rotation, security updates, and limit warnings.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>5. DATA SHARING AND DISCLOSURE</h2>
        <p>
          We do not rent, sell, or trade personal data or the derived biometric telemetry of your users to third parties. 
          We may share data solely in the following circumstances:
        </p>
        <ul>
          <li><strong>Service Providers:</strong> With trusted infrastructure providers (cloud hosting, database management, email delivery) who are bound by strict confidentiality and data protection agreements.</li>
          <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes, or to protect the rights, property, or safety of Aura Technologies, our users, or the public.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>6. DATA RETENTION AND DELETION</h2>
        <p>
          Developer account data (email, company profile, API tokens) and usage metrics are retained for as long as your 
          account remains active or as needed for business and compliance purposes. You may request the deletion of your 
          developer account at any time by contacting support. 
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. SECURITY SAFEGUARDS</h2>
        <p>
          We use industry-standard security measures (including HTTPS/WSS encryption, token-based authentication, and 
          ephemeral in-memory processing) to protect the transmitted data against unauthorized access. However, no internet 
          transmission is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. YOUR CHOICES AND END-USER OBLIGATIONS</h2>
        <p>
          As an account holder, you have the right to access, update, or delete your account information at any time. 
          If you integrate our APIs into your application, you are processing data on behalf of your end-users. You are 
          legally obligated to ensure you have a valid lawful basis for capturing video/audio and processing biometric/health 
          data in their respective jurisdictions (e.g., GDPR, CCPA, BIPA).
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. CONTACT INFORMATION</h2>
        <div className={styles.contact}>
          <span>For privacy inquiries, data deletion requests, or questions regarding this policy, please contact us at:</span>
          <a href="mailto:support@auratechnologies.com">support@auratechnologies.com</a>
        </div>
      </section>
    </div>
  );
}
