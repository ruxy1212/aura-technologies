import styles from './Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.subtitle}>AURA rPPG</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>Last updated: May 21, 2026</p>
      </header>

      <section className={styles.section}>
        <h2>SUMMARY</h2>
        <p>
          This policy explains how Aura Labs collects, uses, and protects information
          when you access the Aura rPPG APIs and demo. If you integrate our SDK, you
          are responsible for sharing this policy with your users and obtaining any
          required consent.
        </p>
      </section>

      <section className={styles.section}>
        <h2>INFORMATION WE COLLECT</h2>
        <ul>
          <li>Account details such as email address, company name, and use case.</li>
          <li>Usage telemetry such as request logs, error reports, and API metrics.</li>
          <li>Frame payloads you transmit for processing, when applicable.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>HOW WE USE INFORMATION</h2>
        <ul>
          <li>Provide, maintain, and improve the service.</li>
          <li>Monitor security, prevent abuse, and enforce our terms.</li>
          <li>Communicate product updates and operational notices.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>DATA SHARING</h2>
        <p>
          We do not sell personal information. We may share data with trusted service
          providers who assist in hosting, analytics, or support, subject to strict
          confidentiality obligations.
        </p>
      </section>

      <section className={styles.section}>
        <h2>DATA RETENTION</h2>
        <p>
          We retain information only as long as needed to operate the service or meet
          legal requirements. You can request deletion of your account data by
          contacting us.
        </p>
      </section>

      <section className={styles.section}>
        <h2>SECURITY</h2>
        <p>
          We implement administrative, technical, and physical safeguards to protect
          data. No method of transmission is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </section>

      <section className={styles.section}>
        <h2>YOUR CHOICES</h2>
        <p>
          You may access, correct, or delete your account information by contacting us.
          If you are using Aura rPPG through a third-party integration, contact that
          provider for data requests.
        </p>
      </section>

      <section className={styles.section}>
        <h2>CONTACT</h2>
        <div className={styles.contact}>
          <span>Privacy questions?</span>
          <a href="mailto:support@aurappg.com">support@aurappg.com</a>
        </div>
      </section>
    </div>
  );
}
