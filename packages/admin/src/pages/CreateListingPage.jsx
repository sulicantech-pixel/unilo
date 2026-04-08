import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const TYPES = ['self_contain', 'room_and_parlour', 'flat', 'bungalow', 'duplex', 'hostel'];
const AMENITIES = ['wifi', 'generator', 'water', 'security', 'parking', 'kitchen', 'furnished', 'air_conditioning', 'cctv'];

export default function CreateListingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: '', description: '', price: '', price_period: 'annually',
    address: '', city: '', state: '',
    type: 'self_contain', bedrooms: 1, bathrooms: 1,
    amenities: [],
    youtube_url: '', whatsapp_number: '', instagram_url: '',
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const createListing = useMutation({
    mutationFn: () => api.post('/listings', { ...form, price: parseFloat(form.price) }),
    onSuccess: async ({ data }) => {
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((p) => fd.append('photos', p));
        await api.post(`/upload/photos/${data.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      qc.invalidateQueries(['my-listings']);
      setStep(3);
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to create listing'),
  });

  const handlePhotoChange = (e) => setPhotos(Array.from(e.target.files).slice(0, 10));

  if (step === 3) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="font-display font-bold text-2xl text-cream mb-2">Listing created!</h2>
        <p className="text-muted mb-6">It's been saved as a draft. Submit it for review when ready.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/my-listings')} className="btn-primary">View my listings</button>
          <button onClick={() => {
            setStep(1);
            setForm({ title:'',description:'',price:'',price_period:'annually',address:'',city:'',state:'',type:'self_contain',bedrooms:1,bathrooms:1,amenities:[],youtube_url:'',whatsapp_number:'',instagram_url:'' });
            setPhotos([]);
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
      <p className="text-muted text-sm mb-6">Fill in the details. Save as draft and submit when ready.</p>

      <div className="space-y-5">
        <div>
          <label className="text-xs text-muted block mb-1.5">Listing title *</label>
          <input className="input" placeholder="e.g. Cozy Self Contain near UniPort" value={form.title}
            onChange={(e) => set('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">Type *</label>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Bedrooms</label>
            <input className="input" type="number" min="1" max="10" value={form.bedrooms}
              onChange={(e) => set('bedrooms', parseInt(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Bathrooms</label>
            <input className="input" type="number" min="1" max="10" value={form.bathrooms}
              onChange={(e) => set('bathrooms', parseInt(e.target.value))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">Rent (₦) *</label>
            <input className="input" type="number" placeholder="350000" value={form.price}
              onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Period</label>
            <select className="input" value={form.price_period} onChange={(e) => set('price_period', e.target.value)}>
              <option value="annually">Per Year</option>
              <option value="monthly">Per Month</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">Street address *</label>
          <input className="input" placeholder="12 University Road" value={form.address}
            onChange={(e) => set('address', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">City *</label>
            <input className="input" placeholder="Port Harcourt" value={form.city}
              onChange={(e) => set('city', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">State *</label>
            <input className="input" placeholder="Rivers" value={form.state}
              onChange={(e) => set('state', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted block mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className={`badge border cursor-pointer transition-colors ${
                  form.amenities.includes(a) ? 'bg-brand/15 text-brand border-brand/30' : 'bg-white/5 text-muted border-white/10'
                }`}>
                {a.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">🎥 YouTube Tour URL</label>
          <input className="input" placeholder="https://youtu.be/..." value={form.youtube_url}
            onChange={(e) => set('youtube_url', e.target.value)} />
          <p className="text-muted text-xs mt-1">Paste your YouTube link — we'll embed it automatically</p>
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">💬 WhatsApp number</label>
          <input className="input" placeholder="+2348012345678" value={form.whatsapp_number}
            onChange={(e) => set('whatsapp_number', e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">Photos (up to 10)</label>
          <input type="file" multiple accept="image/*" onChange={handlePhotoChange}
            className="text-sm text-muted file:btn-ghost file:mr-3 file:text-xs file:cursor-pointer" />
          {photos.length > 0 && (
            <p className="text-brand text-xs mt-1">{photos.length} photo{photos.length > 1 ? 's' : ''} selected</p>
          )}
        </div>

        <div>
          <label className="text-xs text-muted block mb-1.5">Description</label>
          <textarea className="input min-h-[100px] resize-none" placeholder="Describe the property…"
            value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        {error && <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</p>}

        <button
          onClick={() => createListing.mutate()}
          disabled={createListing.isPending || !form.title || !form.price || !form.address || !form.city}
          className="btn-primary w-full"
        >
          {createListing.isPending ? 'Saving…' : 'Save as draft'}
        </button>
      </div>
    </div>
  );
}
