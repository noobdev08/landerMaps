import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Success() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '560px', margin: '100px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="pixel-card fade-up">
          <div style={{
            width: '64px', height: '64px',
            background: 'var(--green)',
            border: '4px solid var(--dark-green)',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
            margin: '0 auto 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--pixel)', fontSize: '24px', color: 'var(--cream)'
          }}>✓</div>

          <h1 style={{ fontSize: '13px', color: 'var(--bright-green)', marginBottom: '16px', lineHeight: 2 }}>
            Payment Successful!
          </h1>

          <p style={{ color: 'var(--sand)', marginBottom: '28px', lineHeight: 1.7, fontSize: '22px' }}>
            Your purchase is confirmed. Head back to the map page and enter your email to download.
          </p>

          <Link to="/">
            <button className="pixel-btn pixel-btn-green" style={{ padding: '14px 28px' }}>
              ← Back to Store
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}