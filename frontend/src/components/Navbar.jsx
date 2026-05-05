import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav>
      <div style={{
        background: 'linear-gradient(180deg, #1a0d00 0%, #120900 100%)',
        borderBottom: '3px solid var(--mid-brown)',
        boxShadow: '0 4px 0 rgba(0,0,0,0.8)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Grass block icon */}
            {/* Profile Image */}
            <img
              src="./maybe_profile.png"
              alt="Profile"
              style={{
                width: '40px',
                height: '38px',
                imageRendering: 'pixelated',
                border: '3px solid rgba(0,0,0,0.6)',
                boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.15)'
              }}
            />
            <div>
              <div style={{
                fontFamily: 'var(--pixel)',
                fontSize: '13px',
                color: 'var(--cream)',
                textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
                animation: 'flicker 8s infinite',
              }}>
                Map_Buildz
              </div>
              <div style={{
                fontFamily: 'var(--vt)',
                fontSize: '16px',
                color: 'var(--stone)',
                marginTop: '2px'
              }}>
                Great Minecraft Maps
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/"><button className="pixel-btn pixel-btn-brown">Store</button></Link>
            {isAdmin ? (
              <>
                <Link to="/admin"><button className="pixel-btn pixel-btn-green">Dashboard</button></Link>
                <button className="pixel-btn pixel-btn-red" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link to="/admin/login"><button className="pixel-btn pixel-btn-brown">Admin</button></Link>
            )}
          </div>
        </div>
      </div>
      <div className="grass-bar" />
      <div className="dirt-bar" />
      <div className="stone-bar" />
    </nav>
  );
}