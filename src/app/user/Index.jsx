import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/Dashboard';
import './index.css'
import { useEffect } from 'react';
import { wakeServer } from '../../api/serverCheck';

export default function App() {
  const { user, loading, logout, refresh } = useAuth();

  useEffect(() =>{
    wakeServer();
  }, []);

  if (loading) {
    return <Splash />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout page="dashboard" onNavigate={() => {}} onLogout={logout} user={user}>
      <DashboardPage user={user} onRefresh={refresh} />
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