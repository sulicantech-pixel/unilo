import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(form.email, form.password);
      // Redirect based on role
      if (user.role === 'head_admin' || user.role === 'user_admin') {
        window.location.href = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3001';
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="min-h-dvh flex flex-col justify-center px-5 py-10 page-enter"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <div className="max-w-sm mx-auto w-full">
        <h1 className="font-display font-bold text-3xl text-cream mb-1">Welcome back</h1>
        <p className="text-muted mb-8">Sign in to your Unilo account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand hover:underline">Register</Link>
        </p>
      </div>
    </motion.main>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer', business_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main
      className="min-h-dvh flex flex-col justify-center px-5 py-10 page-enter"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <div className="max-w-sm mx-auto w-full">
        <h1 className="font-display font-bold text-3xl text-cream mb-1">Create account</h1>
        <p className="text-muted mb-8">Join Unilo — it's free</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">I am a…</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'viewer', label: '🎓 Student' },
                { value: 'user_admin', label: '🏠 Landlord' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                  className={`card p-3 text-sm font-display font-medium transition-colors ${
                    form.role === opt.value ? 'border-brand text-brand' : 'text-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1.5">Full name</label>
            <input className="input" placeholder="Chukwuemeka Obi" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>

          {form.role === 'user_admin' && (
            <div>
              <label className="text-xs text-muted block mb-1.5">Business / Property name</label>
              <input className="input" placeholder="Obi Properties" value={form.business_name}
                onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} />
            </div>
          )}

          <div>
            <label className="text-xs text-muted block mb-1.5">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
          </div>

          <div>
            <label className="text-xs text-muted block mb-1.5">Password</label>
            <input className="input" type="password" placeholder="Min 8 characters" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline">Sign in</Link>
        </p>
      </div>
    </motion.main>
  );
}

// Default exports for lazy loading
export default LoginPage;
