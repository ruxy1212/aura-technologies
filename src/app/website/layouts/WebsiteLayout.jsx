import { NavLink, Outlet } from 'react-router-dom';
import styles from './WebsiteLayout.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'HOME' },
  { to: '/docs', label: 'DOCS' },
  { to: '/terms', label: 'TERMS' },
  { to: '/privacy', label: 'PRIVACY' },
];

export default function WebsiteLayout() {
  return (
    <div className={styles.shell}>
      <header className={styles.navbar}>
        <NavLink to="/" className={styles.brand}>
          <span className={styles.logo}>
            <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
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
          <span className={styles.brandText}>AURA rPPG</span>
        </NavLink>

        <nav className={styles.navLinks}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navActive : ''}`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.navActions}>
          <a className={styles.navGhost} href="mailto:support@aurappg.com">
            CONTACT
          </a>
          <NavLink className={styles.navCta} to="/auth">
            GET API KEY
          </NavLink>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>AURA rPPG · Remote Photoplethysmography Infrastructure</span>
          <span>© 2026 Aura Labs. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
