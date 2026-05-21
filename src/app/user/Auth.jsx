import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginPage from './pages/Login';
import './index.css';

export default function AuthRoute() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <AuthSplash />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleLogin(apiKey) {
    login(apiKey);
    navigate('/dashboard', { replace: true });
  }

  return <LoginPage onLogin={handleLogin} />;
}

function AuthSplash() {
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
      CHECKING SESSION...
    </div>
  );
}
