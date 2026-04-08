import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login    = useAdminAuth(s => s.login);

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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

  const inp = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '11px 14px',
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
    display: 'block',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0D1B2A; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        .admin-input:focus { border-color: rgba(0,194,168,0.6) !important; }
      `}</style>

      <div style={{ minHeight: '100dvh', background: '#0D1B2A', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>

        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, background: '#00C2A8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D1B2A" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.02em' }}>Unilo</span>
            </div>
            <p style={{ fontSize: 13, color: '#8A9BB0' }}>Admin Platform · Restricted Access</p>
          </div>

          {/* Card */}
          <div style={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#F5F0E8', marginBottom: 20 }}>Sign in</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BB0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Email</label>
                <input
                  className="admin-input"
                  type="email" required autoFocus
                  placeholder="admin@unilo.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,194,168,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BB0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>Password</label>
                <input
                  className="admin-input"
                  type="password" required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,194,168,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: loading ? 'rgba(0,194,168,0.5)' : '#00C2A8', color: '#0D1B2A', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s', marginTop: 4 }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(138,155,176,0.5)', marginTop: 24 }}>
            Only authorized Unilo team members can access this platform.
          </p>
        </div>
      </div>
    </>
  );
}
