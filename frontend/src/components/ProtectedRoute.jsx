import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        color: '#f0d0a0',
        fontFamily: 'var(--pixel)',
        fontSize: '12px',
        letterSpacing: '2px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #2a1500',
          borderTop: '4px solid #6aaa30',
          animation: 'spin 1s linear infinite',
          boxShadow: '0 0 10px rgba(106, 170, 48, 0.3)'
        }} />
        <span>[ Loading Session... ]</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
