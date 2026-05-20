import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'DASHBOARD',  symbol: '◈' },
  { id: 'docs',      label: 'API DOCS',   symbol: '≡' },
];

export default function AppLayout({ page, onNavigate, onLogout, user, children }) {

  return (
    <div className={styles.shell}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.logoSymbol}>♥</span>
          <span className={styles.logoText}>rPPG</span>
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