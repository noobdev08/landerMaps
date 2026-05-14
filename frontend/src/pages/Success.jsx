import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
 
export function Success() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ maxWidth: '520px', margin: '80px auto 0', padding: '0 24px', textAlign: 'center' }}>
        <div style={{
          background: '#110900',
          border: '2px solid #2a1500',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.8)',
          padding: '48px 36px',
          animation: 'fadeUp 0.3s ease',
        }}>
          {/* Check icon */}
          <div style={{
            width: '64px', height: '64px',
            background: '#1a4a0f',
            border: '3px solid #2d7a1a',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.6), 0 0 20px rgba(45,122,26,0.3)',
            margin: '0 auto 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--pixel)', fontSize: '26px', color: '#6aaa30',
          }}>
            ✓
          </div>
 
          <h1 style={{
            fontFamily: 'var(--pixel)',
            fontSize: '13px', color: '#6aaa30',
            marginBottom: '18px', lineHeight: 2,
            textShadow: '2px 2px 0 #1a4a0f',
            letterSpacing: '1px',
          }}>
            Payment Successful!
          </h1>
 
          <p style={{
            color: '#b8955a', marginBottom: '36px',
            lineHeight: 1.8, fontSize: '18px', fontFamily: 'var(--vt)',
          }}>
            Your purchase is confirmed. Head back to the map page and enter your email to get your download.
          </p>
 
          <Link to="/">
            <StyledBtn>← Back to Store</StyledBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}