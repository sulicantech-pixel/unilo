import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  return (
    <div className="min-h-dvh bg-[#0a0a0a] flex flex-col">
      {/* Back */}
      <div className="px-4 pt-14 pb-2">
        <button onClick={() => navigate(-1)} className="text-[#888] text-sm flex items-center gap-1 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex-1 flex flex-col px-6 pt-8 max-w-sm mx-auto w-full"
      >
        {/* Logo mark */}
        <div className="w-10 h-10 rounded-xl bg-[#ff6b00] flex items-center justify-center mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
        </div>

        <h1 className="text-white text-2xl font-bold font-[Fraunces] mb-1">Welcome back</h1>
        <p className="text-[#666] text-sm mb-8">Log in to continue finding your room.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="text-[#888] text-xs mb-1.5 block">Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@university.edu.ng"
            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-[#888] text-xs mb-1.5 block">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder-[#444] focus:outline-none focus:border-[#ff6b00]/50 transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={() => setShowPw(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          <div className="text-right mt-2">
            <button className="text-[#ff6b00] text-xs hover:underline">Forgot password?</button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#ff6b00] text-white font-semibold py-4 rounded-xl hover:bg-[#e55f00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Log in'}
        </button>

        <p className="text-[#555] text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#ff6b00] font-medium hover:underline">Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
}
