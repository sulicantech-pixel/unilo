import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const S = {
  page: {
    minHeight: '100dvh', background: '#0a0a0a',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Outfit', sans-serif",
  },
  topBar: { padding: '52px 20px 0' },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.38)', display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 13, fontFamily: "'Outfit', sans-serif",
  },
  body: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '32px 20px 120px',
    maxWidth: 440, margin: '0 auto', width: '100%',
  },
  logo: {
    width: 42, height: 42, borderRadius: 12, background: '#ff6b00',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  h1: { fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px' },
  sub: { color: 'rgba(255,255,255,0.38)', fontSize: 14, marginBottom: 32 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 7 },
  input: {
    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 14,
    fontFamily: "'Outfit', sans-serif", outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', background: '#ff6b00', color: '#fff', border: 'none',
    borderRadius: 14, padding: '16px 0', fontSize: 15, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'background 0.2s',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 12, padding: '12px 16px', marginBottom: 20,
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email.trim()) { setError('Enter your email address'); return; }
    if (!form.password)     { setError('Enter your password'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.user, data.token);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const focusStyle  = { borderColor: 'rgba(255,107,0,0.5)' };
  const normalStyle = { borderColor: 'rgba(255,255,255,0.1)' };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Back */}
      <div style={S.topBar}>
        <button onClick={() => navigate(-1)} style={S.backBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
      </div>

      <motion.div
        style={S.body}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo mark */}
        <div style={S.logo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>

        <h1 style={S.h1}>Welcome back</h1>
        <p style={S.sub}>Log in to continue finding your room.</p>

        {error && (
          <div style={S.errorBox}>
            <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={S.label}>Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@gmail.com"
            style={S.input}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, normalStyle)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <label style={S.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              placeholder="••••••••"
              style={{ ...S.input, paddingRight: 48 }}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => Object.assign(e.target.style, normalStyle)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={() => setShowPw(s => !s)}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.38)' }}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        {/* Forgot */}
        <div style={{ textAlign: 'right', marginBottom: 28 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b00', fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
          onMouseEnter={e => { if (!loading) e.target.style.background = '#e55f00'; }}
          onMouseLeave={e => { e.target.style.background = '#ff6b00'; }}
        >
          {loading
            ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : 'Log in →'
          }
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#ff6b00', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Register CTA */}
        <Link
          to="/register"
          style={{
            display: 'block', textAlign: 'center',
            background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)',
            borderRadius: 14, padding: '14px 0', fontSize: 14, fontWeight: 600,
            color: '#ff6b00', textDecoration: 'none',
          }}
        >
          Create a new account
        </Link>
      </motion.div>
    </div>
  );
}
