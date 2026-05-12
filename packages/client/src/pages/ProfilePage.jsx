/**
 * ProfilePage — Airbnb-style dual-mode profile
 *
 * Sections:
 *  - Avatar with Cloudinary upload
 *  - Switch to Hosting / Switch to Finding (with admin approval flow)
 *  - Tabs: Profile | Student Info | My Listings (hosts) | Settings
 *  - Settings: Refer & Earn, Deals for you, Account, Support, Legal
 */
import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../utils/designSystem';

const BRAND  = COLORS.brand || '#ff6b00';
const NAVY   = '#0a0a0a';
const CREAM  = '#f5f0e8';
const MUTED  = 'rgba(255,255,255,0.42)';
const GLASS  = 'rgba(255,255,255,0.04)';
const BORDER = 'rgba(255,255,255,0.08)';
const GREEN  = '#10b981';
const PURPLE = '#8b5cf6';

// ── SVG icons ─────────────────────────────────────────────────────────────────
const I = {
  Camera:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Edit:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Email:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>,
  Phone:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  WhatsApp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L.057 23.5l5.797-1.522A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.019-1.376l-.36-.214-3.44.904.919-3.36-.234-.374A9.818 9.818 0 1112 21.818z"/></svg>,
  Uni:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Book:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  Home:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Gift:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
  Star:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Shield:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Help:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  FileText: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  LogOut:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Copy:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  ChevR:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Lock:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Eye:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

// ── Sub-components ────────────────────────────────────────────────────────────
function SettingsRow({ icon: Icon, label, sublabel, onClick, value, danger, rightEl, disabled }) {
  return (
    <motion.button onClick={disabled ? undefined : onClick} whileTap={disabled ? {} : { scale: 0.98 }}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ color: danger ? '#ef4444' : BRAND, flexShrink: 0 }}><Icon /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: danger ? '#ef4444' : CREAM, margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0', lineHeight: 1.4 }}>{sublabel}</p>}
      </div>
      {rightEl || (value
        ? <span style={{ fontSize: 13, color: MUTED, flexShrink: 0 }}>{value}</span>
        : !disabled && <span style={{ color: MUTED }}><I.ChevR /></span>
      )}
    </motion.button>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '4px 16px', marginBottom: 12 }}>
      {title && <p style={{ fontSize: 11, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 0 4px', margin: 0 }}>{title}</p>}
      {children}
    </div>
  );
}

function Avatar({ user, size = 68, onUpload }) {
  const ref = useRef();
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {user?.avatar_url
        ? <img src={user.avatar_url} alt="avatar" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2.5px solid ${BRAND}50` }} />
        : <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${BRAND}30, ${BRAND}10)`, border: `2.5px solid ${BRAND}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: BRAND, fontFamily: 'Syne, sans-serif' }}>
            {initials || '?'}
          </div>
      }
      {onUpload && (
        <>
          <motion.button onClick={() => ref.current?.click()} whileTap={{ scale: 0.9 }}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: BRAND, border: `2px solid ${NAVY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <I.Camera />
          </motion.button>
          <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
        </>
      )}
    </div>
  );
}

// ── Switch to Hosting flow ────────────────────────────────────────────────────
function SwitchHostingModal({ user, onClose }) {
  const qc = useQueryClient();
  const [step, setStep]       = useState(1); // 1=intro, 2=form, 3=pending
  const [form, setForm]       = useState({ business_name: '', phone: user?.phone || '', address: '', state: '', id_type: 'nin', id_number: '', note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.phone) { setError('Phone number is required'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/request-hosting', form);
      useAuthStore.setState(s => ({ user: { ...s.user, hosting_request: 'pending' } }));
      qc.invalidateQueries(['me']);
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed. Try again.');
    } finally { setLoading(false); }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px', color: CREAM, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' };
  const lbl = { fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: '#111', border: `1px solid ${BORDER}`, borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: CREAM }}>
            {step === 3 ? '✅ Request sent!' : 'Switch to Hosting'}
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: MUTED, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
                  Become a Unilo landlord and reach thousands of students looking for rooms near your property. Your request goes to the Unilo team for a quick 24-hour review.
                </p>
              </div>
              {[
                ['Submit your details', 'Takes 2 minutes — property address, contact, ID number.'],
                ['Unilo reviews within 24h', 'We verify your information before activating hosting.'],
                ['Start listing rooms', 'Create your first listing and go live immediately.'],
              ].map(([title, desc], i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${BRAND}20`, border: `1px solid ${BRAND}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: BRAND, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: '0 0 3px' }}>{title}</p>
                    <p style={{ fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={lbl}>Business / Property Name <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
                <input style={inp} placeholder="Paradise Properties" value={form.business_name} onChange={set('business_name')} />
              </div>
              <div>
                <label style={lbl}>Phone number *</label>
                <input style={inp} type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label style={lbl}>Property address *</label>
                <input style={inp} placeholder="12 University Road, Akoka" value={form.address} onChange={set('address')} />
              </div>
              <div>
                <label style={lbl}>State *</label>
                <input style={inp} placeholder="Lagos" value={form.state} onChange={set('state')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>ID Type</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.id_type} onChange={set('id_type')}>
                    {[['nin','NIN'],['bvn','BVN'],['voters','Voter\'s Card'],['intl_passport','Int\'l Passport'],['drivers','Driver\'s Licence']].map(([v,l]) => (
                      <option key={v} value={v} style={{ background: '#111' }}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>ID Number</label>
                  <input style={inp} placeholder="12345678901" value={form.id_number} onChange={set('id_number')} />
                </div>
              </div>
              <div>
                <label style={lbl}>Anything to tell us? <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
                <textarea style={{ ...inp, minHeight: 72, resize: 'none' }} placeholder="e.g. I manage 3 properties near UNILAG…" value={form.note} onChange={set('note')} />
              </div>
              {error && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>}
            </div>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>⏳</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: CREAM, margin: '0 0 10px' }}>Under review</p>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, maxWidth: 270, margin: '0 auto 20px' }}>
                The Unilo team will review your hosting request within <strong style={{ color: CREAM }}>24 hours</strong>. You'll get a notification once you're approved.
              </p>
              <button onClick={onClose} style={{ background: BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Done
              </button>
            </div>
          )}
        </div>

        {step < 3 && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 12, flexShrink: 0 }}>
            {step === 2 && (
              <button onClick={() => setStep(1)} style={{ background: GLASS, border: `1px solid ${BORDER}`, color: CREAM, borderRadius: 12, padding: '13px 18px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>← Back</button>
            )}
            <button onClick={step === 1 ? () => setStep(2) : submit} disabled={loading}
              style={{ flex: 1, background: loading ? `${BRAND}60` : BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              {loading ? 'Submitting…' : step === 1 ? 'Get started →' : 'Submit request'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Password change ───────────────────────────────────────────────────────────
function PasswordModal({ onClose }) {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault(); setError('');
    if (form.next !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.next.length < 6) { setError('Min 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/change-password', { current_password: form.current, new_password: form.next });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err) { setError(err?.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '12px 14px', color: CREAM, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#111', border: `1px solid ${BORDER}`, borderRadius: '24px 24px 0 0', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: CREAM }}>Change Password</span>
          <button onClick={onClose} style={{ background: GLASS, border: 'none', borderRadius: '50%', width: 30, height: 30, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['current','Current password'],['next','New password'],['confirm','Confirm new password']].map(([k,ph]) => (
            <div key={k} style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} required placeholder={ph}
                value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                style={{ ...inp, paddingRight: 42 }} />
              {k === 'next' && (
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <I.EyeOff /> : <I.Eye />}
                </button>
              )}
            </div>
          ))}
          {error && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: GREEN, margin: 0 }}>✓ Password changed!</p>}
          <button type="submit" disabled={loading}
            style={{ background: loading ? `${BRAND}60` : BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
            {loading ? 'Changing…' : 'Change password'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Edit profile modal ────────────────────────────────────────────────────────
function EditModal({ user, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '',
    phone: user?.phone || '', whatsapp: user?.whatsapp || '',
    university: user?.university || '', department: user?.department || '',
    level: user?.level || '', business_name: user?.business_name || '',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.patch('/auth/me', form);
      useAuthStore.setState(s => ({ user: { ...s.user, ...data.user } }));
      qc.invalidateQueries(['me']);
      onClose();
    } catch (err) { setError(err?.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '11px 14px', color: CREAM, fontSize: 14, fontFamily: 'DM Sans, sans-serif', outline: 'none' };
  const lbl = { fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const isStudent = user?.user_type === 'student';
  const isHost    = user?.is_host;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: '#111', border: `1px solid ${BORDER}`, borderRadius: '24px 24px 0 0', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: CREAM }}>Edit Profile</span>
          <button onClick={onClose} style={{ background: GLASS, border: 'none', borderRadius: '50%', width: 30, height: 30, color: MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>First Name</label><input style={inp} value={form.first_name} onChange={set('first_name')} /></div>
            <div><label style={lbl}>Last Name</label><input style={inp} value={form.last_name} onChange={set('last_name')} /></div>
          </div>
          <div><label style={lbl}>Phone</label><input style={inp} type="tel" placeholder="+234…" value={form.phone} onChange={set('phone')} /></div>
          <div><label style={lbl}>WhatsApp</label><input style={inp} type="tel" placeholder="+234…" value={form.whatsapp} onChange={set('whatsapp')} /></div>
          {isStudent && <>
            <div><label style={lbl}>University</label><input style={inp} placeholder="University of Lagos" value={form.university} onChange={set('university')} /></div>
            <div><label style={lbl}>Department</label><input style={inp} placeholder="Computer Science" value={form.department} onChange={set('department')} /></div>
            <div><label style={lbl}>Level</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.level} onChange={set('level')}>
                <option value="">Select</option>
                {['100L','200L','300L','400L','500L','Postgrad'].map(l => <option key={l} value={l} style={{ background: '#111' }}>{l}</option>)}
              </select>
            </div>
          </>}
          {isHost && <div><label style={lbl}>Business / Property Name</label><input style={inp} value={form.business_name} onChange={set('business_name')} /></div>}
          {error && <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{error}</p>}
        </div>
        <div style={{ padding: '14px 20px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 12, flexShrink: 0 }}>
          <button onClick={save} disabled={loading}
            style={{ flex: 1, background: loading ? `${BRAND}60` : BRAND, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={onClose} style={{ background: GLASS, border: `1px solid ${BORDER}`, color: CREAM, borderRadius: 12, padding: '13px 18px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const { user, logout } = useAuthStore();

  const [activeTab,    setActiveTab]    = useState('profile');
  const [showEdit,     setShowEdit]     = useState(false);
  const [showHosting,  setShowHosting]  = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [uploading,    setUploading]    = useState(false);

  if (!user) {
    return (
      <div style={{ minHeight: '100dvh', background: NAVY, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ width: 72, height: 72, background: `${BRAND}15`, border: `1px solid ${BRAND}30`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 30 }}>👤</div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: CREAM, margin: '0 0 10px' }}>Sign in to view your profile</h2>
        <p style={{ fontSize: 14, color: MUTED, marginBottom: 28, maxWidth: 260, lineHeight: 1.6 }}>Save rooms, track bookings, and manage your account.</p>
        <Link to="/login" style={{ background: BRAND, color: '#fff', borderRadius: 14, padding: '13px 36px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Log in</Link>
        <Link to="/register" style={{ marginTop: 14, fontSize: 13, color: MUTED, textDecoration: 'none' }}>Create a free account →</Link>
      </div>
    );
  }

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data.user),
    initialData: user, staleTime: 60_000,
  });

  const { data: myListings } = useQuery({
    queryKey: ['my-listings-profile'],
    queryFn: () => api.get('/listings/my/all').then(r => r.data),
    enabled: !!me?.is_host,
  });

  const isHost     = me?.is_host;
  const isStudent  = me?.user_type === 'student';
  const isPending  = me?.hosting_request === 'pending';
  const approvedCount = (myListings || []).filter(l => l.status === 'approved').length;
  const totalViews    = (myListings || []).reduce((a, l) => a + (l.view_count || 0), 0);
  const referralLink  = `https://unilo-client.vercel.app/register?ref=${me?.id?.slice(0,8)}`;

  const uploadAvatar = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await api.patch('/auth/me', { avatar_url: data.url });
      useAuthStore.setState(s => ({ user: { ...s.user, avatar_url: data.url } }));
      qc.invalidateQueries(['me']);
    } catch { /* silent */ }
    finally { setUploading(false); }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const TABS = [
    { id: 'profile',  label: 'Profile' },
    { id: 'settings', label: 'Settings' },
    ...(isHost ? [{ id: 'listings', label: 'My Rooms' }] : []),
  ];

  const statusColors = {
    approved: { bg: 'rgba(16,185,129,0.12)', color: GREEN },
    pending:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    draft:    { bg: 'rgba(255,255,255,0.08)', color: MUTED },
    rejected: { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  };

  return (
    <div style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif', paddingBottom: 100 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid ${BORDER}`, paddingTop: 'max(20px, env(safe-area-inset-top))' }}>

        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px 16px' }}>
          <div style={{ position: 'relative' }}>
            <Avatar user={me} size={68} onUpload={uploadAvatar} />
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 18, height: 18, border: `2px solid ${BRAND}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: CREAM, margin: '0 0 3px', lineHeight: 1.2 }}>
              {me.first_name} {me.last_name}
            </h1>
            <p style={{ fontSize: 12, color: MUTED, margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{me.email}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: `${BRAND}18`, color: BRAND, border: `1px solid ${BRAND}28` }}>
                {isStudent ? '🎓 Student' : isHost ? '🏠 Landlord' : '👨‍👩‍👧 Renter'}
              </span>
              {isPending && !isHost && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 9px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <I.Clock /> Hosting under review
                </span>
              )}
            </div>
          </div>
          <motion.button onClick={() => setShowEdit(true)} whileTap={{ scale: 0.95 }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 12px', color: CREAM, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
            <I.Edit /> Edit
          </motion.button>
        </div>

        {/* ── Switch mode card (Airbnb-style) ────────────────────────────── */}
        {!isHost && (
          <div style={{ margin: '0 16px 16px', background: isPending ? 'rgba(245,158,11,0.08)' : `${BRAND}08`, border: `1px solid ${isPending ? 'rgba(245,158,11,0.25)' : `${BRAND}20`}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: isPending ? 'rgba(245,158,11,0.15)' : `${BRAND}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {isPending ? '⏳' : '🏠'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: '0 0 2px' }}>
                {isPending ? 'Hosting request pending' : 'Switch to Hosting'}
              </p>
              <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.4 }}>
                {isPending ? 'Unilo team reviewing your details — usually within 24 hours.' : 'List your rooms and reach thousands of students near their campus.'}
              </p>
            </div>
            {!isPending && (
              <motion.button onClick={() => setShowHosting(true)} whileTap={{ scale: 0.95 }}
                style={{ background: BRAND, color: '#fff', border: 'none', borderRadius: 11, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
                Apply →
              </motion.button>
            )}
          </div>
        )}

        {isHost && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '0 16px 16px' }}>
            {[{ label: 'Live rooms', value: approvedCount, color: GREEN }, { label: 'Total views', value: totalViews.toLocaleString(), color: BRAND }, { label: 'All listings', value: (myListings || []).length, color: CREAM }].map(s => (
              <div key={s.label} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', paddingLeft: 8, borderBottom: `1px solid ${BORDER}` }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '10px 16px', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? BRAND : MUTED, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', borderBottom: `2px solid ${activeTab === tab.id ? BRAND : 'transparent'}`, transition: 'all 0.15s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>
        <AnimatePresence mode="wait">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <SectionCard title="Contact">
                {[
                  { icon: I.Email, label: 'Email', value: me.email },
                  { icon: I.Phone, label: 'Phone', value: me.phone },
                  { icon: I.WhatsApp, label: 'WhatsApp', value: me.whatsapp },
                ].map(({ icon: Ic, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{ color: value ? BRAND : 'rgba(255,255,255,0.18)', flexShrink: 0 }}><Ic /></span>
                    <div>
                      <p style={{ fontSize: 11, color: MUTED, margin: '0 0 2px' }}>{label}</p>
                      <p style={{ fontSize: 14, color: value ? CREAM : 'rgba(255,255,255,0.25)', margin: 0, fontStyle: value ? 'normal' : 'italic' }}>{value || `Add ${label.toLowerCase()}`}</p>
                    </div>
                  </div>
                ))}
              </SectionCard>

              {isStudent && (
                <SectionCard title="Student Info">
                  {[
                    { icon: I.Uni, label: 'University', value: me.university },
                    { icon: I.Book, label: 'Department', value: me.department },
                    { icon: I.Book, label: 'Level', value: me.level },
                  ].map(({ icon: Ic, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ color: value ? BRAND : 'rgba(255,255,255,0.18)', flexShrink: 0 }}><Ic /></span>
                      <div>
                        <p style={{ fontSize: 11, color: MUTED, margin: '0 0 2px' }}>{label}</p>
                        <p style={{ fontSize: 14, color: value ? CREAM : 'rgba(255,255,255,0.25)', margin: 0, fontStyle: value ? 'normal' : 'italic' }}>{value || `Add ${label.toLowerCase()}`}</p>
                      </div>
                    </div>
                  ))}
                </SectionCard>
              )}

              {isHost && me.business_name && (
                <SectionCard title="Host Info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0' }}>
                    <span style={{ color: BRAND }}><I.Home /></span>
                    <div>
                      <p style={{ fontSize: 11, color: MUTED, margin: '0 0 2px' }}>Business / Property</p>
                      <p style={{ fontSize: 14, color: CREAM, margin: 0 }}>{me.business_name}</p>
                    </div>
                  </div>
                </SectionCard>
              )}
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Refer & Earn */}
              <SectionCard title="Refer & Earn">
                <div style={{ padding: '12px 0 8px' }}>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>
                    Share your link. Earn <strong style={{ color: BRAND }}>₦500 credit</strong> for every friend who books their first room.
                  </p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, background: `${BRAND}10`, border: `1px solid ${BRAND}25`, borderRadius: 10, padding: '10px 12px', fontSize: 12, color: BRAND, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {referralLink}
                    </div>
                    <motion.button onClick={copyReferral} whileTap={{ scale: 0.92 }}
                      style={{ flexShrink: 0, background: copied ? GREEN : BRAND, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.2s' }}>
                      {copied ? <><I.Check /> Copied!</> : <><I.Copy /> Copy</>}
                    </motion.button>
                  </div>
                </div>
              </SectionCard>

              {/* Deals for you */}
              <SectionCard title="Deals for You">
                <SettingsRow icon={I.Star} label="Personalised room deals" sublabel="Rooms picked based on your saved searches and university" onClick={() => navigate('/search?deals=true')} />
              </SectionCard>

              {/* Account */}
              <SectionCard title="Account">
                <SettingsRow icon={I.Lock} label="Change password" onClick={() => setShowPassword(true)} />
                <SettingsRow icon={I.Shield} label="Privacy settings" sublabel="Control who sees your profile" onClick={() => {}} />
                <SettingsRow icon={I.Settings} label="Notification preferences" onClick={() => {}} />
                {isHost && (
                  <SettingsRow icon={I.Home} label="Manage in Admin Panel" sublabel="Create listings, edit details, approve reviews" onClick={() => window.open('https://unilo-admin.vercel.app', '_blank')} />
                )}
              </SectionCard>

              {/* Support */}
              <SectionCard title="Support">
                <SettingsRow icon={I.Help} label="Help & FAQ" onClick={() => {}} />
                <SettingsRow icon={I.Email} label="Contact support" sublabel="support@unilo.ng" onClick={() => window.open('mailto:support@unilo.ng')} />
              </SectionCard>

              {/* Legal */}
              <SectionCard title="Legal">
                <SettingsRow icon={I.FileText} label="Terms of Service" onClick={() => {}} />
                <SettingsRow icon={I.Shield} label="Privacy Policy" onClick={() => {}} />
                <SettingsRow icon={I.FileText} label="Cookie Policy" onClick={() => {}} />
              </SectionCard>

              {/* App info */}
              <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0 }}>Unilo v1.0 · Made for Nigerian students 🇳🇬</p>
              </div>

              {/* Sign out */}
              <motion.button onClick={() => { logout(); navigate('/'); }} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 600, color: '#ef4444', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', marginTop: 8 }}>
                <I.LogOut /> Sign out
              </motion.button>
            </motion.div>
          )}

          {/* MY ROOMS TAB */}
          {activeTab === 'listings' && isHost && (
            <motion.div key="listings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>{(myListings || []).length} total</p>
                <a href="https://unilo-admin.vercel.app" target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: BRAND, textDecoration: 'none', background: `${BRAND}12`, padding: '7px 14px', borderRadius: 10, border: `1px solid ${BRAND}25` }}>
                  + New listing
                </a>
              </div>
              {(myListings || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: CREAM, fontWeight: 600 }}>No listings yet</p>
                  <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Create your first listing in the admin panel.</p>
                </div>
              ) : (myListings || []).map(listing => {
                const sc = statusColors[listing.status] || statusColors.draft;
                return (
                  <div key={listing.id} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 12, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 56, height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {listing.photos?.[0]?.url ? <img src={listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🏠</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</p>
                      <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>{listing.city} · ₦{Number(listing.price).toLocaleString()}/yr</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: sc.bg, color: sc.color, flexShrink: 0, textTransform: 'capitalize' }}>
                      {listing.status}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── FAB ────────────────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => window.dispatchEvent(new CustomEvent('openQuickList'))}
        style={{ position: 'fixed', bottom: 88, right: 20, zIndex: 40, width: 52, height: 52, borderRadius: '50%', background: BRAND, border: '2px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(255,107,0,0.45)' }}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </motion.button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEdit     && <EditModal user={me} onClose={() => setShowEdit(false)} />}
        {showHosting  && <SwitchHostingModal user={me} onClose={() => setShowHosting(false)} />}
        {showPassword && <PasswordModal onClose={() => setShowPassword(false)} />}
      </AnimatePresence>
    </div>
  );
}
