import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const isAdmin = !!token;

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{
        background: 'linear-gradient(180deg, #1c0e02 0%, #110800 100%)',
        borderBottom: '3px solid var(--mid-brown)',
        boxShadow: '0 4px 0 rgba(0,0,0,0.9)',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
            <div style={{ position: 'relative' }}>
              <img
                src="/maybe_profile.png"
                alt="MB"
                style={{
                  width: '42px',
                  height: '42px',
                  imageRendering: 'pixelated',
                  border: '2px solid var(--mid-brown)',
                  boxShadow: '3px 3px 0 rgba(0,0,0,0.6), inset 1px 1px 0 rgba(255,255,255,0.1)',
                  display: 'block',
                }}
              />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--pixel)',
                fontSize: '13px',
                color: 'var(--cream)',
                textShadow: '2px 2px 0 rgba(0,0,0,0.9)',
                letterSpacing: '1px',
                animation: 'flicker 8s infinite',
              }}>
                Map_Buildz
              </div>
              <div style={{
                fontFamily: 'var(--vt)',
                fontSize: '14px',
                color: '#7a6a55',
                marginTop: '1px',
                letterSpacing: '0.5px',
              }}>
                Great Minecraft Maps
              </div>
            </div>
          </Link>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/">
              <NavBtn variant="brown">Store</NavBtn>
            </Link>
            {isAdmin ? (
              <>
                <Link to="/admin">
                  <NavBtn variant="green">Dashboard</NavBtn>
                </Link>
                <NavBtn variant="red" onClick={handleLogout}>Logout</NavBtn>
              </>
            ) : (
              <Link to="/admin/login">
                <NavBtn variant="brown">Admin</NavBtn>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Minecraft grass/dirt bar */}
      <div style={{ display: 'flex', height: '10px', overflow: 'hidden' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            background: i % 4 === 0 ? '#5a8a2f' : i % 4 === 1 ? '#4a7a1f' : i % 4 === 2 ? '#6aaa30' : '#3d6618',
          }} />
        ))}
      </div>
    </nav>
  );
}

function NavBtn({ variant = 'brown', children, onClick }) {
  const colors = {
    brown: { bg: '#3d2007', border: '#6b3a10', hover: '#4e2a0a', text: '#d4b483' },
    green: { bg: '#1a4a0f', border: '#2d7a1a', hover: '#245e14', text: '#6aaa30' },
    red:   { bg: '#4a0f0f', border: '#7a1f1f', hover: '#5e1414', text: '#e05050' },
  };
  const c = colors[variant];

  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--pixel)',
        fontSize: '8px',
        color: c.text,
        background: c.bg,
        border: `2px solid ${c.border}`,
        padding: '8px 16px',
        cursor: 'pointer',
        letterSpacing: '1px',
        boxShadow: `2px 2px 0 rgba(0,0,0,0.6)`,
        transition: 'all 0.08s',
        textTransform: 'uppercase',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = c.hover;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = `2px 3px 0 rgba(0,0,0,0.7)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = c.bg;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `2px 2px 0 rgba(0,0,0,0.6)`;
      }}
    >
      {children}
    </button>
  );
}