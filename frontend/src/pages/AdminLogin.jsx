import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import Navbar from '../components/Navbar';
 
export function AdminLogin() {
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
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ maxWidth: '400px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{
          background: '#110900',
          border: '2px solid #2a1500',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.8)',
          padding: '36px 32px',
          animation: 'fadeUp 0.3s ease',
        }}>
          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: '2px solid #1a0d00' }}>
            <div style={{
              width: '52px', height: '52px',
              background: '#0a0600',
              border: '2px solid #3d2007',
              boxShadow: '3px 3px 0 rgba(0,0,0,0.6)',
              margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>
              🔐
            </div>
            <h1 style={{
              fontFamily: 'var(--pixel)',
              fontSize: '11px', color: '#f0d0a0',
              letterSpacing: '2px', lineHeight: 2,
            }}>
              Admin Login
            </h1>
          </div>
 
          {/* Fields */}
          <LoginField
            label="Username"
            value={form.username}
            onChange={v => setForm({ ...form, username: v })}
            type="text"
          />
          <LoginField
            label="Password"
            value={form.password}
            onChange={v => setForm({ ...form, password: v })}
            type="password"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
 
          {error && (
            <div style={{
              fontFamily: 'var(--pixel)', fontSize: '7px', color: '#e05050',
              background: 'rgba(74,15,15,0.4)', border: '2px solid #7a1f1f',
              padding: '10px 12px', marginBottom: '18px', letterSpacing: '0.5px',
            }}>
              {error}
            </div>
          )}
 
          <LoginBtn onClick={handleSubmit} disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </LoginBtn>
        </div>
      </div>
    </div>
  );
}
 
function LoginField({ label, value, onChange, type, onKeyDown }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{
        fontFamily: 'var(--pixel)', fontSize: '8px', color: '#7a6a55',
        display: 'block', marginBottom: '8px', letterSpacing: '0.5px',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: '#0a0600',
          border: `2px solid ${focused ? '#6b3a10' : '#2a1500'}`,
          color: '#d4b483',
          fontFamily: 'var(--vt)',
          fontSize: '18px',
          padding: '12px 14px',
          boxSizing: 'border-box',
          outline: 'none',
          transition: 'border-color 0.1s',
        }}
      />
    </div>
  );
}
 
function LoginBtn({ onClick, disabled, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        fontFamily: 'var(--pixel)',
        fontSize: '9px',
        color: disabled ? '#555' : '#6aaa30',
        background: disabled ? '#1a1a1a' : hovered ? '#245e14' : '#1a4a0f',
        border: `2px solid ${disabled ? '#333' : '#2d7a1a'}`,
        padding: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '2px',
        boxShadow: hovered && !disabled ? '2px 3px 0 rgba(0,0,0,0.7)' : '2px 2px 0 rgba(0,0,0,0.6)',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        transition: 'all 0.08s',
        marginTop: '8px',
      }}
    >
      {children}
    </button>
  );
}

export default AdminLogin;