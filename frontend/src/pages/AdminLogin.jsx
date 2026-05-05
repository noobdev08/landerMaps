import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import Navbar from '../components/Navbar';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '420px', margin: '100px auto', padding: '0 24px' }}>
        <div className="pixel-card fade-up">
          <div style={{
            textAlign: 'center',
            marginBottom: '28px',
            paddingBottom: '20px',
            borderBottom: '3px solid var(--mid-brown)'
          }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'var(--dark-stone)',
              border: '4px solid var(--stone)',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.5)',
              margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--pixel)', fontSize: '20px'
            }}>🔐</div>
            <h1 style={{ fontSize: '11px', color: 'var(--cream)', lineHeight: 2 }}>Admin Login</h1>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', display: 'block', marginBottom: '8px' }}>
              Username
            </label>
            <input className="pixel-input" type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontFamily: 'var(--pixel)', fontSize: '8px', color: 'var(--stone)', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input className="pixel-input" type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {error && <div className="notif-error" style={{ marginBottom: '16px' }}>{error}</div>}

          <button className="pixel-btn pixel-btn-green" style={{ width: '100%', padding: '14px' }}
            onClick={handleSubmit} disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </div>
      </div>
    </div>
  );
}