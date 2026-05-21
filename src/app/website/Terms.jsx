import styles from './Legal.module.css';

export default function Terms() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.subtitle}>AURA rPPG</p>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>Last updated: May 21, 2026</p>
      </header>

      <section className={styles.section}>
        <h2>OVERVIEW</h2>
        <p>
          Aura rPPG provides software that analyzes camera frames to produce wellness
          and engagement signals. The service is for informational purposes only and
          does not diagnose, treat, prevent, or cure any medical condition.
        </p>
      </section>

      <section className={styles.section}>
        <h2>ELIGIBILITY</h2>
        <p>
          You must be at least 18 years old and have authority to accept these terms
          on behalf of your organization. By using the service, you confirm you meet
          these requirements.
        </p>
      </section>

      <section className={styles.section}>
        <h2>ACCOUNTS & API KEYS</h2>
        <ul>
          <li>Keep your API keys confidential and rotate them if compromised.</li>
          <li>You are responsible for all usage that occurs under your credentials.</li>
          <li>We may suspend access if we detect abuse or security risks.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>ACCEPTABLE USE</h2>
        <ul>
          <li>Use the service only for lawful purposes and in compliance with applicable laws.</li>
          <li>Do not reverse engineer, scrape, or attempt to disrupt the service.</li>
          <li>Do not upload unlawful, harmful, or misleading content.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>INTELLECTUAL PROPERTY</h2>
        <p>
          The Aura rPPG software, documentation, and branding are owned by Aura Labs.
          You may not copy, modify, or distribute any portion of the service without
          written permission.
        </p>
      </section>

      <section className={styles.section}>
        <h2>DISCLAIMERS</h2>
        <p>
          The service is provided on an "as is" and "as available" basis. We make no
          warranties regarding accuracy, reliability, or fitness for a particular
          purpose. Use the service at your own risk.
        </p>
      </section>

      <section className={styles.section}>
        <h2>LIMITATION OF LIABILITY</h2>
        <p>
          To the maximum extent permitted by law, Aura Labs is not liable for any
          indirect, incidental, or consequential damages arising from your use of the
          service or inability to access it.
        </p>
      </section>

      <section className={styles.section}>
        <h2>CHANGES</h2>
        <p>
          We may update these terms periodically. Continued use of the service after
          updates means you accept the revised terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2>CONTACT</h2>
        <div className={styles.contact}>
          <span>Questions about these terms?</span>
          <a href="mailto:support@aurappg.com">support@aurappg.com</a>
        </div>
      </section>
    </div>
  );
}
