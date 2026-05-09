/**
 * QuickListModal — 3-step listing flow
 * Step 1: What type + price + city (30 seconds)
 * Step 2: Contact details
 * Step 3: Done
 *
 * Posts to POST /api/listings/quick (no auth needed)
 * Listing lands in admin pending queue as status: 'pending'
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { COLORS } from '../utils/designSystem';

const ROOM_TYPES = [
  { value: 'self_contain',     label: 'Self Contain',     icon: '🚪' },
  { value: 'room_and_parlour', label: 'Room & Parlour',   icon: '🛋️' },
  { value: 'flat',             label: 'Flat',             icon: '🏢' },
  { value: 'hostel',           label: 'Hostel/Lodge',     icon: '🏨' },
  { value: 'bungalow',         label: 'Bungalow',         icon: '🏡' },
  { value: 'duplex',           label: 'Duplex',           icon: '🏘️' },
];

const PRICE_RANGES = [
  { label: 'Under ₦100k',    value: '80000' },
  { label: '₦100k – ₦200k', value: '150000' },
  { label: '₦200k – ₦350k', value: '275000' },
  { label: '₦350k – ₦500k', value: '425000' },
  { label: 'Above ₦500k',   value: '600000' },
  { label: 'I\'ll type it', value: 'custom' },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River',
  'Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna',
  'Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo',
  'Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '12px 14px',
  color: '#f5f0e8',
  fontSize: 15,
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
};

export default function QuickListModal({ isOpen, onClose }) {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [form, setForm] = useState({
    type:          '',
    price:         '',
    customPrice:   '',
    city:          '',
    state:         '',
    address:       '',
    bedrooms:      '1',
    contact_name:  '',
    contact_phone: '',
    whatsapp_number: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const reset = () => {
    setStep(1);
    setError('');
    setForm({ type:'',price:'',customPrice:'',city:'',state:'',address:'',bedrooms:'1',contact_name:'',contact_phone:'',whatsapp_number:'' });
  };

  const handleClose = () => { reset(); onClose(); };

  const canStep1 = form.type && (form.price !== '' && form.price !== 'custom' || form.customPrice) && form.city;
  const canStep2 = form.contact_name.trim() && form.contact_phone.trim();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const price = form.price === 'custom' ? parseFloat(form.customPrice) : parseFloat(form.price);
      await api.post('/listings/quick', {
        title:           `${form.type.replace(/_/g,' ')} in ${form.city}`,
        type:            form.type,
        price,
        price_period:    'annually',
        city:            form.city,
        state:           form.state,
        address:         form.address || form.city,
        bedrooms:        parseInt(form.bedrooms),
        bathrooms:       1,
        contact_name:    form.contact_name,
        contact_phone:   form.contact_phone,
        whatsapp_number: form.whatsapp_number || form.contact_phone,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ['Details', 'Contact', 'Done'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 520,
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px 24px 0 0',
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: COLORS.cream, margin: 0 }}>
                  {step === 3 ? '🎉 Submitted!' : 'List a Space'}
                </h2>
                <button onClick={handleClose}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              </div>

              {/* Step dots */}
              {step < 3 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {stepLabels.slice(0, 2).map((label, i) => {
                    const n = i + 1;
                    const done    = step > n;
                    const current = step === n;
                    return (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? COLORS.brand : current ? COLORS.brand : 'rgba(255,255,255,0.1)',
                            color: done || current ? '#fff' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.2s',
                          }}>
                            {done ? '✓' : n}
                          </div>
                          <span style={{ fontSize: 12, color: current ? COLORS.cream : 'rgba(255,255,255,0.35)', fontWeight: current ? 600 : 400 }}>{label}</span>
                        </div>
                        {i < 1 && <div style={{ flex: 1, height: 1, background: done ? COLORS.brand : 'rgba(255,255,255,0.1)', minWidth: 20, transition: 'background 0.3s' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <AnimatePresence mode="wait">

                {/* ── STEP 1: Room type + price + city ───────────────────── */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                    <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 18, lineHeight: 1.5 }}>
                      Tell us about your space. Takes under 60 seconds.
                    </p>

                    {/* Room type */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Type of space *</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                      {ROOM_TYPES.map(t => (
                        <button key={t.value} onClick={() => set('type', t.value)}
                          style={{
                            padding: '12px 8px', borderRadius: 14, border: `1.5px solid ${form.type === t.value ? COLORS.brand : 'rgba(255,255,255,0.09)'}`,
                            background: form.type === t.value ? `${COLORS.brand}18` : 'rgba(255,255,255,0.03)',
                            color: form.type === t.value ? COLORS.brand : COLORS.cream,
                            cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
                          }}>
                          <div style={{ fontSize: 22, marginBottom: 5 }}>{t.icon}</div>
                          <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.2 }}>{t.label}</div>
                        </button>
                      ))}
                    </div>

                    {/* Price */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Rent (per year) *</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: form.price === 'custom' ? 10 : 20 }}>
                      {PRICE_RANGES.map(p => (
                        <button key={p.value} onClick={() => set('price', p.value)}
                          style={{
                            padding: '11px 8px', borderRadius: 12, border: `1.5px solid ${form.price === p.value ? COLORS.brand : 'rgba(255,255,255,0.09)'}`,
                            background: form.price === p.value ? `${COLORS.brand}18` : 'rgba(255,255,255,0.03)',
                            color: form.price === p.value ? COLORS.brand : COLORS.cream,
                            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
                          }}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {form.price === 'custom' && (
                      <div style={{ marginBottom: 20 }}>
                        <input style={inputStyle} type="number" placeholder="Enter exact amount e.g. 320000"
                          value={form.customPrice} onChange={e => set('customPrice', e.target.value)} autoFocus />
                      </div>
                    )}

                    {/* City + State */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Location *</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                      <input style={inputStyle} placeholder="City / Town *" value={form.city} onChange={e => set('city', e.target.value)} />
                      <select value={form.state} onChange={e => set('state', e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">State</option>
                        {NIGERIAN_STATES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                      </select>
                    </div>
                    <input style={{ ...inputStyle, marginBottom: 20 }} placeholder="Street address (optional)" value={form.address} onChange={e => set('address', e.target.value)} />

                    {/* Bedrooms */}
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Bedrooms</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {['1', '2', '3', '4', '5+'].map(n => (
                        <button key={n} onClick={() => set('bedrooms', n)}
                          style={{
                            flex: 1, padding: '10px 0', borderRadius: 11, border: `1.5px solid ${form.bedrooms === n ? COLORS.brand : 'rgba(255,255,255,0.09)'}`,
                            background: form.bedrooms === n ? `${COLORS.brand}18` : 'rgba(255,255,255,0.03)',
                            color: form.bedrooms === n ? COLORS.brand : COLORS.cream,
                            cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
                          }}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: Contact ────────────────────────────────────── */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.18 }}>
                    <p style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20, lineHeight: 1.5 }}>
                      How should we reach you? Your info stays private and only goes to the Unilo team for review.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your name *</p>
                        <input style={inputStyle} placeholder="Full name" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} autoFocus />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Phone number *</p>
                        <input style={inputStyle} type="tel" placeholder="+234 800 000 0000" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>WhatsApp <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>(if different)</span></p>
                        <input style={inputStyle} type="tel" placeholder="Same as phone if blank" value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} />
                      </div>

                      {/* Summary */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px', marginTop: 4 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your listing summary</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: COLORS.muted }}>Type</span>
                            <span style={{ color: COLORS.cream, fontWeight: 500 }}>{form.type.replace(/_/g,' ')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: COLORS.muted }}>Location</span>
                            <span style={{ color: COLORS.cream, fontWeight: 500 }}>{form.city}{form.state ? `, ${form.state}` : ''}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: COLORS.muted }}>Rent</span>
                            <span style={{ color: COLORS.brand, fontWeight: 700 }}>
                              ₦{Number(form.price === 'custom' ? form.customPrice : form.price).toLocaleString()}/yr
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: COLORS.muted }}>Bedrooms</span>
                            <span style={{ color: COLORS.cream, fontWeight: 500 }}>{form.bedrooms}</span>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: '#f87171' }}>
                          {error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Done ──────────────────────────────────────── */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
                    style={{ textAlign: 'center', padding: '20px 0 10px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: COLORS.cream, margin: '0 0 10px' }}>
                      Listing submitted!
                    </h3>
                    <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.7, maxWidth: 280, margin: '0 auto 20px' }}>
                      The Unilo team will review your listing and make it live within <strong style={{ color: COLORS.cream }}>24 hours</strong>. We'll contact you on <strong style={{ color: COLORS.cream }}>{form.contact_phone}</strong>.
                    </p>
                    <div style={{ background: `${COLORS.brand}12`, border: `1px solid ${COLORS.brand}25`, borderRadius: 14, padding: '14px 18px', marginBottom: 20, textAlign: 'left' }}>
                      <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>What happens next:</p>
                      {['Unilo team receives your listing', 'We review, edit details if needed', 'Listing goes live to thousands of students'].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 8, fontSize: 13, color: COLORS.cream }}>
                          <span style={{ color: COLORS.brand, fontWeight: 700, flexShrink: 0 }}>{i+1}.</span> {s}
                        </div>
                      ))}
                    </div>
                    <button onClick={handleClose}
                      style={{ width: '100%', background: COLORS.brand, color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Done
                    </button>
                    <button onClick={() => { reset(); }}
                      style={{ width: '100%', background: 'none', border: 'none', color: COLORS.muted, fontSize: 13, cursor: 'pointer', marginTop: 12, fontFamily: 'DM Sans, sans-serif' }}>
                      Submit another listing
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer buttons */}
            {step < 3 && (
              <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, flexShrink: 0 }}>
                {step === 2 && (
                  <button onClick={() => setStep(1)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: COLORS.cream, borderRadius: 12, padding: '13px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
                    ← Back
                  </button>
                )}
                <button
                  onClick={step === 1 ? () => setStep(2) : handleSubmit}
                  disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2) || loading}
                  style={{
                    flex: 1, background: ((step === 1 && !canStep1) || (step === 2 && !canStep2)) ? 'rgba(255,107,0,0.3)' : COLORS.brand,
                    color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700,
                    cursor: ((step === 1 && !canStep1) || (step === 2 && !canStep2)) ? 'not-allowed' : 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s',
                  }}>
                  {loading ? 'Submitting…' : step === 1 ? 'Next →' : 'Submit Listing'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
