import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAdminAuth } from '../store/authStore';

const TYPES     = ['self_contain', 'room_and_parlour', 'flat', 'bungalow', 'duplex', 'hostel'];
const AMENITIES = ['wifi', 'generator', 'water', 'security', 'parking', 'kitchen', 'furnished', 'air_conditioning', 'cctv'];

// Nominatim geocode — auto-fills lat/lng from address
async function geocodeAddress(address, city, state) {
  const q = [address, city, state, 'Nigeria'].filter(Boolean).join(', ');
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=ng`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
}

export default function CreateListingPage() {
  const navigate    = useNavigate();
  const qc          = useQueryClient();
  const { user }    = useAdminAuth();
  const isHeadAdmin = user?.role === 'head_admin';

  const [form, setForm] = useState({
    title: '', description: '', price: '', price_period: 'annually',
    address: '', city: '', state: '',
    latitude: '', longitude: '',
    type: 'self_contain', bedrooms: 1, bathrooms: 1,
    amenities: [],
    youtube_url: '', whatsapp_number: '', instagram_url: '',
    is_vacant: true,
  });
  const [photos, setPhotos]         = useState([]);
  const [error, setError]           = useState('');
  const [step, setStep]             = useState(1); // 1=form, 2=photos, 3=done
  const [geocoding, setGeocoding]   = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [createdId, setCreatedId]   = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }));

  const handleGeocode = async () => {
    if (!form.address && !form.city) return;
    setGeocoding(true);
    try {
      const coords = await geocodeAddress(form.address, form.city, form.state);
      if (coords) {
        setForm(f => ({ ...f, latitude: coords.lat.toFixed(6), longitude: coords.lng.toFixed(6) }));
      } else {
        setError('Could not auto-detect coordinates. Enter them manually.');
      }
    } catch { setError('Geocoding failed. Enter coordinates manually.'); }
    finally { setGeocoding(false); }
  };

  const createListing = useMutation({
    mutationFn: () => api.post('/listings', {
      ...form,
      price:     parseFloat(form.price),
      latitude:  form.latitude  ? parseFloat(form.latitude)  : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
    }),
    onSuccess: async ({ data }) => {
      setCreatedId(data.id);
      // Upload photos if any
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach(p => fd.append('photos', p));
        await api.post(`/upload/photos/${data.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {});
      }
      // Auto-approve if head_admin toggled it
      if (autoApprove && isHeadAdmin) {
        await api.post(`/admin/listings/${data.id}/approve`).catch(() => {});
      } else {
        // Submit for review
        await api.post(`/listings/${data.id}/submit`).catch(() => {});
      }
      qc.invalidateQueries(['my-listings']);
      setStep(3);
    },
    onError: (err) => setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create listing'),
  });

  const canSubmit = form.title && form.price && form.address && form.city;

  // ── Step 3: Done ─────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{autoApprove ? '🚀' : '🎉'}</div>
        <h2 className="font-display font-bold text-2xl text-cream mb-2">
          {autoApprove ? 'Listing is live!' : 'Listing created!'}
        </h2>
        <p className="text-muted mb-6">
          {autoApprove
            ? 'It\'s been approved and is now visible on the student platform.'
            : 'Submitted for review. It\'ll go live once approved.'}
        </p>
        {photos.length > 0 && (
          <p className="text-brand text-sm mb-6">✓ {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</p>
        )}
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={() => navigate('/my-listings')} className="btn-primary">
            View my listings
          </button>
          <button onClick={() => {
            setStep(1);
            setCreatedId(null);
            setForm({ title:'',description:'',price:'',price_period:'annually',address:'',city:'',state:'',latitude:'',longitude:'',type:'self_contain',bedrooms:1,bathrooms:1,amenities:[],youtube_url:'',whatsapp_number:'',instagram_url:'',is_vacant:true });
            setPhotos([]);
            setError('');
          }} className="btn-ghost">
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="font-display font-bold text-2xl text-cream mb-1">New Listing</h1>
      <p className="text-muted text-sm mb-6">
        Fill in the details. {isHeadAdmin ? 'You can approve immediately.' : 'Submit for review when ready.'}
      </p>

      <div className="space-y-5">

        {/* ── Basic Info ─── */}
        <div>
          <label className="text-xs text-muted block mb-1.5">Listing title *</label>
          <input className="input" placeholder="e.g. Cozy Self Contain near UniPort"
            value={form.title} onChange={e => set('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">Type *</label>
            <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Bedrooms</label>
            <input className="input" type="number" min="1" max="10"
              value={form.bedrooms} onChange={e => set('bedrooms', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Bathrooms</label>
            <input className="input" type="number" min="1" max="10"
              value={form.bathrooms} onChange={e => set('bathrooms', parseInt(e.target.value))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">Rent (₦) *</label>
            <input className="input" type="number" placeholder="350000"
              value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Period</label>
            <select className="input" value={form.price_period} onChange={e => set('price_period', e.target.value)}>
              <option value="annually">Per Year</option>
              <option value="monthly">Per Month</option>
            </select>
          </div>
        </div>

        {/* ── Location ─── */}
        <div className="p-4 rounded-xl border border-white/8 bg-white/2 space-y-3">
          <p className="text-xs font-semibold text-cream">📍 Location</p>

          <div>
            <label className="text-xs text-muted block mb-1.5">Street address *</label>
            <input className="input" placeholder="12 University Road"
              value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1.5">City *</label>
              <input className="input" placeholder="Port Harcourt"
                value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">State</label>
              <input className="input" placeholder="Rivers"
                value={form.state} onChange={e => set('state', e.target.value)} />
            </div>
          </div>

          {/* Coordinates — auto-fill or manual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1.5">Latitude</label>
              <input className="input" placeholder="e.g. 4.8156" type="number" step="any"
                value={form.latitude} onChange={e => set('latitude', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Longitude</label>
              <input className="input" placeholder="e.g. 7.0498" type="number" step="any"
                value={form.longitude} onChange={e => set('longitude', e.target.value)} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGeocode}
            disabled={geocoding || (!form.address && !form.city)}
            className="btn-ghost text-sm py-1.5 px-4 w-full"
          >
            {geocoding ? '🔍 Detecting coordinates…' : '🗺 Auto-detect from address'}
          </button>
          {form.latitude && form.longitude && (
            <p className="text-success text-xs text-center">✓ Map pin set: {form.latitude}, {form.longitude}</p>
          )}
        </div>

        {/* ── Amenities ─── */}
        <div>
          <label className="text-xs text-muted block mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`badge border cursor-pointer transition-colors ${
                  form.amenities.includes(a)
                    ? 'bg-brand/15 text-brand border-brand/30'
                    : 'bg-white/5 text-muted border-white/10'
                }`}>
                {a.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* ── Media ─── */}
        <div>
          <label className="text-xs text-muted block mb-1.5">🎥 YouTube Tour URL</label>
          <input className="input" placeholder="https://youtu.be/..."
            value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">💬 WhatsApp number</label>
          <input className="input" placeholder="+2348012345678"
            value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">Photos (up to 10)</label>
          <input type="file" multiple accept="image/*" onChange={e => setPhotos(Array.from(e.target.files).slice(0, 10))}
            className="text-sm text-muted file:btn-ghost file:mr-3 file:text-xs file:cursor-pointer" />
          {photos.length > 0 && (
            <p className="text-brand text-xs mt-1">✓ {photos.length} photo{photos.length > 1 ? 's' : ''} selected</p>
          )}
          {photos.length === 0 && (
            <p className="text-muted text-xs mt-1">Listings with photos get 10× more views</p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">Description</label>
          <textarea className="input min-h-[100px] resize-none"
            placeholder="Describe the property — size, condition, nearby landmarks, transport links…"
            value={form.description} onChange={e => set('description', e.target.value)} />
          <p className="text-muted text-xs mt-1">{form.description.length} chars (120+ recommended)</p>
        </div>

        {/* ── Vacancy toggle ─── */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/2">
          <div className="flex-1">
            <p className="text-cream text-sm font-medium">Room is currently vacant</p>
            <p className="text-muted text-xs mt-0.5">Vacant rooms appear first in search results</p>
          </div>
          <button
            type="button"
            onClick={() => set('is_vacant', !form.is_vacant)}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.is_vacant ? 'bg-brand' : 'bg-white/15'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_vacant ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* ── Head Admin: instant approve ─── */}
        {isHeadAdmin && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${autoApprove ? 'border-brand/40 bg-brand/8' : 'border-white/8 bg-white/2'}`}
            onClick={() => setAutoApprove(v => !v)}
          >
            <div className="flex-1">
              <p className="text-cream text-sm font-medium">🚀 Approve immediately</p>
              <p className="text-muted text-xs mt-0.5">Listing goes live the moment you save. Skip the review queue.</p>
            </div>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${autoApprove ? 'bg-brand border-brand' : 'border-white/30'}`}>
              {autoApprove && <span className="text-navy text-xs font-bold">✓</span>}
            </div>
          </div>
        )}

        {error && (
          <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          onClick={() => createListing.mutate()}
          disabled={createListing.isPending || !canSubmit}
          className="btn-primary w-full"
        >
          {createListing.isPending
            ? (photos.length > 0 ? 'Uploading photos…' : 'Saving…')
            : autoApprove
              ? '🚀 Save & Publish'
              : 'Save & Submit for Review'}
        </button>

        {!canSubmit && (
          <p className="text-muted text-xs text-center">Fill in title, price, address and city to continue</p>
        )}
      </div>
    </div>
  );
}
