import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { PASSIONS, PRIORITY_LEVELS } from '../data/passions';
import { useAuthStore } from '../store/authStore';

const ROOM_TYPES = ['self_contain', 'room_and_parlour', 'flat', 'bungalow', 'duplex', 'hostel'];
const AMENITIES = ['wifi', 'generator', 'water', 'security', 'parking', 'kitchen', 'furnished', 'air_conditioning', 'cctv'];
const UNIVERSITIES = ['University of Lagos', 'Covenant University', 'OAU Ile-Ife', 'UNIPORT', 'UNIZIK'];
const CAMPUSES = { 'University of Lagos': ['Main Campus', 'Medical Campus', 'Law Campus'] };

const EMPTY_ROOM_FORM = {
  title: '',
  type: 'self_contain',
  bedrooms: 1,
  bathrooms: 1,
  price: '',
  price_period: 'annually',
  open_for_clusters: false,
  university: '',
  campus: '',
  region: '',
  map_location: '',
  youtube_url: '',
  amenities: [],
  photos: [],
  contact_name: '',
  contact_email: '',
  contact_phone: '',
};

const EMPTY_ROOMMATE_FORM = {
  university: '',
  budget_min: '',
  budget_max: '',
  move_in_date: '',
  passions: [],
  priorities: {},
  bio: '',
  contact_name: '',
  contact_phone: '',
};

export default function QuickListModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [listingType, setListingType] = useState(null);
  const [step, setStep] = useState(1);
  const scrollContainerRef = useRef(null);

  const [form, setForm] = useState(EMPTY_ROOM_FORM);
  const [roommateForm, setRoommateForm] = useState(EMPTY_ROOMMATE_FORM);
  const [error, setError] = useState('');

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setRoommateField = (key, val) => setRoommateForm((f) => ({ ...f, [key]: val }));

  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));

  const togglePassion = (id) =>
    setRoommateForm((f) => ({
      ...f,
      passions: f.passions.includes(id)
        ? f.passions.filter((x) => x !== id)
        : [...f.passions, id],
    }));

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 20);
    setForm((f) => ({ ...f, photos: files }));
  };

  const handleClose = () => {
    setListingType(null);
    setStep(1);
    setForm(EMPTY_ROOM_FORM);
    setRoommateForm(EMPTY_ROOMMATE_FORM);
    setError('');
    onClose();
  };

  // ─── MUTATIONS ───────────────────────────────────────────────────────────────
  const createListing = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'photos') {
          val.forEach((p) => formData.append('photos', p));
        } else if (key === 'amenities') {
          formData.append(key, JSON.stringify(val));
        } else {
          formData.append(key, val);
        }
      });
      return api.post('/listings/quick', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => setStep(3),
    onError: (err) => setError(err.response?.data?.error || 'Failed to create listing'),
  });

  const createRoommate = useMutation({
    mutationFn: async () =>
      api.post('/roommates/quick', roommateForm),
    onSuccess: () => setStep(3),
    onError: (err) => setError(err.response?.data?.error || 'Failed to submit roommate request'),
  });

  if (!isOpen) return null;

  // ─── STEP 1: TYPE SELECTION ───────────────────────────────────────────────────
  if (!listingType) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full">
          <h2 className="font-display font-bold text-2xl text-cream mb-2">
            What do you want to list?
          </h2>
          <p className="text-muted text-sm mb-6">Choose one to get started in 2 clicks.</p>

          <div className="space-y-3">
            <button
              onClick={() => { setListingType('room'); setStep(2); }}
              className="w-full bg-brand/20 border border-brand/40 hover:bg-brand/30 text-cream p-4 rounded-xl transition"
            >
              <div className="text-xl mb-2">🏠</div>
              <div className="font-semibold">List a Room Space</div>
              <div className="text-xs text-muted">Post a flat, self-contain, or hostel to find a tenant.</div>
            </button>

            <button
              onClick={() => { setListingType('roommate'); setStep(2); }}
              className="w-full bg-brand/20 border border-brand/40 hover:bg-brand/30 text-cream p-4 rounded-xl transition"
            >
              <div className="text-xl mb-2">🤝</div>
              <div className="font-semibold">List a Roommate Space</div>
              <div className="text-xs text-muted">Find someone to share your room and split the costs.</div>
            </button>
          </div>

          <button onClick={handleClose} className="w-full mt-4 text-muted hover:text-cream">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── ROOMMATE FLOW ───────────────────────────────────────────────────────────
  if (listingType === 'roommate' && step === 2) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-navy-800 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-navy-800 border-b border-white/10 px-5 py-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-cream">Find a Roommate</h2>
            <button onClick={handleClose} className="text-muted hover:text-cream text-xl">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* University */}
            <div>
              <label className="text-xs text-muted block mb-1.5">University *</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                value={roommateForm.university}
                onChange={(e) => setRoommateField('university', e.target.value)}
              >
                <option value="">Select university...</option>
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u} className="bg-navy-900">{u}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1.5">Min Budget (₦)</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                  type="number"
                  placeholder="100000"
                  value={roommateForm.budget_min}
                  onChange={(e) => setRoommateField('budget_min', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Max Budget (₦)</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                  type="number"
                  placeholder="300000"
                  value={roommateForm.budget_max}
                  onChange={(e) => setRoommateField('budget_max', e.target.value)}
                />
              </div>
            </div>

            {/* Move-in date */}
            <div>
              <label className="text-xs text-muted block mb-1.5">Move-in Date</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                type="date"
                value={roommateForm.move_in_date}
                onChange={(e) => setRoommateField('move_in_date', e.target.value)}
              />
            </div>

            {/* Passions */}
            <div>
              <label className="text-xs text-muted block mb-2">Your Passions</label>
              <div className="flex flex-wrap gap-2">
                {PASSIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePassion(p.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      roommateForm.passions.includes(p.id)
                        ? 'bg-brand/20 text-brand border-brand/40'
                        : 'bg-white/5 text-muted border-white/10'
                    }`}
                  >
                    {p.emoji} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priorities */}
            <div>
              <label className="text-xs text-muted block mb-2">Roommate Priorities</label>
              <div className="space-y-2">
                {['Quiet hours', 'Cleanliness', 'Guests allowed', 'Shared meals'].map((pref) => (
                  <div key={pref} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <span className="text-sm text-cream">{pref}</span>
                    <div className="flex gap-1">
                      {PRIORITY_LEVELS.map((level) => (
                        <button
                          key={level.id}
                          onClick={() =>
                            setRoommateForm((f) => ({
                              ...f,
                              priorities: { ...f.priorities, [pref]: level.id },
                            }))
                          }
                          className="text-[10px] px-2 py-0.5 rounded-full border transition"
                          style={{
                            backgroundColor:
                              roommateForm.priorities[pref] === level.id
                                ? `${level.color}30`
                                : 'transparent',
                            borderColor:
                              roommateForm.priorities[pref] === level.id
                                ? level.color
                                : 'rgba(255,255,255,0.1)',
                            color:
                              roommateForm.priorities[pref] === level.id
                                ? level.color
                                : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs text-muted block mb-1.5">About You</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm resize-none"
                rows={3}
                placeholder="Tell potential roommates a bit about yourself..."
                value={roommateForm.bio}
                onChange={(e) => setRoommateField('bio', e.target.value)}
              />
            </div>

            {/* Contact */}
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-cream mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Name *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                    placeholder="John Doe"
                    value={roommateForm.contact_name}
                    onChange={(e) => setRoommateField('contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Phone *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                    placeholder="+234 801 234 5678"
                    value={roommateForm.contact_phone}
                    onChange={(e) => setRoommateField('contact_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-danger text-sm bg-danger/10 p-3 rounded">{error}</p>}
          </div>

          <div className="sticky bottom-0 bg-navy-800 border-t border-white/10 px-5 py-4 flex gap-3">
            <button
              onClick={() => { setListingType(null); setStep(1); }}
              className="flex-1 bg-white/5 hover:bg-white/10 text-cream rounded-lg py-2"
            >
              Back
            </button>
            <button
              onClick={() => createRoommate.mutate()}
              disabled={
                createRoommate.isPending ||
                !roommateForm.university ||
                !roommateForm.contact_name ||
                !roommateForm.contact_phone
              }
              className="flex-1 bg-brand hover:bg-brand/90 text-navy font-semibold rounded-lg py-2 disabled:opacity-50"
            >
              {createRoommate.isPending ? 'Submitting...' : 'Find Roommate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ROOM SPACE FLOW ─────────────────────────────────────────────────────────
  if (listingType === 'room' && step === 2) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-navy-800 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 bg-navy-800 border-b border-white/10 px-5 py-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-cream">List a Room Space</h2>
            <button onClick={handleClose} className="text-muted hover:text-cream text-xl">✕</button>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="text-xs text-muted block mb-1.5">Lodge Name *</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                placeholder="e.g. Paradise Gardens"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5">Room Number</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                placeholder="e.g. 12A"
                value={form.region}
                onChange={(e) => setField('region', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1.5">Type *</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-cream text-sm"
                  value={form.type}
                  onChange={(e) => setField('type', e.target.value)}
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-navy-900">
                      {t.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Beds</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-cream"
                  type="number"
                  min="1"
                  value={form.bedrooms}
                  onChange={(e) => setField('bedrooms', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Baths</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-cream"
                  type="number"
                  min="1"
                  value={form.bathrooms}
                  onChange={(e) => setField('bathrooms', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1.5">Rent (₦) *</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                  type="number"
                  placeholder="350000"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Period</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-cream text-sm"
                  value={form.price_period}
                  onChange={(e) => setField('price_period', e.target.value)}
                >
                  <option value="monthly" className="bg-navy-900">Per Month</option>
                  <option value="annually" className="bg-navy-900">Per Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
              <input
                type="checkbox"
                id="clusters"
                checked={form.open_for_clusters}
                onChange={(e) => setField('open_for_clusters', e.target.checked)}
                className="w-5 h-5 accent-brand"
              />
              <label htmlFor="clusters" className="text-sm text-cream cursor-pointer">
                Open for Clusters (roommate matching)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1.5">University *</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-cream text-sm"
                  value={form.university}
                  onChange={(e) => setField('university', e.target.value)}
                >
                  <option value="">Select...</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u} className="bg-navy-900">{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1.5">Campus</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-cream text-sm"
                  value={form.campus}
                  onChange={(e) => setField('campus', e.target.value)}
                >
                  <option value="">Any campus</option>
                  {form.university &&
                    CAMPUSES[form.university]?.map((c) => (
                      <option key={c} value={c} className="bg-navy-900">{c}</option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5">📍 Location on Map *</label>
              <div className="w-full h-40 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-muted text-sm mb-2">
                [Map Picker — Click to select]
              </div>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
                placeholder="Or paste Google Maps link"
                value={form.map_location}
                onChange={(e) => setField('map_location', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={`badge text-xs px-2 py-1 rounded-full border transition ${
                      form.amenities.includes(a)
                        ? 'bg-brand/20 text-brand border-brand/40'
                        : 'bg-white/5 text-muted border-white/10'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5">🎥 YouTube Tour Link</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                placeholder="https://youtu.be/..."
                value={form.youtube_url}
                onChange={(e) => setField('youtube_url', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-muted block mb-1.5">📸 Photos (1–20)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-sm text-muted w-full"
              />
              {form.photos.length > 0 && (
                <p className="text-brand text-xs mt-1">{form.photos.length} photo(s) selected</p>
              )}
            </div>

            {/* Contact Information */}
            <div className="border-t border-white/10 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-cream mb-3">Your Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Name *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                    placeholder="John Doe"
                    value={form.contact_name}
                    onChange={(e) => setField('contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Email *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                    type="email"
                    placeholder="john@example.com"
                    value={form.contact_email}
                    onChange={(e) => setField('contact_email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1.5">Phone *</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream"
                    placeholder="+234 801 234 5678"
                    value={form.contact_phone}
                    onChange={(e) => setField('contact_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-danger text-sm bg-danger/10 p-3 rounded">{error}</p>}
          </div>

          <div className="sticky bottom-0 bg-navy-800 border-t border-white/10 px-5 py-4 flex gap-3">
            <button
              onClick={() => { setListingType(null); setStep(1); }}
              className="flex-1 bg-white/5 hover:bg-white/10 text-cream rounded-lg py-2"
            >
              Back
            </button>
            <button
              onClick={() => createListing.mutate()}
              disabled={
                createListing.isPending ||
                !form.title ||
                !form.price ||
                !form.university ||
                !form.contact_name ||
                !form.contact_email ||
                !form.contact_phone
              }
              className="flex-1 bg-brand hover:bg-brand/90 text-navy font-semibold rounded-lg py-2 disabled:opacity-50"
            >
              {createListing.isPending ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (step === 3) {
    const isHostRegistered = isAuthenticated && user?.role === 'user_admin';

    const handleReset = () => {
      setStep(1);
      setListingType(null);
      setForm(EMPTY_ROOM_FORM);
      setRoommateForm(EMPTY_ROOMMATE_FORM);
      setError('');
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-navy-800 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-display font-bold text-2xl text-cream mb-2">
            {listingType === 'roommate' ? 'Request submitted!' : 'Listing submitted!'}
          </h2>
          <p className="text-muted mb-4">
            {listingType === 'roommate'
              ? "We'll match you with compatible roommates and reach out within 24 hours."
              : "Your listing has been sent to Unilo for verification. We'll review it within 24 hours."}
          </p>
          <p className="text-muted text-sm mb-6">
            📱 We'll contact you at:{' '}
            <span className="text-cream font-medium">
              {listingType === 'roommate' ? roommateForm.contact_phone : form.contact_phone}
            </span>
          </p>

          {!isHostRegistered && listingType === 'room' ? (
            <div className="space-y-3">
              <p className="text-muted text-sm">
                To manage your listings and earnings, register as a host:
              </p>
              <button
                onClick={() => { onClose(); navigate('/become-host'); }}
                className="w-full bg-brand hover:bg-brand/90 text-navy font-semibold py-2 rounded-lg transition"
              >
                Become a Host
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-white/5 hover:bg-white/10 text-cream py-2 rounded-lg"
              >
                Later
              </button>
            </div>
          ) : (
            <button
              onClick={handleReset}
              className="w-full bg-brand hover:bg-brand/90 text-navy font-semibold py-2 rounded-lg"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
