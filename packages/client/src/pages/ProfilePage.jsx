import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../utils/designSystem';

const S = {
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '11px 14px',
    color: '#f5f0e8',
    fontSize: 14,
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  },
};

function Avatar({ user, size = 72 }) {
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  return user?.avatar_url ? (
    <img src={user.avatar_url} alt="avatar"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${COLORS.brand}40` }} />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${COLORS.brand}20`, border: `2px solid ${COLORS.brand}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: COLORS.brand,
      fontFamily: 'Syne, sans-serif',
    }}>
      {initials || '?'}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '16px 12px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.cream, fontFamily: 'Syne, sans-serif' }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, logout, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Redirect if not logged in
  if (!user) {
    return (
      <div style={{ minHeight: '100dvh', background: COLORS.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>👤</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: COLORS.cream, marginBottom: 8 }}>
          Sign in to view your profile
        </h2>
        <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 28, maxWidth: 280 }}>
          Access your saved rooms, listings, and account settings.
        </p>
        <Link to="/login" style={{ background: COLORS.brand, color: '#fff', borderRadius: 12, padding: '13px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Log in
        </Link>
        <Link to="/register" style={{ marginTop: 14, fontSize: 13, color: COLORS.muted, textDecoration: 'none' }}>
          Create a free account →
        </Link>
      </div>
    );
  }

  const isHost = user.is_host || user.role === 'user_admin' || user.role === 'head_admin';

  // Fetch fresh user data
  const { data: freshUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data.user),
    initialData: user,
    staleTime: 60_000,
  });

  const currentUser = freshUser || user;

  // Fetch host listings if landlord
  const { data: myListings } = useQuery({
    queryKey: ['my-listings-profile'],
    queryFn: () => api.get('/listings/my/all').then(r => r.data),
    enabled: isHost,
  });

  const updateProfile = useMutation({
    mutationFn: (data) => api.patch('/auth/me', data),
    onSuccess: ({ data }) => {
      qc.invalidateQueries(['me']);
      useAuthStore.setState({ user: data.user });
      setEditing(false);
    },
  });

  const changePassword = useMutation({
    mutationFn: (data) => api.post('/auth/change-password', data),
    onSuccess: () => { setPwSuccess(true); setPwForm({ current: '', next: '', confirm: '' }); },
    onError: (err) => setPwError(err.response?.data?.message || 'Failed to change password'),
  });

  const handleEditOpen = () => {
    setForm({
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      phone: currentUser.phone || '',
      whatsapp: currentUser.whatsapp || '',
      university: currentUser.university || '',
      course: currentUser.course || '',
      level: currentUser.level || '',
      business_name: currentUser.business_name || '',
    });
    setEditing(true);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords don't match."); return; }
    if (pwForm.next.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    changePassword.mutate({ current_password: pwForm.current, new_password: pwForm.next });
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const approvedListings = (myListings || []).filter(l => l.status === 'approved');
  const totalViews = (myListings || []).reduce((a, l) => a + (l.view_count || 0), 0);

  const TABS = [
    { id: 'profile',   label: 'Profile' },
    { id: 'security',  label: 'Security' },
    ...(isHost ? [{ id: 'listings', label: 'My Listings' }] : []),
  ];

  return (
    <div style={{ minHeight: '100dvh', background: COLORS.navy, fontFamily: 'DM Sans, sans-serif', paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '20px 16px 0', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 20 }}>
          <Avatar user={currentUser} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: COLORS.cream, margin: 0, lineHeight: 1.2 }}>
              {currentUser.first_name} {currentUser.last_name}
            </h1>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.email}
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: `${COLORS.brand}20`, color: COLORS.brand, border: `1px solid ${COLORS.brand}30` }}>
                {currentUser.user_type === 'student' ? '🎓 Student' : '🏢 Non-student'}
              </span>
              {isHost && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                  🏠 Landlord
                </span>
              )}
            </div>
          </div>
          <button onClick={handleEditOpen} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: COLORS.cream, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
            Edit
          </button>
        </div>

        {/* Stats (only for hosts) */}
        {isHost && myListings && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            <StatCard icon="🏠" label="Live listings" value={approvedListings.length} />
            <StatCard icon="👁" label="Total views" value={totalViews.toLocaleString()} />
            <StatCard icon="📋" label="All listings" value={myListings.length} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: -1 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px', fontSize: 13, fontWeight: 500,
                color: activeTab === tab.id ? COLORS.brand : COLORS.muted,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                borderBottom: activeTab === tab.id ? `2px solid ${COLORS.brand}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* ── PROFILE TAB ──────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.cream, margin: '0 0 12px' }}>Contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Email', value: currentUser.email, icon: '✉️' },
                  { label: 'Phone', value: currentUser.phone || '—', icon: '📞' },
                  { label: 'WhatsApp', value: currentUser.whatsapp || '—', icon: '💬' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{row.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: currentUser.phone === row.value || row.value !== '—' ? COLORS.cream : COLORS.muted }}>{row.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentUser.user_type === 'student' && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.cream, margin: '0 0 12px' }}>Student Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'University', value: currentUser.university },
                    { label: 'Course', value: currentUser.course },
                    { label: 'Department', value: currentUser.department },
                    { label: 'Level', value: currentUser.level },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label}>
                      <div style={{ fontSize: 11, color: COLORS.muted }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: COLORS.cream }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isHost && currentUser.business_name && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: COLORS.cream, margin: '0 0 12px' }}>Landlord Info</h3>
                <div style={{ fontSize: 14, color: COLORS.cream }}>{currentUser.business_name}</div>
              </div>
            )}

            <button onClick={handleLogout}
              style={{ width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 600, color: '#ef4444', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 8 }}>
              Sign out
            </button>
          </motion.div>
        )}

        {/* ── SECURITY TAB ─────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: COLORS.cream, margin: '0 0 16px' }}>Change Password</h3>
              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={S.label}>Current password</label>
                  <input type="password" required style={S.input} placeholder="••••••••"
                    value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>New password</label>
                  <input type="password" required style={S.input} placeholder="Min 6 characters"
                    value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>Confirm new password</label>
                  <input type="password" required style={{ ...S.input, borderColor: pwForm.confirm && pwForm.confirm !== pwForm.next ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                    placeholder="••••••••" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                </div>
                {pwError && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{pwError}</p>}
                {pwSuccess && <p style={{ fontSize: 13, color: '#10b981', margin: 0 }}>✓ Password changed successfully</p>}
                <button type="submit" disabled={changePassword.isPending}
                  style={{ background: COLORS.brand, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: changePassword.isPending ? 0.6 : 1 }}>
                  {changePassword.isPending ? 'Changing…' : 'Change password'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── LISTINGS TAB (hosts only) ────────────────────────────── */}
        {activeTab === 'listings' && isHost && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>{(myListings || []).length} total listings</p>
              <a href="https://unilo-admin.vercel.app" target="_blank" rel="noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: COLORS.brand, textDecoration: 'none', background: `${COLORS.brand}15`, padding: '7px 14px', borderRadius: 10, border: `1px solid ${COLORS.brand}30` }}>
                Manage in Admin →
              </a>
            </div>
            {(myListings || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <p style={{ color: COLORS.cream, fontWeight: 600 }}>No listings yet</p>
                <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Go to the admin panel to create your first listing.</p>
              </div>
            ) : (myListings || []).map(listing => {
              const statusColors = {
                approved: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
                pending:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
                draft:    { bg: 'rgba(255,255,255,0.08)', color: COLORS.muted },
                rejected: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
              };
              const sc = statusColors[listing.status] || statusColors.draft;
              return (
                <div key={listing.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                    {listing.photos?.[0]?.url
                      ? <img src={listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{listing.city} · ₦{Number(listing.price).toLocaleString()}/yr</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: sc.bg, color: sc.color, flexShrink: 0 }}>
                    {listing.status}
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── EDIT MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setEditing(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.cream, fontFamily: 'Syne, sans-serif' }}>Edit Profile</span>
                <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: COLORS.muted, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={S.label}>First Name</label>
                    <input style={S.input} value={form.first_name || ''} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Last Name</label>
                    <input style={S.input} value={form.last_name || ''} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={S.label}>Phone</label>
                  <input style={S.input} type="tel" placeholder="+234 800 000 0000" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>WhatsApp</label>
                  <input style={S.input} type="tel" placeholder="+234 800 000 0000" value={form.whatsapp || ''} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
                </div>
                {currentUser.user_type === 'student' && <>
                  <div>
                    <label style={S.label}>University</label>
                    <input style={S.input} placeholder="University of Lagos" value={form.university || ''} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Course</label>
                    <input style={S.input} placeholder="Computer Science" value={form.course || ''} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
                  </div>
                  <div>
                    <label style={S.label}>Level</label>
                    <input style={S.input} placeholder="300L" value={form.level || ''} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} />
                  </div>
                </>}
                {isHost && (
                  <div>
                    <label style={S.label}>Business / Property Name</label>
                    <input style={S.input} placeholder="Paradise Properties" value={form.business_name || ''} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
                  </div>
                )}
                {updateProfile.isError && (
                  <p style={{ fontSize: 13, color: '#f87171' }}>{updateProfile.error?.response?.data?.message || 'Update failed'}</p>
                )}
              </div>
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, flexShrink: 0 }}>
                <button onClick={() => updateProfile.mutate(form)} disabled={updateProfile.isPending}
                  style={{ flex: 1, background: COLORS.brand, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: updateProfile.isPending ? 0.6 : 1 }}>
                  {updateProfile.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: COLORS.cream, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '13px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
