import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const BRAND  = '#ff6b00';
const NAVY   = '#0a0a0a';
const CREAM  = '#f5f0e8';
const MUTED  = 'rgba(255,255,255,0.42)';
const GLASS  = 'rgba(255,255,255,0.05)';
const BORDER = 'rgba(255,255,255,0.1)';

const USER_TYPES = [
  {
    value: 'student',
    label: 'Student',
    icon: '🎓',
    color: '#ff6b00',
    desc: 'Find verified rooms near your university campus',
    fields: ['university', 'level'],
  },
  {
    value: 'landlord',
    label: 'Landlord',
    icon: '🏠',
    color: '#10b981',
    desc: 'List your property and reach thousands of students',
    fields: ['business_name', 'phone'],
  },
  {
    value: 'renter',
    label: 'Renter',
    icon: '👨‍👩‍👧',
    color: '#3b82f6',
    desc: 'Booking for a child, sibling, or family member',
    fields: ['phone'],
  },
  {
    value: 'guest',
    label: 'Guest',
    icon: '👤',
    color: MUTED,
    desc: 'Just browsing for now — create an account to save rooms',
    fields: [],
  },
];

const inp = (focused) => ({
  width: '100%',
  background: GLASS,
  border: `1px solid ${focused ? `${BRAND}60` : BORDER}`,
  borderRadius: 12,
  padding: '12px 14px',
  color: CREAM,
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
});

function Field({ label, optional, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}{optional && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>(optional)</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ type = 'text', placeholder, value, onChange, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...inp(focused), borderColor: error ? 'rgba(239,68,68,0.5)' : focused ? `${BRAND}60` : BORDER }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{error}</p>}
    </>
  );
}

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const register  = useAuthStore(s => s.register);

  const initialType = params.get('role') === 'landlord' ? 'landlord' : 'student';
  const [type,      setType]      = useState(initialType);
  const [step,      setStep]      = useState(1); // 1=choose type, 2=details
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm: '',
    university: '', level: '', department: '',
    business_name: '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const selected = USER_TYPES.find(t => t.value === type);

  const validate = () => {
    if (!form.first_name.trim()) return 'First name is required';
    if (!form.last_name.trim())  return 'Last name is required';
    if (!form.email.trim())      return 'Email is required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await register({
        first_name:    form.first_name.trim(),
        last_name:     form.last_name.trim(),
        email:         form.email.trim(),
        password:      form.password,
        phone:         form.phone || undefined,
        user_type:     type === 'student' ? 'student' : 'non_student',
        is_host:       type === 'landlord',
        // Extra fields
        university:    type === 'student' ? form.university : undefined,
        level:         type === 'student' ? form.level : undefined,
        department:    type === 'student' ? form.department : undefined,
        business_name: type === 'landlord' ? form.business_name : undefined,
        // Tag renters so profile can show "Renting for family"
        renter_mode:   type === 'renter',
      });
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <style>{`input::placeholder,select::placeholder{color:rgba(255,255,255,0.28)}select option{background:#111;color:#fff}`}</style>

      {/* Back */}
      <button onClick={() => step === 1 ? navigate(-1) : setStep(1)}
        style={{ position: 'absolute', top: 'max(20px,env(safe-area-inset-top))', left: 20, background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CREAM }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      {/* Step dots */}
      <div style={{ position: 'absolute', top: 'max(28px,env(safe-area-inset-top))', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
        {[1,2].map(s => (
          <div key={s} style={{ width: s === step ? 20 : 7, height: 7, borderRadius: 99, background: s === step ? BRAND : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22,1,0.36,1] }} style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: BRAND, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 14px' }}>🏠</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: CREAM, margin: 0 }}>
            {step === 1 ? 'Join Unilo' : `Sign up as ${selected?.label}`}
          </h1>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 5 }}>
            {step === 1 ? 'Who are you joining as?' : 'Create your free account'}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Type selection ─────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {USER_TYPES.map(t => (
                  <motion.button key={t.value} onClick={() => setType(t.value)} whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: type === t.value ? `${t.color}12` : GLASS,
                      border: `1.5px solid ${type === t.value ? `${t.color}50` : BORDER}`,
                      borderRadius: 16, padding: '14px 16px',
                      cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                    }}>
                    <span style={{ fontSize: 26, flexShrink: 0 }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: type === t.value ? t.color : CREAM, margin: 0, transition: 'color 0.15s' }}>{t.label}</p>
                      <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0', lineHeight: 1.4 }}>{t.desc}</p>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${type === t.value ? t.color : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.15s' }}>
                      {type === t.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color }} />}
                    </div>
                  </motion.button>
                ))}
              </div>

              <button onClick={() => setStep(2)}
                style={{ width: '100%', background: selected?.color || BRAND, color: type === 'guest' ? '#333' : '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s' }}>
                Continue as {selected?.label} →
              </button>

              {/* Guest can also just browse */}
              {type === 'guest' && (
                <p style={{ textAlign: 'center', fontSize: 13, color: MUTED, marginTop: 12 }}>
                  Or{' '}
                  <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: BRAND, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>
                    browse without an account
                  </button>
                </p>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Details form ───────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="First Name">
                    <TextInput placeholder="John" value={form.first_name} onChange={set('first_name')} />
                  </Field>
                  <Field label="Last Name">
                    <TextInput placeholder="Doe" value={form.last_name} onChange={set('last_name')} />
                  </Field>
                </div>

                <Field label="Email">
                  <TextInput type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                </Field>

                <Field label="Phone" optional>
                  <TextInput type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={set('phone')} />
                </Field>

                {/* Student-only fields */}
                {type === 'student' && (
                  <>
                    <Field label="University" optional>
                      <TextInput placeholder="University of Lagos" value={form.university} onChange={set('university')} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Department" optional>
                        <TextInput placeholder="Computer Science" value={form.department} onChange={set('department')} />
                      </Field>
                      <Field label="Level" optional>
                        <select value={form.level} onChange={set('level')} style={{ ...inp(false), cursor: 'pointer' }}>
                          <option value="">Any</option>
                          {['100L','200L','300L','400L','500L','Postgrad'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </Field>
                    </div>
                  </>
                )}

                {/* Landlord-only fields */}
                {type === 'landlord' && (
                  <Field label="Business / Property Name" optional>
                    <TextInput placeholder="Paradise Properties" value={form.business_name} onChange={set('business_name')} />
                  </Field>
                )}

                <Field label="Password">
                  <TextInput type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
                </Field>

                <Field label="Confirm Password">
                  <TextInput type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')}
                    error={form.confirm && form.confirm !== form.password ? "Passwords don't match" : ''} />
                </Field>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                    {error}
                  </motion.div>
                )}

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5, margin: 0 }}>
                  By signing up you agree to Unilo's Terms of Service and Privacy Policy.
                </p>

                <button type="submit" disabled={loading}
                  style={{ background: loading ? `${selected?.color || BRAND}60` : selected?.color || BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

        <p style={{ textAlign: 'center', fontSize: 14, color: MUTED, marginTop: 22 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
