import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
const BRAND  = '#ff6b00';
const NAVY   = '#0a0a0a';
const CREAM  = '#f5f0e8';
const MUTED  = 'rgba(255,255,255,0.42)';
const GLASS  = 'rgba(255,255,255,0.06)';
const BORDER = 'rgba(255,255,255,0.1)';
const GREEN  = '#10b981';
const BLUE   = '#3b82f6';

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);
const StudentIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const LandlordIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const RenterIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const GuestIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

// ── REGISTER TYPE SHORTCUTS ───────────────────────────────────────────────────
const SIGNUP_TYPES = [
  { label: 'Student',  IconComp: StudentIcon,  color: BRAND,  to: '/register?role=student'  },
  { label: 'Landlord', IconComp: LandlordIcon, color: GREEN,  to: '/register?role=landlord' },
  { label: 'Renter',   IconComp: RenterIcon,   color: BLUE,   to: '/register?role=renter'   },
];

// ── INPUT WRAPPER ─────────────────────────────────────────────────────────────
function InputRow({ label, LeadIcon, children, note }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
        <LeadIcon />
        {label}
      </label>
      {children}
      {note && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>{note}</p>}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [focused,  setFocused]  = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || 'Incorrect email or password. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = field => ({
    width: '100%',
    background: focused === field ? 'rgba(255,255,255,0.07)' : GLASS,
    border: `1px solid ${error && field === 'password' ? 'rgba(239,68,68,0.4)' : focused === field ? `${BRAND}70` : BORDER}`,
    borderRadius: 12,
    padding: '13px 14px',
    color: CREAM,
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'all 0.15s',
    boxSizing: 'border-box',
  });

  return (
    <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        input::placeholder { color: rgba(255,255,255,0.28); }
        * { box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <motion.button onClick={() => navigate(-1)} whileTap={{ scale: 0.92 }}
          style={{ width: 38, height: 38, borderRadius: '50%', background: GLASS, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CREAM }}>
          <BackIcon />
        </motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: BRAND, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoIcon />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: CREAM }}>Unilo</span>
        </div>
        <div style={{ width: 38 }} /> {/* spacer */}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '8px 20px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', maxWidth: 440, width: '100%', margin: '0 auto' }}>

        {/* Hero text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 900, color: CREAM, margin: '0 0 6px', lineHeight: 1.15, letterSpacing: '-0.025em' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 32, lineHeight: 1.6 }}>
            Log in to your Unilo account to continue.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4, ease: [0.22,1,0.36,1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>

          {/* Email */}
          <InputRow label="Email Address" LeadIcon={EmailIcon}>
            <input
              type="email" required autoFocus autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle('email')}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
            />
          </InputRow>

          {/* Password */}
          <InputRow label="Password" LeadIcon={LockIcon}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle('password'), paddingRight: 44 }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </InputRow>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}><AlertIcon /></span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            style={{ width: '100%', background: loading ? `${BRAND}60` : BRAND, color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', marginTop: 4 }}>
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Logging in…
              </>
            ) : (
              <>Log in <ArrowRightIcon /></>
            )}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              New to Unilo?
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Sign-up type cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
            {SIGNUP_TYPES.map(({ label, IconComp, color, to }) => (
              <motion.button key={label} onClick={() => navigate(to)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                style={{ background: `${color}0d`, border: `1px solid ${color}28`, borderRadius: 16, padding: '16px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={18} color={color} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color, lineHeight: 1 }}>{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Browse as guest */}
          <motion.button onClick={() => navigate('/')} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '13px', fontSize: 13, fontWeight: 500, color: MUTED, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
            <GuestIcon size={16} color={MUTED} />
            Browse without an account
          </motion.button>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
