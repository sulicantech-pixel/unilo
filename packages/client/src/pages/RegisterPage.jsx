import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const UNIVERSITIES = [
  'University of Port Harcourt', 'Rivers State University', 'University of Lagos',
  'University of Ibadan', 'Obafemi Awolowo University', 'University of Benin',
  'Ahmadu Bello University', 'University of Nigeria Nsukka', 'Covenant University',
  'Babcock University', 'Pan-Atlantic University', 'Nnamdi Azikiwe University',
  'Federal University Oye-Ekiti', 'University of Calabar', 'Delta State University',
];

const STEPS = ['Account', 'About you', 'Done'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    university: '', role: 'student', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep0 = () => {
    if (!form.firstName || !form.lastName) return 'Enter your full name';
    if (!form.email) return 'Enter your email';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validateStep1 = () => {
    if (!form.university) return 'Select your university';
    return null;
  };

  const next = () => {
    setError('');
    if (step === 0) { const e = validateStep0(); if (e) { setError(e); return; } }
    if (step === 1) { const e = validateStep1(); if (e) { setError(e); return; } submit(); return; }
    setStep(s => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, password: form.password,
          university: form.university, role: form.role, phone: form.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      login(data.user, data.token);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <div className="w-20 h-20 rounded-full bg-[#ff6b00]/15 flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-white text-2xl font-bold font-[Fraunces] mb-2">You're in! 🎉</h1>
        <p className="text-[#666] text-sm mb-8">Welcome to Unilo, {form.firstName}. Where you feel at home.</p>
        <button onClick={() => navigate('/')} className="bg-[#ff6b00] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#e55f00] transition-colors">
          Find my room
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col">
      <div className="px-4 pt-14 pb-2">
        <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
          className="text-[#888] text-sm flex items-center gap-1 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col px-6 pt-6 max-w-sm mx-auto w-full"
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.slice(0, 2).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#ff6b00]' : 'bg-[#1a1a1a]'}`} />
          ))}
        </div>

        <div className="w-10 h-10 rounded-xl bg-[#ff6b00] flex items-center justify-center mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>

        {step === 0 && (
          <>
            <h1 className="text-white text-2xl font-bold font-[Fraunces] mb-1">Create your account</h1>
            <p className="text-[#666] text-sm mb-8">Free to join. Find rooms near your campus.</p>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5"><p className="text-red-400 text-sm">{error}</p></div>}

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <label className="text-[#888] text-xs mb-1.5 block">First name</label>
                <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                  placeholder="Emeka" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors" />
              </div>
              <div className="flex-1">
                <label className="text-[#888] text-xs mb-1.5 block">Last name</label>
                <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                  placeholder="Okafor" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[#888] text-xs mb-1.5 block">Email address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@email.com" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors" />
            </div>

            <div className="mb-4">
              <label className="text-[#888] text-xs mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  placeholder="Min. 6 characters" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors" />
                <button onClick={() => setShowPw(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {showPw ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
                  </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[#888] text-xs mb-1.5 block">Confirm password</label>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                placeholder="••••••••" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors"
                onKeyDown={e => e.key === 'Enter' && next()} />
            </div>

            {/* Role selector */}
            <div className="mb-6">
              <label className="text-[#888] text-xs mb-2 block">I am a</label>
              <div className="flex gap-2">
                {['student', 'landlord'].map(r => (
                  <button key={r} onClick={() => set('role', r)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${form.role === r ? 'border-[#ff6b00] bg-[#ff6b00]/10 text-[#ff6b00]' : 'border-white/10 text-[#666] hover:border-white/20'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-white text-2xl font-bold font-[Fraunces] mb-1">Your university</h1>
            <p className="text-[#666] text-sm mb-8">We'll show you rooms closest to your campus.</p>

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5"><p className="text-red-400 text-sm">{error}</p></div>}

            <div className="mb-4">
              <label className="text-[#888] text-xs mb-1.5 block">University</label>
              <select value={form.university} onChange={e => set('university', e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ff6b00]/50 transition-colors appearance-none">
                <option value="" className="bg-[#111]">Select your university</option>
                {UNIVERSITIES.map(u => <option key={u} value={u} className="bg-[#111]">{u}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-[#888] text-xs mb-1.5 block">Phone number (optional)</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="+234 800 000 0000" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors" />
            </div>
          </>
        )}

        <button onClick={next} disabled={loading}
          className="w-full bg-[#ff6b00] text-white font-semibold py-4 rounded-xl hover:bg-[#e55f00] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-auto mb-6">
          {loading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : step === 1 ? 'Create account' : 'Continue'
          }
        </button>

        {step === 0 && (
          <p className="text-[#555] text-sm text-center mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ff6b00] font-medium hover:underline">Log in</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
