import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
const StudentIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);
const LandlordIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const RenterIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const GuestIcon = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
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
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M13 6l6 6-6 6"/>
  </svg>
);

// ── USER TYPES ─────────────────────────────────────────────────────────────────
// Maps to server's user_type + is_host correctly
const USER_TYPES = [
  {
    value:     'student',
    label:     'Student',
    tagline:   'Looking for a room',
    desc:      'Find verified, affordable rooms near your university. No broker fees.',
    IconComp:  StudentIcon,
    color:     BRAND,
    // → server: user_type: 'student', is_host: false
    server_type: 'student',
    server_host: false,
    extraFields: ['university', 'department', 'level'],
  },
  {
    value:     'landlord',
    label:     'Landlord',
    tagline:   'Listing a property',
    desc:      'List your rooms and reach thousands of students across Nigeria.',
    IconComp:  LandlordIcon,
    color:     GREEN,
    // → server: user_type: 'non_student', is_host: true
    server_type: 'non_student',
    server_host: true,
    extraFields: ['business_name', 'phone'],
  },
  {
    value:     'renter',
    label:     'Renter',
    tagline:   'Booking for family',
    desc:      'A parent, guardian, or sponsor securing accommodation for a student.',
    IconComp:  RenterIcon,
    color:     BLUE,
    // → server: user_type: 'non_student', is_host: false, renter_mode: true
    server_type: 'non_student',
    server_host: false,
    extraFields: ['phone'],
  },
  {
    value:     'guest',
    label:     'Guest',
    tagline:   'Just browsing',
    desc:      'Create a free account to save listings and compare rooms.',
    IconComp:  GuestIcon,
    color:     MUTED,
    // → server: user_type: 'non_student', is_host: false
    server_type: 'non_student',
    server_host: false,
    extraFields: [],
  },
];

// ── FIELD COMPONENT ───────────────────────────────────────────────────────────
function Field({ label, optional, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 10, fontWeight: 700, color: error ? '#f87171' : MUTED,
        letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {label}
        {optional && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>· optional</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 11, color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertIcon /> {error}
        </span>
      )}
    </div>
  );
}

function Input({ type = 'text', placeholder, value, onChange, error, suffix }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const isPw = type === 'password';

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={isPw ? (showPw ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: focused ? 'rgba(255,255,255,0.07)' : GLASS,
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? `${BRAND}70` : BORDER}`,
          borderRadius: 12,
          padding: isPw || suffix ? '13px 44px 13px 14px' : '13px 14px',
          color: CREAM,
          fontSize: 14,
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          transition: 'all 0.15s',
          boxSizing: 'border-box',
        }}
      />
      {isPw && (
        <button type="button" onClick={() => setShowPw(s => !s)}
          style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          {showPw ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        background: focused ? 'rgba(255,255,255,0.07)' : GLASS,
        border: `1px solid ${focused ? `${BRAND}70` : BORDER}`,
        borderRadius: 12,
        padding: '13px 14px',
        color: value ? CREAM : MUTED,
        fontSize: 14,
        fontFamily: 'DM Sans, sans-serif',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none',
        transition: 'all 0.15s',
      }}
    >
      {placeholder && <option value="" style={{ background: '#111', color: MUTED }}>{placeholder}</option>}
      {options.map(o => (
        <option key={o.value || o} value={o.value || o} style={{ background: '#111', color: CREAM }}>
          {o.label || o}
        </option>
      ))}
    </select>
  );
}

// ── STEP 1: TYPE CARD ─────────────────────────────────────────────────────────
function TypeCard({ type, selected, onSelect }) {
  const { label, tagline, desc, IconComp, color, value } = type;
  const isActive = selected === value;

  return (
    <motion.button
      onClick={() => onSelect(value)}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        background: isActive ? `${color}10` : GLASS,
        border: `1.5px solid ${isActive ? `${color}55` : BORDER}`,
        borderRadius: 18, padding: '16px 18px',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 0.18s', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: isActive ? color : 'transparent', borderRadius: '18px 0 0 18px', transition: 'background 0.18s' }} />

      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
        background: isActive ? `${color}18` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${isActive ? `${color}30` : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
      }}>
        <IconComp size={22} color={isActive ? color : MUTED} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: isActive ? color : CREAM, margin: 0, fontFamily: 'Syne, sans-serif', transition: 'color 0.18s' }}>{label}</p>
          <p style={{ fontSize: 11, color: isActive ? `${color}90` : 'rgba(255,255,255,0.3)', margin: 0, fontStyle: 'italic' }}>{tagline}</p>
        </div>
        <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>

      {/* Radio */}
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 4,
        border: `2px solid ${isActive ? color : 'rgba(255,255,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
        background: isActive ? color : 'transparent',
      }}>
        {isActive && <CheckIcon />}
      </div>
    </motion.button>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const { register } = useAuthStore();

  const initType = params.get('role') === 'landlord' ? 'landlord' : 'student';
  const [type,    setType]    = useState(initType);
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    password: '', confirm: '',
    university: '', department: '', level: '',
    business_name: '',
  });

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const selected = USER_TYPES.find(t => t.value === type);

  // Client-side validation before submit
  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim())  errs.last_name  = 'Required';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email';
    if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirm) errs.confirm = "Passwords don't match";
    return errs;
  };

  const onSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setError('');
    setLoading(true);

    try {
      // Map UI type → correct server fields
      await register({
        first_name:    form.first_name.trim(),
        last_name:     form.last_name.trim(),
        email:         form.email.trim().toLowerCase(),
        password:      form.password,
        phone:         form.phone || undefined,
        user_type:     selected.server_type,    // 'student' | 'non_student'
        is_host:       selected.server_host,    // true only for landlord
        renter_mode:   type === 'renter',
        // Student fields
        university:    type === 'student' ? form.university  : undefined,
        department:    type === 'student' ? form.department  : undefined,
        level:         type === 'student' ? form.level       : undefined,
        // Landlord fields
        business_name: type === 'landlord' ? form.business_name : undefined,
      });
      navigate('/');
    } catch (err) {
      // Show the exact server error, not a generic one
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || err?.response?.data?.errors?.[0]?.msg
        || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const LEVELS = ['100L','200L','300L','400L','500L','600L','Postgrad'];

  return (
    <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        input::placeholder, select option:first-child { color: rgba(255,255,255,0.28); }
        select option { background: #111; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <motion.button
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          whileTap={{ scale: 0.92 }}
          style={{ width: 38, height: 38, borderRadius: '50%', background: GLASS, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: CREAM }}>
          <BackIcon />
        </motion.button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: BRAND, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoIcon />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: CREAM }}>Unilo</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: s === step ? 20 : 7, height: 7, borderRadius: 99, background: s === step ? BRAND : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 40px' }}>
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Choose type ──────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}>
              <div style={{ marginBottom: 28, marginTop: 8 }}>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 900, color: CREAM, margin: '0 0 6px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  Join Unilo
                </h1>
                <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>
                  Tell us who you are so we can personalise your experience.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {USER_TYPES.map(t => (
                  <TypeCard key={t.value} type={t} selected={type} onSelect={setType} />
                ))}
              </div>

              <motion.button
                onClick={() => {
                  if (type === 'guest') {
                    // Guest just needs to click through to the form
                    setStep(2);
                  } else {
                    setStep(2);
                  }
                }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', background: selected?.color || BRAND, color: selected?.value === 'guest' ? '#555' : '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}>
                Continue as {selected?.label}
                <ArrowRightIcon />
              </motion.button>

              <p style={{ textAlign: 'center', fontSize: 14, color: MUTED, marginTop: 20 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: Details form ─────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}>

              {/* Selected type pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${selected?.color}12`, border: `1px solid ${selected?.color}30`, borderRadius: 99, padding: '6px 12px 6px 8px', marginBottom: 22, marginTop: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${selected?.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected && <selected.IconComp size={14} color={selected.color} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: selected?.color }}>{selected?.label}</span>
              </div>

              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: CREAM, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Create your account
              </h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 24, lineHeight: 1.6 }}>
                {selected?.desc}
              </p>

              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="First Name" error={fieldErrors.first_name}>
                    <Input placeholder="John" value={form.first_name} onChange={setF('first_name')} error={fieldErrors.first_name} />
                  </Field>
                  <Field label="Last Name" error={fieldErrors.last_name}>
                    <Input placeholder="Doe" value={form.last_name} onChange={setF('last_name')} error={fieldErrors.last_name} />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email Address" error={fieldErrors.email}>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={setF('email')} error={fieldErrors.email} />
                </Field>

                {/* Phone — shown for landlord and renter */}
                {(type === 'landlord' || type === 'renter') && (
                  <Field label="Phone Number" optional={type === 'renter'}>
                    <Input type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={setF('phone')} />
                  </Field>
                )}

                {/* Student extras */}
                {type === 'student' && (
                  <>
                    <Field label="University" optional>
                      <Input placeholder="University of Lagos" value={form.university} onChange={setF('university')} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Department" optional>
                        <Input placeholder="Computer Science" value={form.department} onChange={setF('department')} />
                      </Field>
                      <Field label="Level" optional>
                        <SelectInput
                          value={form.level} onChange={setF('level')}
                          placeholder="Select level"
                          options={LEVELS.map(l => ({ value: l, label: l }))} />
                      </Field>
                    </div>
                  </>
                )}

                {/* Landlord business name */}
                {type === 'landlord' && (
                  <Field label="Business / Property Name" optional>
                    <Input placeholder="Paradise Properties" value={form.business_name} onChange={setF('business_name')} />
                  </Field>
                )}

                {/* Password */}
                <Field label="Password" error={fieldErrors.password}>
                  <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={setF('password')} error={fieldErrors.password} />
                </Field>

                {/* Confirm */}
                <Field label="Confirm Password" error={fieldErrors.confirm}>
                  <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={setF('confirm')} error={fieldErrors.confirm} />
                  {/* Real-time match indicator */}
                  {form.confirm && form.password && (
                    <motion.span
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: form.confirm === form.password ? GREEN : '#f87171' }}>
                      {form.confirm === form.password
                        ? <><CheckIcon /> Passwords match</>
                        : <><AlertIcon /> Passwords don't match</>}
                    </motion.span>
                  )}
                </Field>

                {/* Server error */}
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

                {/* Terms */}
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.6, margin: 0 }}>
                  By creating an account you agree to Unilo's{' '}
                  <span style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
                </p>

                {/* Submit */}
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }}
                  style={{
                    width: '100%',
                    background: loading ? `${selected?.color || BRAND}60` : selected?.color || BRAND,
                    color: '#fff', border: 'none', borderRadius: 14,
                    padding: '15px', fontSize: 15, fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.15s',
                  }}>
                  {loading ? (
                    <>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Creating account…
                    </>
                  ) : (
                    <>Create account <ArrowRightIcon /></>
                  )}
                </motion.button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 14, color: MUTED, marginTop: 22 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: BRAND, fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
