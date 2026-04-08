import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

// Backend expects:
//   first_name, last_name (NOT name)
//   user_type: 'student' | 'non_student' (NOT role)
//   is_host: true | false (for landlords)
//   password (min 6 chars)
//   email

const ROLES = [
  { value: 'student',  label: 'Student',  icon: '🎓', desc: 'Find verified rooms near your campus' },
  { value: 'landlord', label: 'Landlord', icon: '🏠', desc: 'List your property and reach students' },
];

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '12px 14px',
  color: '#fff',
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export default function RegisterPage() {
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const register     = useAuthStore(s => s.register);

  const [role, setRole]       = useState(params.get('role') === 'landlord' ? 'landlord' : 'student');
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Step 2 fields — split name correctly
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.');
      return;
    }

    setLoading(true);
    try {
      // Send exactly what the backend expects
      await register({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        email:      email.trim(),
        password,
        phone:      phone.trim() || undefined,
        user_type:  role === 'landlord' ? 'non_student' : 'student',
        is_host:    role === 'landlord',
      });
      navigate('/');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.28); }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

        {/* Back button */}
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          style={{ position: 'absolute', top: 'max(20px, env(safe-area-inset-top))', left: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        {/* Progress indicator */}
        <div style={{ position: 'absolute', top: 'max(28px, env(safe-area-inset-top))', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: s === step ? 20 : 7, height: 7, borderRadius: 99, background: s === step ? '#ff6b00' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: '#ff6b00', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
              🏠
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
              {step === 1 ? 'Join Unilo' : 'Create your account'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              {step === 1 ? 'Who are you joining as?' : `Signing up as a ${role}`}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Role selection ── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ROLES.map(r => (
                    <button key={r.value} onClick={() => setRole(r.value)} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: role === r.value ? 'rgba(255,107,0,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${role === r.value ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 14, padding: '16px 18px',
                      cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
                    }}>
                      <span style={{ fontSize: 28 }}>{r.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{r.label}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>{r.desc}</p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${role === r.value ? '#ff6b00' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {role === r.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff6b00' }} />}
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => setStep(2)} style={{ width: '100%', background: '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 20 }}>
                  Continue as {ROLES.find(r => r.value === role)?.label} →
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: Details form ── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {/* First + Last name in a row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>First Name</label>
                      <input
                        type="text" required
                        value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="John"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Last Name</label>
                      <input
                        type="text" required
                        value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Doe"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
                    <input
                      type="email" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Phone Number <span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="tel"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
                    <input
                      type="password" required
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(255,107,0,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                    <input
                      type="password" required
                      value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        ...inputStyle,
                        borderColor: confirmPass && confirmPass !== password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
                      }}
                      onFocus={e => e.target.style.borderColor = confirmPass !== password ? 'rgba(239,68,68,0.5)' : 'rgba(255,107,0,0.5)'}
                      onBlur={e => e.target.style.borderColor = confirmPass && confirmPass !== password ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                    />
                    {confirmPass && confirmPass !== password && (
                      <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>Passwords don't match</p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                      {error}
                    </motion.div>
                  )}

                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.5, margin: 0 }}>
                    By signing up you agree to Unilo's Terms of Service and Privacy Policy.
                  </p>

                  <button type="submit" disabled={loading} style={{ background: loading ? 'rgba(255,107,0,0.6)' : '#ff6b00', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 2, transition: 'background 0.15s' }}>
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ff6b00', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
