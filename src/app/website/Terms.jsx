import styles from './Legal.module.css';
import usePageTitle from '../../hooks/usePageTitle';

export default function Terms() {
  usePageTitle('Terms of Service');

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.subtitle}>AURA SPECTRUM</p>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>Last updated: May 21, 2026</p>
      </header>

      <section className={styles.section}>
        <h2>1. OVERVIEW AND ACCEPTANCE OF TERMS</h2>
        <p>
          These Terms of Service ("Terms") govern your use of the APIs, WebSockets, SDKs, and associated software 
          provided by Aura Spectrum Inc. ("we," "us," or "our"), including but not limited to the <strong>AuRa Telemetry</strong> 
          and <strong>AuRa Sentience</strong> engines (collectively, the "Service"). By accessing or using the Service, 
          you agree to be bound by these Terms on behalf of yourself or the entity you represent. If you do not agree 
          with these Terms, you may not use the Service.
        </p>
        <p>
          AuRa Telemetry provides remote photoplethysmography (rPPG) and multimodal intellisense capabilities that 
          extract real-time biometric and physiological signals from camera video frames. AuRa Sentience provides 
          voice-based intellisense intended to interpret vocal signals for the analysis of cognitive states. 
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. NOT A MEDICAL DEVICE</h2>
        <p>
          <strong>DISCLAIMER:</strong> The Service is not an FDA-approved medical device, nor is it intended to diagnose, 
          treat, cure, or prevent any disease or medical condition. The physiological and cognitive signals derived 
          (such as pulse rate, HRV, breathing rate, stress, or depression indicators) are strictly for informational, 
          wellness, research, and non-diagnostic purposes. You are solely responsible for ensuring that your application 
          or integration does not mislead users into believing that the Service provides medical advice or clinical diagnosis.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. ACCOUNT REGISTRATION AND SECURITY</h2>
        <p>
          To access the Service, you must register via our magic-link authentication system. You are responsible for 
          maintaining the confidentiality of your magic links and your generated API keys. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration.</li>
          <li>Keep your API keys confidential and securely rotate them periodically or if compromised.</li>
          <li>Take full responsibility for all activities and Compute Units (CU) usage that occur under your account.</li>
          <li>Promptly notify us of any unauthorized use or suspected security breach of your account.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. USAGE, FEES, AND COMPUTE UNITS (CU)</h2>
        <p>
          The Service operates on a usage-based billing model measured in Compute Units (CU). Features are charged at a 
          specific CU rate per minute. Free tiers are granted a strictly limited monthly balance that resets periodically. 
          Aura Spectrum Inc. reserves the right to modify CU pricing, change tier limits, or transition features from free 
          to paid at our sole discretion upon reasonable notice. Overage or usage beyond free tiers will require an upgraded 
          subscription plan. We reserve the right to automatically terminate data streams or suspend your account if your 
          CU balance is exhausted or your account falls into arrears.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. ACCEPTABLE USE AND RESTRICTIONS</h2>
        <p>You agree not to use the Service in any manner that is unlawful or harms us, our users, or others. Specifically, you shall not:</p>
        <ul>
          <li>Use the Service in any way that violates applicable privacy laws, including the unauthorized collection of biometric data without informed consent.</li>
          <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code or proprietary models of AuRa Telemetry or AuRa Sentience.</li>
          <li>Resell, frame, sub-license, or otherwise unlawfully distribute the Service as a standalone API.</li>
          <li>Interfere with or disrupt the integrity, security, or performance of the Service infrastructure.</li>
          <li>Use the Service to make automated decisions that materially impact individuals' legal rights, employment, or medical care.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>6. INTELLECTUAL PROPERTY</h2>
        <p>
          All rights, title, and interest in and to the Service, including all models, algorithms, algorithms, APIs, SDKs, 
          and documentation, are and will remain the exclusive property of Aura Spectrum Inc. and its licensors. These Terms 
          do not grant you any right to use the Aura Spectrum Inc. trademarks, logos, or brand features without our prior 
          written consent.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. WARRANTIES AND DISCLAIMERS</h2>
        <p>
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. 
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AURA SPECTRUM INC. EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING, 
          BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND 
          ACCURACY OF THE BIOMETRIC OR COGNITIVE DATA PRODUCED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, 
          SECURE, OR ERROR-FREE.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. LIMITATION OF LIABILITY</h2>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL AURA SPECTRUM INC. OR ITS AFFILIATES BE LIABLE FOR ANY 
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR MULTIPLE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
          WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING 
          FROM YOUR ACCESS TO OR USE OF THE SERVICE, EVEN IF AURA SPECTRUM INC. HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. MODIFICATIONS TO TERMS</h2>
        <p>
          Aura Spectrum Inc. reserves the right to modify these Terms at any time. We will post the most current version of 
          these Terms on this page with the "Last updated" date. By continuing to access or use the Service after revisions 
          become effective, you agree to be bound by the revised Terms.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. CONTACT</h2>
        <div className={styles.contact}>
          <span>If you have any questions about these Terms, please contact us at:</span>
          <a href="mailto:info@ruxy.tech">info@ruxy.tech</a>
        </div>
      </section>
    </div>
  );
}
