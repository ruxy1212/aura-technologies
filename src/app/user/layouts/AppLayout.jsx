import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'DASHBOARD',  symbol: '◈' },
];

export default function AppLayout({ page, onNavigate, onLogout, user, children }) {

  return (
    <div className={styles.shell}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.logoSymbol}>
            <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" style={{ height: '28px' }}>
              <defs>
                <linearGradient id="auraDarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor:'#00D4FF',stopOpacity:'1' }} />
                  <stop offset="100%" style={{ stopColor:'#FFFFFF',stopOpacity:'1' }} />
                </linearGradient>
              </defs>
              <g fill="none" stroke="url(#auraDarkGradient)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 55 L35 15 L50 55 M28 42 L42 42" />
                <path d="M50 55 Q55 55 58 50 L58 30 M58 30 L58 45 Q58 55 68 55 Q78 55 78 45 L78 30" />
                <path d="M78 55 L88 55 L88 30 M88 30 L88 42 L100 42 Q112 42 112 30 Q112 18 100 18 L88 18 M100 42 L115 55" />
                <path d="M115 55 C130 55 135 55 145 55 L155 55 L165 10 L185 70 L200 35 L215 55 L225 55" />
                <path d="M168 45 L190 45" strokeWidth="4.5" />
              </g>
            </svg>
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.pageLabel}>
            {NAV_ITEMS.find(n => n.id === page)?.label ?? page.toUpperCase()}
          </span>
        </div>

        <div className={styles.topbarRight}>
          <span className={styles.userEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>
            SIGN OUT
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <nav className={styles.sidebar}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map(item => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${page === item.id ? styles.active : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <span className={styles.navSymbol}>{item.symbol}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {page === item.id && <span className={styles.activeBar} />}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.sidebarFooter}>
            <span className={styles.versionTag}>v0.1.0</span>
          </div>
        </nav>

        {/* Main content area */}
        <main className={styles.main}>
          <div className={styles.scanline} aria-hidden="true" />
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}