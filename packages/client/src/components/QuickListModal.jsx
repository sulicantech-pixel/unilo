/**
 * QuickListModal — dual listing flow
 *
 * MODE A: "List a Room Space"
 *   Step 1 → Room type, price, location
 *   Step 2 → Contact details
 *   Step 3 → Done ✓
 *
 * MODE B: "List a Roommate Space"
 *   Step 1 → Room type, price, location (same)
 *   Step 2 → Roommate preferences (gender, personality, lifestyle)
 *   Step 3 → Contact details
 *   Step 4 → Done ✓
 *
 * Both POST to /api/listings/quick → lands in admin pending queue
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { COLORS } from '../utils/designSystem';

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { value: 'self_contain',     label: 'Self Contain',   icon: '🚪' },
  { value: 'room_and_parlour', label: 'Room & Parlour', icon: '🛋️' },
  { value: 'flat',             label: 'Flat',           icon: '🏢' },
  { value: 'hostel',           label: 'Hostel/Lodge',   icon: '🏨' },
  { value: 'bungalow',         label: 'Bungalow',       icon: '🏡' },
  { value: 'duplex',           label: 'Duplex',         icon: '🏘️' },
];

const PRICE_RANGES = [
  { label: 'Under ₦100k',    value: '80000' },
  { label: '₦100k – ₦200k', value: '150000' },
  { label: '₦200k – ₦350k', value: '275000' },
  { label: '₦350k – ₦500k', value: '425000' },
  { label: 'Above ₦500k',   value: '600000' },
  { label: "I'll type it",   value: 'custom' },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const GENDER_PREFS = [
  { value: 'any',    label: 'Any gender',    icon: '🤝' },
  { value: 'male',   label: 'Males only',    icon: '👨' },
  { value: 'female', label: 'Females only',  icon: '👩' },
];

const LIFESTYLE_TAGS = [
  { value: 'early_riser',   label: '🌅 Early riser' },
  { value: 'night_owl',     label: '🦉 Night owl' },
  { value: 'quiet',         label: '🤫 Keeps it quiet' },
  { value: 'social',        label: '🎉 Social / friendly' },
  { value: 'religious',     label: '🙏 Religious' },
  { value: 'no_visitors',   label: '🚫 No visitors' },
  { value: 'cooking',       label: '🍳 Likes to cook' },
  { value: 'study_focused', label: '📚 Study-focused' },
  { value: 'neat',          label: '🧹 Very neat' },
  { value: 'working_class', label: '💼 Working-class student' },
];

const STUDENT_LEVELS = ['100L', '200L', '300L', '400L', '500L', 'Postgrad', 'Any'];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
  padding: '12px 14px', color: '#f5f0e8', fontSize: 15,
  fontFamily: 'DM Sans, sans-serif', outline: 'none',
};

const label11 = {
  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'block',
};

// ─── PILL BUTTON ─────────────────────────────────────────────────────────────
function Pill({ active, onClick, children, color = COLORS.brand }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '8px 14px', borderRadius: 99, cursor: 'pointer',
        border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.09)'}`,
        background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
        color: active ? color : COLORS.cream,
        fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif',
        transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </motion.button>
  );
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function Steps({ current, total, isRoommate }) {
  const labels = isRoommate
    ? ['Room', 'Roommate', 'Contact']
    : ['Room', 'Contact'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {labels.map((lbl, i) => {
        const n       = i + 1;
        const done    = current > n;
        const active  = current === n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done || active ? COLORS.brand : 'rgba(255,255,255,0.1)',
                color: done || active ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? COLORS.cream : 'rgba(255,255,255,0.3)' }}>
                {lbl}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ width: 20, height: 1.5, background: done ? COLORS.brand : 'rgba(255,255,255,0.1)', borderRadius: 99, transition: 'background 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SUMMARY BOX ─────────────────────────────────────────────────────────────
function Summary({ form, isRoommate }) {
  const price = form.price === 'custom' ? Number(form.customPrice) : Number(form.price);
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginTop: 4 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Your listing summary
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {[
          ['Type', form.type.replace(/_/g, ' ')],
          ['Location', [form.city, form.state].filter(Boolean).join(', ')],
          ['Rent', price ? `₦${price.toLocaleString()}/yr` : '—'],
          ['Bedrooms', form.bedrooms],
          ...(isRoommate && form.gender_pref ? [['Roommate gender', GENDER_PREFS.find(g => g.value === form.gender_pref)?.label]] : []),
        ].map(([k, v]) => v ? (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: COLORS.muted }}>{k}</span>
            <span style={{ color: k === 'Rent' ? COLORS.brand : COLORS.cream, fontWeight: k === 'Rent' ? 700 : 500 }}>{v}</span>
          </div>
        ) : null)}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function QuickListModal({ isOpen, initialMode = 'room', onClose }) {
  const isRoommate  = initialMode === 'roommate';
  const PURPLE      = '#8b5cf6';
  const accentColor = isRoommate ? PURPLE : COLORS.brand;

  const totalSteps  = isRoommate ? 3 : 2;

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Room form (Step 1 — shared by both modes)
  const [room, setRoom] = useState({
    type: '', price: '', customPrice: '',
    city: '', state: '', address: '', bedrooms: '1',
  });

  // Roommate prefs form (Step 2 — roommate mode only)
  const [prefs, setPrefs] = useState({
    gender_pref:    'any',
    lifestyle_tags: [],
    level_pref:     'Any',
    max_roommates:  '1',
    extra_note:     '',
  });

  // Contact form (Step 2 room / Step 3 roommate)
  const [contact, setContact] = useState({
    contact_name: '', contact_phone: '', whatsapp_number: '',
  });

  // Reset when modal opens with new mode
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      setRoom({ type:'',price:'',customPrice:'',city:'',state:'',address:'',bedrooms:'1' });
      setPrefs({ gender_pref:'any', lifestyle_tags:[], level_pref:'Any', max_roommates:'1', extra_note:'' });
      setContact({ contact_name:'',contact_phone:'',whatsapp_number:'' });
    }
  }, [isOpen, initialMode]);

  const setR = (k, v) => setRoom(f => ({ ...f, [k]: v }));
  const setP = (k, v) => setPrefs(f => ({ ...f, [k]: v }));
  const setC = (k, v) => setContact(f => ({ ...f, [k]: v }));

  const toggleLifestyle = (val) =>
    setPrefs(f => ({
      ...f,
      lifestyle_tags: f.lifestyle_tags.includes(val)
        ? f.lifestyle_tags.filter(x => x !== val)
        : [...f.lifestyle_tags, val],
    }));

  const canStep1 = room.type &&
    (room.price !== 'custom' ? room.price !== '' : room.customPrice !== '') &&
    room.city;
  const canContact = contact.contact_name.trim() && contact.contact_phone.trim();

  const handleNext = () => { setError(''); setStep(s => s + 1); };
  const handleBack = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const price = room.price === 'custom' ? parseFloat(room.customPrice) : parseFloat(room.price);

      const payload = {
        title:           `${room.type.replace(/_/g,' ')} in ${room.city}`,
        type:            room.type,
        price,
        price_period:    'annually',
        city:            room.city,
        state:           room.state,
        address:         room.address || room.city,
        bedrooms:        parseInt(room.bedrooms),
        bathrooms:       1,
        contact_name:    contact.contact_name,
        contact_phone:   contact.contact_phone,
        whatsapp_number: contact.whatsapp_number || contact.contact_phone,
        // Roommate flags
        is_roommate_listing: isRoommate,
        ...(isRoommate ? {
          gender_pref:    prefs.gender_pref,
          lifestyle_tags: prefs.lifestyle_tags,
          level_pref:     prefs.level_pref,
          max_roommates:  parseInt(prefs.max_roommates),
          roommate_note:  prefs.extra_note,
        } : {}),
      };

      await api.post('/listings/quick', payload);
      setStep(totalSteps + 1); // success screen
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setStep(1); setError(''); onClose(); };

  const successStep = totalSteps + 1;
  const isSuccess   = step === successStep;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.76)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 520,
              background: '#111',
              border: `1px solid ${isRoommate ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: '24px 24px 0 0',
              maxHeight: 'calc(94dvh - env(safe-area-inset-bottom))',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{
              padding: '18px 20px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
              background: isRoommate
                ? 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, transparent 100%)'
                : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: COLORS.cream, margin: '0 0 3px' }}>
                    {isSuccess
                      ? '🎉 Submitted!'
                      : isRoommate
                        ? '👥 List a Roommate Space'
                        : '🏠 List a Room Space'}
                  </h2>
                  {!isSuccess && (
                    <p style={{ fontSize: 11, color: COLORS.muted, margin: 0 }}>
                      {isRoommate
                        ? 'List your room + describe your ideal roommate'
                        : 'Gets to students in under 24 hours · No account needed'}
                    </p>
                  )}
                </div>
                <button onClick={handleClose}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  ✕
                </button>
              </div>

              {!isSuccess && (
                <Steps current={step} total={totalSteps} isRoommate={isRoommate} />
              )}
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <AnimatePresence mode="wait">

                {/* ═══ STEP 1: Room details (both modes) ════════════════════ */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>

                    <label style={label11}>Type of space *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 22 }}>
                      {ROOM_TYPES.map(t => (
                        <motion.button key={t.value} onClick={() => setR('type', t.value)} whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '12px 8px', borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                            border: `1.5px solid ${room.type === t.value ? accentColor : 'rgba(255,255,255,0.09)'}`,
                            background: room.type === t.value ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
                            color: room.type === t.value ? accentColor : COLORS.cream,
                            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                          }}>
                          <div style={{ fontSize: 22, marginBottom: 5 }}>{t.icon}</div>
                          <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2 }}>{t.label}</div>
                        </motion.button>
                      ))}
                    </div>

                    <label style={label11}>Rent per year *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: room.price === 'custom' ? 10 : 22 }}>
                      {PRICE_RANGES.map(p => (
                        <Pill key={p.value} active={room.price === p.value} onClick={() => setR('price', p.value)} color={accentColor}>
                          {p.label}
                        </Pill>
                      ))}
                    </div>
                    {room.price === 'custom' && (
                      <div style={{ marginBottom: 22 }}>
                        <input style={inp} type="number" placeholder="Enter exact amount e.g. 320000"
                          value={room.customPrice} onChange={e => setR('customPrice', e.target.value)} autoFocus />
                      </div>
                    )}

                    <label style={label11}>Location *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <input style={inp} placeholder="City / Town *" value={room.city} onChange={e => setR('city', e.target.value)} />
                      <select value={room.state} onChange={e => setR('state', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                        <option value="">State</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                      </select>
                    </div>
                    <input style={{ ...inp, marginBottom: 22 }} placeholder="Street address (optional)" value={room.address} onChange={e => setR('address', e.target.value)} />

                    <label style={label11}>Bedrooms</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['1','2','3','4','5+'].map(n => (
                        <Pill key={n} active={room.bedrooms === n} onClick={() => setR('bedrooms', n)} color={accentColor}>{n}</Pill>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ═══ STEP 2 (roommate mode): Roommate preferences ════════ */}
                {step === 2 && isRoommate && (
                  <motion.div key="s2rm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>

                    <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.6 }}>
                      Describe who you're looking for. This helps us match you with the right student.
                    </p>

                    <label style={label11}>Preferred gender</label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                      {GENDER_PREFS.map(g => (
                        <Pill key={g.value} active={prefs.gender_pref === g.value} onClick={() => setP('gender_pref', g.value)} color={PURPLE}>
                          {g.icon} {g.label}
                        </Pill>
                      ))}
                    </div>

                    <label style={label11}>Lifestyle preferences <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>(pick any)</span></label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
                      {LIFESTYLE_TAGS.map(t => (
                        <Pill key={t.value} active={prefs.lifestyle_tags.includes(t.value)} onClick={() => toggleLifestyle(t.value)} color={PURPLE}>
                          {t.label}
                        </Pill>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                      <div>
                        <label style={label11}>Student level</label>
                        <select value={prefs.level_pref} onChange={e => setP('level_pref', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                          {STUDENT_LEVELS.map(l => <option key={l} value={l} style={{ background: '#111' }}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={label11}>No. of roommates</label>
                        <select value={prefs.max_roommates} onChange={e => setP('max_roommates', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                          {['1','2','3'].map(n => <option key={n} value={n} style={{ background: '#111' }}>{n} roommate{n > '1' ? 's' : ''}</option>)}
                        </select>
                      </div>
                    </div>

                    <label style={label11}>Anything else to add? <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
                    <textarea
                      value={prefs.extra_note}
                      onChange={e => setP('extra_note', e.target.value)}
                      placeholder="e.g. Must be a UNIZIK student, no smoking, must keep room clean…"
                      style={{ ...inp, minHeight: 80, resize: 'none', lineHeight: 1.6 }}
                    />
                  </motion.div>
                )}

                {/* ═══ STEP 2 (room mode) / STEP 3 (roommate mode): Contact ═ */}
                {((step === 2 && !isRoommate) || (step === 3 && isRoommate)) && (
                  <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>

                    <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.6 }}>
                      How should we reach you? Your info only goes to the Unilo team for review — never shown publicly without your permission.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={label11}>Your name *</label>
                        <input style={inp} placeholder="Full name" value={contact.contact_name}
                          onChange={e => setC('contact_name', e.target.value)} autoFocus />
                      </div>
                      <div>
                        <label style={label11}>Phone number *</label>
                        <input style={inp} type="tel" placeholder="+234 800 000 0000" value={contact.contact_phone}
                          onChange={e => setC('contact_phone', e.target.value)} />
                      </div>
                      <div>
                        <label style={label11}>
                          WhatsApp{' '}
                          <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>(if different from phone)</span>
                        </label>
                        <input style={inp} type="tel" placeholder="Same as phone if left blank" value={contact.whatsapp_number}
                          onChange={e => setC('whatsapp_number', e.target.value)} />
                      </div>
                    </div>

                    <div style={{ marginTop: 20 }}>
                      <Summary form={{ ...room }} isRoommate={isRoommate} />
                    </div>

                    {error && (
                      <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#f87171' }}>
                        {error}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ SUCCESS SCREEN ════════════════════════════════════════ */}
                {isSuccess && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
                    style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>{isRoommate ? '👥' : '🏠'}</div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: COLORS.cream, margin: '0 0 10px' }}>
                      {isRoommate ? 'Roommate space listed!' : 'Room listing submitted!'}
                    </h3>
                    <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.7, maxWidth: 280, margin: '0 auto 20px' }}>
                      The Unilo team will review and make it live within{' '}
                      <strong style={{ color: COLORS.cream }}>24 hours</strong>. We'll reach you on{' '}
                      <strong style={{ color: COLORS.cream }}>{contact.contact_phone}</strong>.
                    </p>
                    <div style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25`, borderRadius: 14, padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
                      <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>What happens next:</p>
                      {(isRoommate
                        ? ['Unilo team receives your listing', 'We review the room + roommate details', 'It goes live — compatible students apply', 'You pick who you want to room with']
                        : ['Unilo team receives your listing', 'We review and edit details if needed', 'Listing goes live to thousands of students']
                      ).map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 13, color: COLORS.cream, alignItems: 'flex-start' }}>
                          <span style={{ color: accentColor, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {s}
                        </div>
                      ))}
                    </div>
                    <button onClick={handleClose}
                      style={{ width: '100%', background: accentColor, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Done
                    </button>
                    <button onClick={() => { setStep(1); setError(''); }}
                      style={{ width: '100%', background: 'none', border: 'none', color: COLORS.muted, fontSize: 13, cursor: 'pointer', marginTop: 12, fontFamily: 'DM Sans, sans-serif' }}>
                      Submit another listing
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            {!isSuccess && (
              <div style={{ padding: '14px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, flexShrink: 0 }}>
                {step > 1 && (
                  <button onClick={handleBack}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: COLORS.cream, borderRadius: 12, padding: '13px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
                    ← Back
                  </button>
                )}

                {/* Step 1 → next */}
                {step === 1 && (
                  <motion.button onClick={handleNext} disabled={!canStep1} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, background: canStep1 ? accentColor : `${accentColor}40`, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: canStep1 ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}>
                    Next →
                  </motion.button>
                )}

                {/* Roommate step 2 → next (no validation required) */}
                {step === 2 && isRoommate && (
                  <motion.button onClick={handleNext} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, background: PURPLE, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    Next →
                  </motion.button>
                )}

                {/* Final submit */}
                {((step === 2 && !isRoommate) || (step === 3 && isRoommate)) && (
                  <motion.button onClick={handleSubmit} disabled={!canContact || loading} whileTap={{ scale: 0.97 }}
                    style={{ flex: 1, background: canContact && !loading ? accentColor : `${accentColor}40`, color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: canContact && !loading ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}>
                    {loading ? 'Submitting…' : 'Submit Listing ✓'}
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
