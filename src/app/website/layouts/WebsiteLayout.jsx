import { NavLink, Outlet } from 'react-router-dom';
import styles from './WebsiteLayout.module.css';

const NAV_ITEMS = [
  { to: '/', label: 'HOME' },
  { to: '/docs', label: 'DOCS' },
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
        </NavLink>

        <nav className={styles.navLinks}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-all duration-300 active:scale-95 ${isActive ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.navActions}>
          <NavLink className="font-label-caps text-label-caps bg-primary text-on-primary px-6 py-2 rounded-DEFAULT active:scale-95 transition-transform hover:bg-primary-fixed duration-300" to="/auth">
            Get API Key
          </NavLink>
        </div>
      </header>

      <nav className={styles.mobileNav}>
        <div className={styles.mobileNavGlass}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.mobileNavLink} ${isActive ? styles.mobileNavActive : ''}`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink className={styles.mobileNavCta} to="/auth">
            Get API Key
          </NavLink>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className="text-primary-fixed">© 2026 Aura Spectrum. All rights reserved.</span>
          </div>
          <div className={styles.footerLinks}>
            <NavLink to="/terms">Terms</NavLink>
            <NavLink to="/privacy">Privacy</NavLink>
            <a href="mailto:info@ruxy.tech">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
