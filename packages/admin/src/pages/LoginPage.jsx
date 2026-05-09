import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../store/authStore';

const TEAL   = '#00C2A8';
const NAVY   = '#0D1B2A';
const CARD   = '#0f2035';
const MUTED  = '#8A9BB0';
const CREAM  = '#F5F0E8';

const inp = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '12px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
  display: 'block',
};

const labelStyle = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: MUTED,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 7,
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const login    = useAdminAuth(s => s.login);

  const [tab,     setTab]     = useState('login');   // 'login' | 'reset'
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Reset-admin fields
  const [resetForm, setResetForm] = useState({ secret: '', new_password: '', email: '' });
  const [resetMsg,  setResetMsg]  = useState('');
  const [resetErr,  setResetErr]  = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(form.email, form.password);
      navigate(user.role === 'head_admin' ? '/dashboard' : '/my-listings');
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Reset admin ────────────────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setResetErr('');
    setResetMsg('');
    if (resetForm.new_password.length < 6) { setResetErr('Password must be at least 6 characters.'); return; }
    setResetLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://unilo-server.onrender.com/api'}/admin/reset-admin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resetForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setResetMsg(`✅ Done! Your email is ${data.email}. Go back and log in.`);
    } catch (err) {
      setResetErr(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const focusStyle = (e) => (e.target.style.borderColor = `${TEAL}80`);
  const blurStyle  = (e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)');

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${NAVY}; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
        <div style={{ width: '100%', maxWidth: 390 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, background: TEAL, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: CREAM, letterSpacing: '-0.02em' }}>Unilo Admin</span>
            </div>
            <p style={{ fontSize: 12, color: MUTED }}>Restricted access · Authorized personnel only</p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id: 'login', label: 'Sign in' },
              { id: 'reset', label: '🔑 Recover Access' },
            ].map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError(''); setResetErr(''); setResetMsg(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                  background: tab === t.id ? TEAL : 'transparent',
                  color:      tab === t.id ? NAVY  : MUTED,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: CARD, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px' }}>

            {/* ── LOGIN FORM ─────────────────────────────────────────────── */}
            {tab === 'login' && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: CREAM, marginBottom: 22 }}>Welcome back</h2>
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Email address</label>
                    <input type="email" required autoFocus placeholder="admin@unilo.ng"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      style={inp} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        style={{ ...inp, paddingRight: 42 }} onFocus={focusStyle} onBlur={blurStyle} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{ width: '100%', background: loading ? 'rgba(0,194,168,0.5)' : TEAL, color: NAVY, border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <button onClick={() => setTab('reset')}
                  style={{ width: '100%', background: 'none', border: 'none', color: MUTED, fontSize: 12, cursor: 'pointer', marginTop: 16, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <KeyIcon /> Forgot password / can't log in?
                </button>
              </>
            )}

            {/* ── RESET FORM ─────────────────────────────────────────────── */}
            {tab === 'reset' && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: CREAM, marginBottom: 6 }}>Recover Admin Access</h2>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 22, lineHeight: 1.6 }}>
                  Enter the reset secret to create a new password for the head_admin account.
                  The secret is <code style={{ background: 'rgba(0,194,168,0.12)', color: TEAL, padding: '1px 6px', borderRadius: 5 }}>unilo-reset-2026</code>
                </p>

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Admin email (optional — leave blank to use existing)</label>
                    <input type="email" placeholder="admin@unilo.ng"
                      value={resetForm.email} onChange={e => setResetForm(f => ({ ...f, email: e.target.value }))}
                      style={inp} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Reset secret *</label>
                    <input type="text" required placeholder="unilo-reset-2026"
                      value={resetForm.secret} onChange={e => setResetForm(f => ({ ...f, secret: e.target.value }))}
                      style={inp} onFocus={focusStyle} onBlur={blurStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>New password *</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPw ? 'text' : 'password'} required placeholder="Min 6 characters"
                        value={resetForm.new_password} onChange={e => setResetForm(f => ({ ...f, new_password: e.target.value }))}
                        style={{ ...inp, paddingRight: 42 }} onFocus={focusStyle} onBlur={blurStyle} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {resetErr && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                      {resetErr}
                    </div>
                  )}
                  {resetMsg && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#34d399', lineHeight: 1.5 }}>
                      {resetMsg}
                    </div>
                  )}

                  <button type="submit" disabled={resetLoading}
                    style={{ width: '100%', background: resetLoading ? 'rgba(0,194,168,0.5)' : TEAL, color: NAVY, border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: resetLoading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    {resetLoading ? 'Processing…' : 'Reset admin password'}
                  </button>

                  {resetMsg && (
                    <button type="button" onClick={() => setTab('login')}
                      style={{ width: '100%', background: 'none', border: `1px solid ${TEAL}40`, borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: TEAL, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      ← Back to login
                    </button>
                  )}
                </form>
              </>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(138,155,176,0.4)', marginTop: 20 }}>
            Unilo Admin · Only authorized team members
          </p>
        </div>
      </div>
    </>
  );
}
