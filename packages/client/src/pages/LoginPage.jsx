import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const BRAND  = '#ff6b00';
const NAVY   = '#0a0a0a';
const CREAM  = '#f5f0e8';
const MUTED  = 'rgba(255,255,255,0.42)';
const GLASS  = 'rgba(255,255,255,0.05)';
const BORDER = 'rgba(255,255,255,0.1)';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const USER_QUICK = [
  { label: 'Student',  icon: '🎓', color: BRAND,      to: '/register?role=student'   },
  { label: 'Landlord', icon: '🏠', color: '#10b981',  to: '/register?role=landlord'  },
  { label: 'Renter',   icon: '👨‍👩‍👧', color: '#3b82f6', to: '/register?role=renter'    },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login    = useAuthStore(s => s.login);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [focused,  setFocused]  = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    background: GLASS,
    border: `1px solid ${focused === field ? `${BRAND}60` : BORDER}`,
    borderRadius: 12,
    padding: '13px 14px',
    color: CREAM,
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
  });

  return (
    <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <style>{`input::placeholder{color:rgba(255,255,255,0.28)}`}</style>

      {/* Back */}
      <button onClick={() => navigate(-1)}
        style={{ position: 'absolute', top: 'max(20px,env(safe-area-inset-top))', left: 20, background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CREAM }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 400 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: BRAND, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>🏠</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: CREAM, margin: 0 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 5 }}>Log in to your Unilo account</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" required autoFocus placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle('email')}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle('password'), paddingRight: 44 }}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')} />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={loading}
            style={{ background: loading ? `${BRAND}60` : BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4, transition: 'background 0.15s' }}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>New to Unilo?</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Sign up type cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {USER_QUICK.map(t => (
            <motion.button key={t.label} onClick={() => navigate(t.to)} whileTap={{ scale: 0.96 }}
              style={{
                background: `${t.color}0d`, border: `1px solid ${t.color}30`,
                borderRadius: 14, padding: '14px 8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontFamily: 'DM Sans, sans-serif',
              }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.label}</span>
            </motion.button>
          ))}
        </div>

        <button onClick={() => navigate('/')}
          style={{ width: '100%', background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px', fontSize: 13, color: MUTED, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          👤 Continue as Guest
        </button>
      </motion.div>
    </div>
  );
}
