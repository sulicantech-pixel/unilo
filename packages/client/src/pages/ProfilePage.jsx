import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../utils/designSystem';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <polyline points="2,4 12,13 22,4"/>
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L.057 23.5l5.797-1.522A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.019-1.376l-.36-.214-3.44.904.919-3.36-.234-.374A9.818 9.818 0 1112 21.818z"/>
  </svg>
);
const UniversityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

// ── Input style ──────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '11px 14px',
  color: '#f5f0e8',
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s',
};
const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.45)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
};

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 64 }) {
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  if (user?.avatar_url) {
    return (
      <img src={user.avatar_url} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${COLORS.brand}50` }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${COLORS.brand}30, ${COLORS.brand}10)`,
      border: `2px solid ${COLORS.brand}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 800, color: COLORS.brand,
      fontFamily: 'Syne, sans-serif',
    }}>
      {initials || '?'}
    </div>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, empty = '—' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: value ? COLORS.brand : 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: value ? COLORS.cream : 'rgba(255,255,255,0.25)', fontStyle: value ? 'normal' : 'italic' }}>
          {value || empty}
        </div>
      </div>
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '4px 16px 4px', marginBottom: 12 }}>
      {title && <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, padding: '12px 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</p>}
      {children}
    </div>
  );
}

// ── Password input with show/hide ────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 40 }}
        onFocus={e => e.target.style.borderColor = `${COLORS.brand}80`}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({});
  const [pwForm,    setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{ minHeight: '100dvh', background: COLORS.navy, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ width: 72, height: 72, background: `${COLORS.brand}15`, border: `1px solid ${COLORS.brand}30`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.brand} strokeWidth="1.5" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: COLORS.cream, margin: '0 0 10px' }}>Sign in to view your profile</h2>
        <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 28, maxWidth: 280, lineHeight: 1.6 }}>
          Access your saved rooms, listing history, and account settings.
        </p>
        <Link to="/login" style={{ background: COLORS.brand, color: '#fff', borderRadius: 14, padding: '13px 36px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
          Log in
        </Link>
        <Link to="/register" style={{ marginTop: 14, fontSize: 13, color: COLORS.muted, textDecoration: 'none' }}>
          Create a free account →
        </Link>
      </div>
    );
  }

  const isHost = user.is_host || user.role === 'user_admin' || user.role === 'head_admin';

  // Fresh user data
  const { data: freshUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data.user),
    initialData: user,
    staleTime: 60_000,
  });
  const me = freshUser || user;

  // Host listings
  const { data: myListings } = useQuery({
    queryKey: ['my-listings-profile'],
    queryFn: () => api.get('/listings/my/all').then(r => r.data),
    enabled: isHost,
  });

  const updateProfile = useMutation({
    mutationFn: data => api.patch('/auth/me', data),
    onSuccess: ({ data }) => {
      qc.invalidateQueries(['me']);
      useAuthStore.setState({ user: data.user });
      setEditing(false);
    },
  });

  const changePassword = useMutation({
    mutationFn: data => api.post('/auth/change-password', data),
    onSuccess: () => {
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 4000);
    },
    onError: err => setPwError(err.response?.data?.message || 'Failed to change password'),
  });

  const openEdit = () => {
    setForm({
      first_name: me.first_name, last_name: me.last_name,
      phone: me.phone || '', whatsapp: me.whatsapp || '',
      university: me.university || '', course: me.course || '',
      level: me.level || '', business_name: me.business_name || '',
    });
    setEditing(true);
  };

  const handlePasswordSubmit = e => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords don't match."); return; }
    if (pwForm.next.length < 6)         { setPwError("Password must be at least 6 characters."); return; }
    changePassword.mutate({ current_password: pwForm.current, new_password: pwForm.next });
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const approvedCount = (myListings || []).filter(l => l.status === 'approved').length;
  const totalViews    = (myListings || []).reduce((a, l) => a + (l.view_count || 0), 0);

  const TABS = [
    { id: 'profile',  label: 'Profile' },
    { id: 'security', label: 'Security' },
    ...(isHost ? [{ id: 'listings', label: 'My Listings' }] : []),
  ];

  const statusColors = {
    approved: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    pending:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    draft:    { bg: 'rgba(255,255,255,0.08)', color: COLORS.muted },
    rejected: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444' },
  };

  return (
    <div style={{ minHeight: '100dvh', background: COLORS.navy, fontFamily: 'DM Sans, sans-serif', paddingBottom: 100 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px 16px' }}>
          <Avatar user={me} size={68} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: COLORS.cream, margin: '0 0 3px', lineHeight: 1.2 }}>
              {me.first_name} {me.last_name}
            </h1>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {me.email}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: `${COLORS.brand}18`, color: COLORS.brand, border: `1px solid ${COLORS.brand}28` }}>
                {me.user_type === 'student' ? '🎓 Student' : '🏢 Non-student'}
              </span>
              {isHost && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  🏠 Landlord
                </span>
              )}
            </div>
          </div>
          <button onClick={openEdit}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px', color: COLORS.cream, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
            <EditIcon /> Edit
          </button>
        </div>

        {/* Stats for hosts */}
        {isHost && myListings && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '0 16px 16px' }}>
            {[
              { label: 'Live rooms',   value: approvedCount,              color: '#10b981' },
              { label: 'Total views',  value: totalViews.toLocaleString(), color: COLORS.brand },
              { label: 'All listings', value: myListings.length,          color: COLORS.cream },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingLeft: 8 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? COLORS.brand : COLORS.muted,
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                borderBottom: `2px solid ${activeTab === tab.id ? COLORS.brand : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Section title="Contact">
              <InfoRow icon={<EmailIcon />}    label="Email"    value={me.email} />
              <InfoRow icon={<PhoneIcon />}    label="Phone"    value={me.phone} />
              <InfoRow icon={<WhatsAppIcon />} label="WhatsApp" value={me.whatsapp} />
            </Section>

            {me.user_type === 'student' && (
              <Section title="Student Info">
                <InfoRow icon={<UniversityIcon />} label="University" value={me.university} />
                <InfoRow icon={<BookIcon />}        label="Course"     value={me.course} />
                <InfoRow icon={<BookIcon />}        label="Level"      value={me.level} />
              </Section>
            )}

            {isHost && me.business_name && (
              <Section title="Landlord Info">
                <InfoRow icon={<HomeIcon />} label="Business / Property Name" value={me.business_name} />
              </Section>
            )}

            {/* Sign out */}
            <button onClick={handleLogout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: '#ef4444', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 8 }}>
              <SignOutIcon /> Sign out
            </button>
          </motion.div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Section title="Change Password">
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
                <div style={{ paddingTop: 12 }}>
                  <label style={labelStyle}>Current password</label>
                  <PasswordInput value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="Your current password" />
                </div>
                <div>
                  <label style={labelStyle}>New password</label>
                  <PasswordInput value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} placeholder="Min 6 characters" />
                </div>
                <div>
                  <label style={labelStyle}>Confirm new password</label>
                  <PasswordInput value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" />
                  {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                    <p style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>Passwords don't match</p>
                  )}
                </div>
                {pwError   && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{pwError}</p>}
                {pwSuccess && <p style={{ fontSize: 13, color: '#10b981', margin: 0 }}>✓ Password changed successfully</p>}
                <button type="submit" disabled={changePassword.isPending}
                  style={{ background: changePassword.isPending ? 'rgba(255,107,0,0.5)' : COLORS.brand, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: changePassword.isPending ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <LockIcon /> {changePassword.isPending ? 'Changing…' : 'Change password'}
                </button>
              </form>
            </Section>
          </motion.div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === 'listings' && isHost && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 14, color: COLORS.muted, margin: 0 }}>{(myListings || []).length} listings total</p>
              <a href="https://unilo-admin.vercel.app" target="_blank" rel="noreferrer"
                style={{ fontSize: 13, fontWeight: 600, color: COLORS.brand, textDecoration: 'none', background: `${COLORS.brand}12`, padding: '7px 14px', borderRadius: 10, border: `1px solid ${COLORS.brand}25`, display: 'flex', alignItems: 'center', gap: 6 }}>
                Manage in Admin <ChevronRightIcon />
              </a>
            </div>

            {(myListings || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <HomeIcon />
                <p style={{ color: COLORS.cream, fontWeight: 600, marginTop: 12 }}>No listings yet</p>
                <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>Go to the admin panel to create your first listing.</p>
              </div>
            ) : (
              (myListings || []).map(listing => {
                const sc = statusColors[listing.status] || statusColors.draft;
                return (
                  <div key={listing.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 12, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {listing.photos?.[0]?.url
                        ? <img src={listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <HomeIcon />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{listing.city} · ₦{Number(listing.price).toLocaleString()}/yr</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: sc.bg, color: sc.color, flexShrink: 0, textTransform: 'capitalize' }}>
                      {listing.status}
                    </span>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      {/* ── Floating + FAB (list a space) ──────────────────────────────────── */}
      <motion.button
        onClick={() => window.dispatchEvent(new CustomEvent('openQuickList'))}
        style={{
          position: 'fixed', bottom: 88, right: 20, zIndex: 40,
          width: 52, height: 52, borderRadius: '50%',
          background: COLORS.brand,
          border: '2px solid rgba(255,255,255,0.15)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255,107,0,0.45)',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        title="List a space"
      >
        <PlusIcon />
      </motion.button>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.76)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            onClick={() => setEditing(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* Modal header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.cream, fontFamily: 'Syne, sans-serif' }}>Edit Profile</span>
                <button onClick={() => setEditing(false)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: COLORS.muted, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              {/* Modal body */}
              <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input style={inputStyle} value={form.first_name || ''} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input style={inputStyle} value={form.last_name || ''} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} type="tel" placeholder="+234 800 000 0000" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp</label>
                  <input style={inputStyle} type="tel" placeholder="+234 800 000 0000" value={form.whatsapp || ''} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>
                {me.user_type === 'student' && (
                  <>
                    <div>
                      <label style={labelStyle}>University</label>
                      <input style={inputStyle} placeholder="University of Lagos" value={form.university || ''} onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Course</label>
                      <input style={inputStyle} placeholder="Computer Science" value={form.course || ''} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Level</label>
                      <input style={inputStyle} placeholder="300L" value={form.level || ''} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                    </div>
                  </>
                )}
                {isHost && (
                  <div>
                    <label style={labelStyle}>Business / Property Name</label>
                    <input style={inputStyle} placeholder="Paradise Properties" value={form.business_name || ''} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                      onFocus={e => e.target.style.borderColor = `${COLORS.brand}70`} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                )}
                {updateProfile.isError && (
                  <p style={{ fontSize: 13, color: '#f87171' }}>{updateProfile.error?.response?.data?.message || 'Update failed'}</p>
                )}
              </div>

              {/* Modal footer */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, flexShrink: 0 }}>
                <button onClick={() => updateProfile.mutate(form)} disabled={updateProfile.isPending}
                  style={{ flex: 1, background: updateProfile.isPending ? 'rgba(255,107,0,0.5)' : COLORS.brand, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  {updateProfile.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button onClick={() => setEditing(false)}
                  style={{ background: 'rgba(255,255,255,0.06)', color: COLORS.cream, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '13px 18px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
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
