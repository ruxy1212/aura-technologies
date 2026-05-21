import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import DocsPage from './pages/Docs';
import './index.css'

export default function App() {
  const { user, loading, login, logout, refresh } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) {
    return <Splash />;
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <AppLayout page={page} onNavigate={setPage} onLogout={logout} user={user}>
      {page === 'dashboard' && (
        <DashboardPage user={user} onRefresh={refresh} />
      )}
      {page === 'docs' && (
        <DocsPage />
      )}
    </AppLayout>
  );
}

function Splash() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '0.18em',
      color: 'var(--text-dim)',
    }}>
      INITIALISING...
    </div>
  );
}