import { useState } from 'react';

export default function Cancel() {
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
          {/* X icon */}
          <div style={{
            width: '64px', height: '64px',
            background: '#3a0a0a',
            border: '3px solid #7a1f1f',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.6), 0 0 16px rgba(122,31,31,0.2)',
            margin: '0 auto 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--pixel)', fontSize: '26px', color: '#e05050',
          }}>
            ✗
          </div>
 
          <h1 style={{
            fontFamily: 'var(--pixel)',
            fontSize: '13px', color: '#e05050',
            marginBottom: '18px', lineHeight: 2,
            letterSpacing: '1px',
          }}>
            Payment Cancelled
          </h1>
 
          <p style={{
            color: '#b8955a', marginBottom: '36px',
            lineHeight: 1.8, fontSize: '18px', fontFamily: 'var(--vt)',
          }}>
            No worries — you were not charged. Head back whenever you're ready.
          </p>
 
          <Link to="/">
            <StyledBtn>← Back to Store</StyledBtn>
          </Link>
        </div>
      </div>
    </div>
  );
}
 
function StyledBtn({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--pixel)',
        fontSize: '9px',
        color: '#6aaa30',
        background: hovered ? '#245e14' : '#1a4a0f',
        border: '2px solid #2d7a1a',
        padding: '14px 28px',
        cursor: 'pointer',
        letterSpacing: '2px',
        boxShadow: hovered ? '2px 3px 0 rgba(0,0,0,0.7)' : '2px 2px 0 rgba(0,0,0,0.6)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.08s',
      }}
    >
      {children}
    </button>
  );
}