import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

const TYPES = ['self_contain', 'room_and_parlour', 'flat', 'bungalow', 'duplex', 'hostel'];

export default function QuickListModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: basic info, 2: contact
  const [form, setForm] = useState({
    // Basic property info
    title: '',
    type: 'self_contain',
    bedrooms: 1,
    bathrooms: 1,
    price: '',
    price_period: 'annually',
    address: '',
    city: '',
    state: '',
    description: '',
    amenities: [],
    whatsapp_number: '',
    youtube_url: '',
    // Contact info
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const createListing = useMutation({
    mutationFn: () =>
      api.post('/listings/quick', {
        ...form,
        price: parseFloat(form.price),
      }),
    onSuccess: (response) => {
      console.log('✅ Listing created:', response.data);
      setStep(3); // Success screen
    },
    onError: (err) => {
      console.error('❌ Error creating listing:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to submit listing');
    },
  });

  const handleNext = () => {
    // Validate step 1 before proceeding
    if (step === 1) {
      if (!form.title || !form.price || !form.address || !form.city || !form.type) {
        setError('Please fill in all required fields');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleSubmit = () => {
    // Validate step 2
    if (!form.contact_name || !form.contact_email || !form.contact_phone) {
      setError('Please provide your contact information');
      return;
    }
    setError('');
    createListing.mutate();
  };

  if (!isOpen) return null;

  // Success screen
  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display font-bold text-2xl text-cream mb-2">Listing submitted!</h2>
          <p className="text-muted mb-6">
            Your property has been sent to Unilo for verification. You'll hear from us within 24 hours via email.
          </p>
          <button
            onClick={() => {
              setStep(1);
              setForm({
                title: '',
                type: 'self_contain',
                bedrooms: 1,
                bathrooms: 1,
                price: '',
                price_period: 'annually',
                address: '',
                city: '',
                state: '',
                description: '',
                amenities: [],
                whatsapp_number: '',
                youtube_url: '',
                contact_name: '',
                contact_email: '',
                contact_phone: '',
              });
              setError('');
              onClose();
            }}
            className="btn-primary w-full"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-navy-800 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-navy-800 border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display font-semibold text-cream text-lg">
            {step === 1 ? 'List your property' : 'Your contact info'}
          </h2>
          <button
            onClick={() => {
              if (step === 2) {
                setStep(1);
              } else {
                onClose();
              }
            }}
            className="text-muted hover:text-cream text-xl leading-none"
          >
            {step === 2 ? '←' : '✕'}
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Step 1: Property Details */}
          {step === 1 && (
            <>
              {/* Title */}
              <div>
                <label className="text-xs text-muted block mb-1.5">Property name *</label>
                <input
                  className="input"
                  placeholder="e.g. Cozy Self Contain near Uniport"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              {/* Type + Beds + Baths */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Type *</label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={(e) => set('type', e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Beds</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="10"
                    value={form.bedrooms}
                    onChange={(e) => set('bedrooms', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Baths</label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="10"
                    value={form.bathrooms}
                    onChange={(e) => set('bathrooms', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Rent (₦) *</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="350000"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Period</label>
                  <select
                    className="input"
                    value={form.price_period}
                    onChange={(e) => set('price_period', e.target.value)}
                  >
                    <option value="annually">Per Year</option>
                    <option value="monthly">Per Month</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-muted block mb-1.5">Street address *</label>
                <input
                  className="input"
                  placeholder="12 University Road"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">City *</label>
                  <input
                    className="input"
                    placeholder="Port Harcourt"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">State *</label>
                  <input
                    className="input"
                    placeholder="Rivers"
                    value={form.state}
                    onChange={(e) => set('state', e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-muted block mb-1.5">Description</label>
                <textarea
                  className="input min-h-[80px] resize-none"
                  placeholder="Describe your property…"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </div>

              {/* WhatsApp + YouTube (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">💬 WhatsApp</label>
                  <input
                    className="input"
                    placeholder="+2348012345678"
                    value={form.whatsapp_number}
                    onChange={(e) => set('whatsapp_number', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">🎥 YouTube tour</label>
                  <input
                    className="input"
                    placeholder="https://youtu.be/…"
                    value={form.youtube_url}
                    onChange={(e) => set('youtube_url', e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
            </>
          )}

          {/* Step 2: Contact Info */}
          {step === 2 && (
            <>
              <p className="text-muted text-sm mb-4">
                We'll use this to contact you about your listing verification.
              </p>

              <div>
                <label className="text-xs text-muted block mb-1.5">Your name *</label>
                <input
                  className="input"
                  placeholder="John Doe"
                  value={form.contact_name}
                  onChange={(e) => set('contact_name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Email address *</label>
                <input
                  className="input"
                  type="email"
                  placeholder="john@example.com"
                  value={form.contact_email}
                  onChange={(e) => set('contact_email', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1.5">Phone number *</label>
                <input
                  className="input"
                  placeholder="+234 801 234 5678"
                  value={form.contact_phone}
                  onChange={(e) => set('contact_phone', e.target.value)}
                />
              </div>

              {error && (
                <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-navy-800 border-t border-white/10 px-5 py-4 flex gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="btn-ghost flex-1">
                Cancel
              </button>
              <button onClick={handleNext} className="btn-primary flex-1">
                Next →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={createListing.isPending}
                className="btn-primary flex-1"
              >
                {createListing.isPending ? 'Submitting…' : 'Submit listing'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
