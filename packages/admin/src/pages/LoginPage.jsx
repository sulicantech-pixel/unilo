import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAdminAuth((s) => s.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await login(form.email, form.password);
      navigate(user.role === 'head_admin' ? '/dashboard' : '/my-listings');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-5 bg-navy">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display font-bold text-3xl text-brand">Unilo</span>
          <p className="text-muted text-sm mt-1">Admin Platform</p>
        </div>

        <div className="card p-6">
          <h1 className="font-display font-semibold text-xl text-cream mb-5">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">Email</label>
              <input
                className="input"
                type="email"
                placeholder="admin@unilo.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoFocus
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

            {error && (
              <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-6">
          Unilo Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}
