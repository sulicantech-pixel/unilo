import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const UNIVERSITIES = [
  'Nnamdi Azikiwe University (Unizik)',
  'University of Port Harcourt (UniPort)',
  'Rivers State University (RSU)',
  'Obafemi Awolowo University (OAU)',
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU)',
  'University of Benin (UNIBEN)',
  'Lagos State University (LASU)',
  'Covenant University',
  'Babcock University',
  'Federal University of Technology Akure (FUTA)',
  'University of Calabar (UNICAL)',
  'Delta State University (DELSU)',
  'Benson Idahosa University',
  'University of Ilorin (UNILORIN)',
  'Bayero University Kano (BUK)',
  'University of Maiduguri (UNIMAID)',
  'Redeemer\'s University',
];

const LEVELS = ['100L', '200L', '300L', '400L', '500L', '600L', 'Postgraduate'];

const DEPARTMENTS = [
  'Faculty of Engineering',
  'Faculty of Science',
  'Faculty of Arts',
  'Faculty of Social Sciences',
  'Faculty of Law',
  'Faculty of Medicine',
  'Faculty of Pharmacy',
  'Faculty of Education',
  'Faculty of Management Sciences',
  'Faculty of Agriculture',
  'Faculty of Environmental Sciences',
];

/* ─── Step definitions ──────────────────────────────────────────────────────── */
// Steps depend on what the user picks. We compute them dynamically.
// Base steps (everyone): 0=Account, 1=Who are you
// If student: +step for uni/course/level
// If host: +step for property details, +step for contact
// Final: success

/* ─── Icons ─────────────────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ─── Styled input component ────────────────────────────────────────────────── */
const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 7 }}>
      {label}{required && <span style={{ color: '#ff6b00', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 5 }}>{hint}</p>}
  </div>
);

const inputStyle = {
  width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '13px 16px', color: '#fff', fontSize: 14,
  fontFamily: "'Outfit', sans-serif", outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' };

const Input = ({ type = 'text', placeholder, value, onChange, onKeyDown, style = {} }) => (
  <input
    type={type} placeholder={placeholder} value={value}
    onChange={onChange} onKeyDown={onKeyDown}
    style={{ ...inputStyle, ...style }}
    onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
  />
);

const Select = ({ value, onChange, children }) => (
  <div style={{ position: 'relative' }}>
    <select value={value} onChange={onChange} style={selectStyle}
      onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    >
      {children}
    </select>
    <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }}
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </div>
);

/* ─── Type card component ────────────────────────────────────────────────────── */
const TypeCard = ({ selected, onClick, icon, title, desc }) => (
  <button
    onClick={onClick}
    style={{
      flex: 1, background: selected ? 'rgba(255,107,0,0.1)' : '#111',
      border: `1.5px solid ${selected ? '#ff6b00' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 16, padding: '18px 14px', cursor: 'pointer',
      textAlign: 'left', transition: 'all 0.18s',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}
  >
    <span style={{ fontSize: 24 }}>{icon}</span>
    <div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: selected ? '#ff6b00' : '#fff', marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4 }}>{desc}</div>
    </div>
    <div style={{
      width: 20, height: 20, borderRadius: '50%', marginLeft: 'auto',
      background: selected ? '#ff6b00' : 'transparent',
      border: `2px solid ${selected ? '#ff6b00' : 'rgba(255,255,255,0.2)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.18s',
    }}>
      {selected && <CheckIcon />}
    </div>
  </button>
);

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [done, setDone]       = useState(false);

  const [form, setForm] = useState({
    // Step 0 — Account
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    // Step 1 — Who are you
    userType: '',   // 'student' | 'non_student'
    isHost: false,  // can stack on top
    // Step 2 — Student details (if student)
    university: '', course: '', department: '', level: '',
    // Step 3 — Host property details (if host)
    propertyAddress: '', propertyLat: '', propertyLng: '',
    propertyPlaceId: '', roomCount: '', businessName: '',
    // Step 4 — Host contact (if host)
    phone: '', whatsapp: '', contactPreference: 'both', sameNumber: true,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  /* ── Dynamic step list ── */
  const steps = ['Account', 'Who are you'];
  if (form.userType === 'student') steps.push('Your uni');
  if (form.isHost) { steps.push('Your property'); steps.push('Contact'); }

  const totalSteps = steps.length;
  const progress = ((step) / totalSteps) * 100;

  /* ── Validation per step ── */
  const validate = () => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim()) return 'Enter your full name';
      if (!form.email.trim()) return 'Enter your email address';
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address';
      if (form.password.length < 6) return 'Password must be at least 6 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
    }
    if (step === 1) {
      if (!form.userType) return 'Please select who you are';
    }
    if (steps[step] === 'Your uni') {
      if (!form.university) return 'Select your university';
      if (!form.course.trim()) return 'Enter your course or programme';
      if (!form.level) return 'Select your level';
    }
    if (steps[step] === 'Your property') {
      if (!form.propertyAddress.trim()) return 'Enter your property address';
      if (!form.roomCount) return 'Enter the number of rooms';
    }
    if (steps[step] === 'Contact') {
      if (!form.phone.trim()) return 'Enter at least one phone number';
    }
    return null;
  };

  const next = async () => {
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      await submit();
    }
  };

  const back = () => {
    setError('');
    if (step === 0) navigate(-1);
    else setStep(s => s - 1);
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        user_type: form.userType,
        is_host: form.isHost,
        // Student
        university:  form.userType === 'student' ? form.university  : undefined,
        course:      form.userType === 'student' ? form.course      : undefined,
        department:  form.userType === 'student' ? form.department  : undefined,
        level:       form.userType === 'student' ? form.level       : undefined,
        // Host
        property_address:  form.isHost ? form.propertyAddress  : undefined,
        property_lat:      form.isHost ? form.propertyLat || null : undefined,
        property_lng:      form.isHost ? form.propertyLng || null : undefined,
        property_place_id: form.isHost ? form.propertyPlaceId || null : undefined,
        room_count:        form.isHost ? Number(form.roomCount) || null : undefined,
        business_name:     form.isHost ? form.businessName || null : undefined,
        // Contact
        phone:              form.phone || undefined,
        whatsapp:           form.sameNumber ? form.phone : (form.whatsapp || undefined),
        contact_preference: form.contactPreference,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      login(data.user, data.token);
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (done) return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', fontFamily: "'Outfit', sans-serif" }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,107,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 10 }}>You're in! 🎉</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>
          Welcome to Unilo, {form.firstName}.<br />Where you feel at home.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{ background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 14, padding: '16px 48px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
        >
          Find my room →
        </button>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap');
        select option { background: #111; color: #fff; }
      `}</style>

      {/* ── Top bar: back + step label ── */}
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={back} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
          <BackIcon /> Back
        </button>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
          Step {step + 1} of {totalSteps}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 10,
              background: i <= step ? '#ff6b00' : 'rgba(255,255,255,0.08)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 7, textAlign: 'right' }}>
          {steps[step]}
        </p>
      </div>

      {/* ── Page content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >

            {/* ────────── STEP 0: Account ────────── */}
            {step === 0 && (
              <>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ff6b00', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Create your account</h1>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, marginBottom: 28 }}>Free to join. Find rooms near your campus.</p>

                {error && <ErrorBox msg={error} />}

                <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
                  <Field label="First name" required>
                    <Input placeholder="Emeka" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                  </Field>
                  <Field label="Last name" required>
                    <Input placeholder="Okafor" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                  </Field>
                </div>

                <Field label="Email address" required hint="Any email works — gmail, yahoo, school email, etc.">
                  <Input type="email" placeholder="you@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </Field>

                <Field label="Password" required>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      style={{ paddingRight: 48 }}
                    />
                    <button onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                      <EyeIcon open={showPw} />
                    </button>
                  </div>
                </Field>

                <Field label="Confirm password" required>
                  <Input
                    type="password" placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && next()}
                  />
                </Field>
              </>
            )}

            {/* ────────── STEP 1: Who are you ────────── */}
            {step === 1 && (
              <>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Who are you?</h1>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, marginBottom: 24 }}>Choose one. You can also be a host.</p>

                {error && <ErrorBox msg={error} />}

                {/* Primary type */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  <TypeCard
                    selected={form.userType === 'student'}
                    onClick={() => set('userType', 'student')}
                    icon="🎓"
                    title="Student"
                    desc="I'm looking for rooms near my campus"
                  />
                  <TypeCard
                    selected={form.userType === 'non_student'}
                    onClick={() => set('userType', 'non_student')}
                    icon="🏙️"
                    title="Non-student"
                    desc="I'm looking for rooms in general"
                  />
                </div>

                {/* Host add-on */}
                <div style={{ marginTop: 4 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                    Also a host?
                  </p>
                  <button
                    onClick={() => set('isHost', !form.isHost)}
                    style={{
                      width: '100%', background: form.isHost ? 'rgba(255,107,0,0.1)' : '#111',
                      border: `1.5px solid ${form.isHost ? '#ff6b00' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                      transition: 'all 0.18s',
                    }}
                  >
                    <span style={{ fontSize: 26 }}>🏡</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: form.isHost ? '#ff6b00' : '#fff', marginBottom: 2 }}>I'm also a host / landlord</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>I have rooms to list for students</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: form.isHost ? '#ff6b00' : 'transparent',
                      border: `2px solid ${form.isHost ? '#ff6b00' : 'rgba(255,255,255,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s',
                    }}>
                      {form.isHost && <CheckIcon />}
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* ────────── STEP: Your uni (student only) ────────── */}
            {steps[step] === 'Your uni' && (
              <>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Your university</h1>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, marginBottom: 24 }}>We'll show you rooms near your campus first.</p>

                {error && <ErrorBox msg={error} />}

                <Field label="University" required>
                  <Select value={form.university} onChange={e => set('university', e.target.value)}>
                    <option value="">Select your university</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </Select>
                </Field>

                <Field label="Course / Programme" required hint="e.g. Computer Science, Medicine, Law">
                  <Input placeholder="e.g. Computer Science" value={form.course} onChange={e => set('course', e.target.value)} />
                </Field>

                <Field label="Department / Faculty">
                  <Select value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select your faculty (optional)</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </Field>

                <Field label="Level" required>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {LEVELS.map(l => (
                      <button
                        key={l}
                        onClick={() => set('level', l)}
                        style={{
                          padding: '8px 16px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                          border: `1.5px solid ${form.level === l ? '#ff6b00' : 'rgba(255,255,255,0.1)'}`,
                          background: form.level === l ? 'rgba(255,107,0,0.12)' : 'transparent',
                          color: form.level === l ? '#ff6b00' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer', transition: 'all 0.15s',
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Phone number" hint="So landlords can reach you">
                  <Input type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </Field>
              </>
            )}

            {/* ────────── STEP: Your property (host only) ────────── */}
            {steps[step] === 'Your property' && (
              <>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Your property</h1>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, marginBottom: 24 }}>Tell us exactly where your property is.</p>

                {error && <ErrorBox msg={error} />}

                <Field label="Business / Property name">
                  <Input placeholder="e.g. Emeka's Hostel" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
                </Field>

                <Field label="Exact property address" required hint="Include street, area, and nearest landmark">
                  <textarea
                    value={form.propertyAddress}
                    onChange={e => set('propertyAddress', e.target.value)}
                    placeholder="e.g. No. 12 University Road, by Shell Junction, Rumuola, Port Harcourt"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </Field>

                {/* Google Maps link for precision */}
                <div style={{ background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: '#ff6b00', marginTop: 2 }}><PinIcon /></span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Pin your location on Google Maps</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: 10 }}>
                        Open Google Maps, find your exact house, long-press to drop a pin, then tap "Share" and paste the link or coordinates below.
                      </p>
                      <Input
                        placeholder="Paste Google Maps link or coords (optional)"
                        value={form.propertyPlaceId}
                        onChange={e => set('propertyPlaceId', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Field label="Room number / Unit" hint="e.g. Room 4, Flat B">
                    <Input placeholder="e.g. Room 4" value={form.roomCount} onChange={e => set('roomCount', e.target.value)} />
                  </Field>
                </div>
              </>
            )}

            {/* ────────── STEP: Contact (host only) ────────── */}
            {steps[step] === 'Contact' && (
              <>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Contact info</h1>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, marginBottom: 24 }}>How should students reach you?</p>

                {error && <ErrorBox msg={error} />}

                <Field label="Phone number" required hint="Students will call this number">
                  <Input type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </Field>

                {/* Same number toggle */}
                <button
                  onClick={() => set('sameNumber', !form.sameNumber)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 0', marginBottom: 16,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: form.sameNumber ? '#ff6b00' : 'transparent',
                    border: `2px solid ${form.sameNumber ? '#ff6b00' : 'rgba(255,255,255,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {form.sameNumber && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit', sans-serif" }}>
                    My WhatsApp is the same number
                  </span>
                </button>

                {!form.sameNumber && (
                  <Field label="WhatsApp number" hint="Leave blank if same as above">
                    <Input type="tel" placeholder="+234 800 000 0000" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                  </Field>
                )}

                <Field label="How can students contact you?">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { value: 'phone', label: '📞 Call only' },
                      { value: 'whatsapp', label: '💬 WhatsApp only' },
                      { value: 'both', label: '✅ Both' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => set('contactPreference', opt.value)}
                        style={{
                          flex: 1, padding: '10px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                          border: `1.5px solid ${form.contactPreference === opt.value ? '#ff6b00' : 'rgba(255,255,255,0.1)'}`,
                          background: form.contactPreference === opt.value ? 'rgba(255,107,0,0.1)' : 'transparent',
                          color: form.contactPreference === opt.value ? '#ff6b00' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Fixed bottom CTA ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10,10,10,0.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        maxWidth: 480, margin: '0 auto',
      }}>
        {error && !['Account', 'Who are you'].includes(steps[step]) && <ErrorBox msg={error} style={{ marginBottom: 10 }} />}
        <button
          onClick={next}
          disabled={loading}
          style={{
            width: '100%', background: '#ff6b00', color: '#fff', border: 'none',
            borderRadius: 14, padding: '16px 0', fontSize: 15, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
        >
          {loading
            ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : step === totalSteps - 1 ? 'Create my account →' : 'Continue →'
          }
        </button>
        {step === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff6b00', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Error box ─────────────────────────────────────────────────────────────── */
function ErrorBox({ msg, style = {} }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: 12, padding: '12px 16px', marginBottom: 18, ...style,
    }}>
      <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{msg}</p>
    </div>
  );
}
