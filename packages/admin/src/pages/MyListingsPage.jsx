import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const fmtPrice = (v, period) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(v) + (period === 'monthly' ? '/mo' : '/yr');

const TYPES = ['self_contain', 'room_and_parlour', 'flat', 'bungalow', 'duplex', 'hostel'];
const AMENITIES = ['wifi', 'generator', 'water', 'security', 'parking', 'kitchen', 'furnished', 'air_conditioning', 'cctv'];

const STATUS_STYLES = {
  draft:    'bg-white/10 text-muted border-white/10',
  pending:  'bg-warning/15 text-warning border-warning/20',
  approved: 'bg-success/15 text-success border-success/20',
  rejected: 'bg-danger/15 text-danger border-danger/20',
};

function computeQuality(listing) {
  const photoCount = listing.photos?.length || 0;
  return Math.min(100, Math.round(
    (photoCount >= 5 ? 25 : photoCount * 5) +
    (listing.youtube_video_id ? 20 : 0) +
    ((listing.description?.length || 0) >= 120 ? 15 : Math.min(15, Math.round((listing.description?.length || 0) / 8))) +
    (listing.whatsapp_number ? 15 : 0) +
    ((listing.amenities?.length || 0) >= 4 ? 15 : (listing.amenities?.length || 0) * 3.5) +
    10
  ));
}

function QualityRing({ score }) {
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F4A944' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 80 ? 'Great' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
          <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${(score / 100) * 87.96} 87.96`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function CompetitiveRank({ listing, quality }) {
  const issues = [];
  const photoCount = listing.photos?.length || 0;
  if (photoCount < 4) issues.push(`Only ${photoCount} photo${photoCount !== 1 ? 's' : ''} (need 4+ for top rank)`);
  if (!listing.youtube_video_id) issues.push('No video tour (listings with video get 2.3× more saves)');
  if ((listing.description?.length || 0) < 120) issues.push('Description too short (write 120+ chars to rank higher)');
  if (!listing.whatsapp_number) issues.push('No WhatsApp number (reduces direct contacts)');
  if ((listing.amenities?.length || 0) < 4) issues.push(`Only ${listing.amenities?.length || 0} amenities listed (add more to match competition)`);

  const rank = issues.length === 0 ? 'Top 10%' : issues.length === 1 ? 'Top 25%' : issues.length <= 3 ? 'Mid-tier' : 'Bottom 30%';
  const rankColor = issues.length === 0 ? 'text-success' : issues.length <= 2 ? 'text-warning' : 'text-danger';

  return (
    <div className="p-4 rounded-xl bg-white/3 border border-white/8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-cream text-xs font-semibold">How this listing ranks</p>
        <span className={`text-xs font-bold ${rankColor}`}>{rank} in {listing.city}</span>
      </div>
      {issues.length === 0 ? (
        <p className="text-success text-xs">✓ This listing is fully optimised. It appears near the top of search results.</p>
      ) : (
        <div className="space-y-1.5">
          {issues.map((issue, i) => (
            <p key={i} className="text-muted text-xs flex items-start gap-1.5">
              <span className="text-warning mt-0.5 shrink-0">↑</span>
              {issue}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function EditPanel({ listing, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    title: listing.title || '',
    description: listing.description || '',
    price: listing.price || '',
    price_period: listing.price_period || 'annually',
    address: listing.address || '',
    city: listing.city || '',
    state: listing.state || '',
    type: listing.type || 'self_contain',
    bedrooms: listing.bedrooms || 1,
    bathrooms: listing.bathrooms || 1,
    amenities: listing.amenities || [],
    whatsapp_number: listing.whatsapp_number || '',
    youtube_url: listing.youtube_url || '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleAmenity = (a) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-navy-800 border border-white/10 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-navy-800 border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <h2 className="font-display font-semibold text-cream">Edit Listing</h2>
          <button onClick={onClose} className="text-muted hover:text-cream text-xl leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">Title</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1.5">Type</label>
              <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Beds</label>
              <input className="input" type="number" min="1" max="10" value={form.bedrooms} onChange={(e) => set('bedrooms', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">Baths</label>
              <input className="input" type="number" min="1" max="10" value={form.bathrooms} onChange={(e) => set('bathrooms', parseInt(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1.5">Rent (₦)</label>
              <input className="input" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
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
            <label className="text-xs text-muted block mb-1.5">Street address</label>
            <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1.5">City</label>
              <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">State</label>
              <input className="input" value={form.state} onChange={(e) => set('state', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">💬 WhatsApp number</label>
            <input className="input" placeholder="+2348012345678" value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">🎥 YouTube tour URL</label>
            <input className="input" placeholder="https://youtu.be/…" value={form.youtube_url} onChange={(e) => set('youtube_url', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`badge border cursor-pointer text-xs transition-colors ${
                    form.amenities.includes(a) ? 'bg-brand/15 text-brand border-brand/30' : 'bg-white/5 text-muted border-white/10'
                  }`}>
                  {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Description</label>
            <textarea className="input min-h-[100px] resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} />
            <p className="text-muted text-[10px] mt-1">{form.description.length} chars (120+ recommended)</p>
          </div>
        </div>
        <div className="sticky bottom-0 bg-navy-800 border-t border-white/10 px-5 py-4 flex gap-3">
          <button onClick={() => onSave(form)} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PhotoUploadPanel({ listing, onClose, onUpload, uploading }) {
  const [files, setFiles] = useState([]);
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-sm">
        <h2 className="font-display font-semibold text-cream text-lg mb-1">Add Photos</h2>
        <p className="text-muted text-sm mb-4">
          "{listing.title}" · currently {listing.photos?.length || 0} photo{listing.photos?.length !== 1 ? 's' : ''}
        </p>
        <input
          type="file" multiple accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          className="text-sm text-muted file:btn-ghost file:mr-3 file:text-xs file:cursor-pointer mb-3 w-full"
        />
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {files.slice(0, 6).map((f, i) => (
              <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => onUpload(files)} disabled={files.length === 0 || uploading} className="btn-primary flex-1">
            {uploading ? 'Uploading…' : `Upload ${files.length || 0} photo${files.length !== 1 ? 's' : ''}`}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const qc = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const quality = computeQuality(listing);
  const cover = listing.photos?.[0]?.url;

  const updateListing = useMutation({
    mutationFn: (form) => api.patch(`/listings/${listing.id}`, form),
    onSuccess: () => { qc.invalidateQueries(['my-listings']); setShowEdit(false); },
  });

  const uploadPhotos = useMutation({
    mutationFn: async (files) => {
      const fd = new FormData();
      files.forEach((f) => fd.append('photos', f));
      return api.post(`/upload/photos/${listing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => { qc.invalidateQueries(['my-listings']); setShowPhotos(false); },
  });

  const submitForReview = useMutation({
    mutationFn: () => api.post(`/listings/${listing.id}/submit`),
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  });

  const toggleVacancy = useMutation({
    mutationFn: () => api.patch(`/listings/${listing.id}`, { is_vacant: !listing.is_vacant }),
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  });

  const requestReReview = useMutation({
    mutationFn: () => api.post(`/listings/${listing.id}/submit`),
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  });

  const convRate = listing.view_count > 0
    ? ((listing.save_count || 0) / listing.view_count * 100).toFixed(1)
    : '0.0';

  return (
    <>
      <div className="card overflow-hidden">
        <div className="flex gap-4 p-4">
          <div className="w-24 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
            {cover
              ? <img src={cover} className="w-full h-full object-cover" alt={listing.title} />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
            }
            {listing.status === 'approved' && !listing.is_vacant && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-[9px] font-bold text-white bg-danger/70 px-1.5 py-0.5 rounded-full">OCCUPIED</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 justify-between">
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-cream text-sm leading-tight truncate">{listing.title}</h3>
                <p className="text-muted text-xs mt-0.5">{listing.city} · {fmtPrice(listing.price, listing.price_period)}</p>
              </div>
              <span className={`badge text-[10px] border shrink-0 ${STATUS_STYLES[listing.status]}`}>{listing.status}</span>
            </div>

            <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs text-muted">
              <span>👁 <span className="text-cream">{listing.view_count || 0}</span> views</span>
              <span>❤️ <span className="text-cream">{listing.save_count || 0}</span> saves</span>
              <span>💬 <span className="text-cream">{listing.contact_count || 0}</span> contacts</span>
              <span>🔄 <span className={`font-medium ${parseFloat(convRate) >= 20 ? 'text-success' : 'text-warning'}`}>{convRate}%</span> save rate</span>
            </div>

            {listing.status === 'rejected' && listing.rejection_reason && (
              <div className="mt-2 p-2 rounded-lg bg-danger/8 border border-danger/15">
                <p className="text-danger text-xs"><strong>Rejected:</strong> {listing.rejection_reason}</p>
              </div>
            )}
          </div>

          <div className="shrink-0">
            <QualityRing score={quality} />
          </div>
        </div>

        {expanded && (
          <div className="border-t border-white/8 p-4 bg-white/2 space-y-3">
            <CompetitiveRank listing={listing} quality={quality} />
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/8">
              <div>
                <p className="text-cream text-xs font-medium">{listing.photos?.length || 0} photos uploaded</p>
                <p className="text-muted text-[10px]">Listings with 5+ photos get 40% more views</p>
              </div>
              <button onClick={() => setShowPhotos(true)} className="btn-ghost text-xs py-1.5 px-3">+ Add photos</button>
            </div>
          </div>
        )}

        <div className="border-t border-white/8 px-4 py-2.5 flex items-center gap-2 flex-wrap bg-white/1">
          <button onClick={() => setShowEdit(true)} className="btn-ghost text-xs py-1.5 px-3">✏️ Edit</button>

          {listing.status === 'draft' && (
            <button onClick={() => submitForReview.mutate()} disabled={submitForReview.isPending} className="btn-primary text-xs py-1.5 px-4">
              {submitForReview.isPending ? 'Submitting…' : 'Submit for review'}
            </button>
          )}

          {listing.status === 'rejected' && (
            <button onClick={() => requestReReview.mutate()} disabled={requestReReview.isPending} className="btn-primary text-xs py-1.5 px-4">
              {requestReReview.isPending ? 'Requesting…' : '↺ Request re-review'}
            </button>
          )}

          {listing.status === 'approved' && (
            <>
              <button onClick={() => setShowPhotos(true)} className="btn-ghost text-xs py-1.5 px-3">📷 Photos</button>
              <button
                onClick={() => toggleVacancy.mutate()}
                disabled={toggleVacancy.isPending}
                className={`text-xs py-1.5 px-3 rounded-xl border font-medium transition-colors ${
                  listing.is_vacant
                    ? 'bg-brand/10 text-brand border-brand/30'
                    : 'bg-white/5 text-muted border-white/15'
                }`}
              >
                {listing.is_vacant ? '✓ Vacant' : 'Mark vacant'}
              </button>
            </>
          )}

          <button onClick={() => setExpanded((v) => !v)} className="ml-auto text-muted text-[10px] hover:text-cream transition-colors">
            {expanded ? '▲ Less' : '▼ Performance & rank'}
          </button>
        </div>
      </div>

      {showEdit && <EditPanel listing={listing} onClose={() => setShowEdit(false)} onSave={updateListing.mutate} saving={updateListing.isPending} />}
      {showPhotos && <PhotoUploadPanel listing={listing} onClose={() => setShowPhotos(false)} onUpload={uploadPhotos.mutate} uploading={uploadPhotos.isPending} />}
    </>
  );
}

export default function MyListingsPage() {
  const [filter, setFilter] = useState('all');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => api.get('/listings/my/all').then((r) => r.data),
  });

  const filtered = (listings || []).filter((l) => filter === 'all' || l.status === filter);

  const totalViews    = (listings || []).reduce((a, l) => a + (l.view_count || 0), 0);
  const totalSaves    = (listings || []).reduce((a, l) => a + (l.save_count || 0), 0);
  const totalContacts = (listings || []).reduce((a, l) => a + (l.contact_count || 0), 0);
  const approved      = (listings || []).filter((l) => l.status === 'approved').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-cream">My Listings</h1>
          <p className="text-muted text-sm">{listings?.length ?? 0} properties · {approved} live</p>
        </div>
        <Link to="/listing/new" className="btn-primary text-sm">+ Add Listing</Link>
      </div>

      {(listings?.length || 0) > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Views',    value: totalViews.toLocaleString(),    icon: '👁',  color: 'text-muted' },
            { label: 'Total Saves',    value: totalSaves.toLocaleString(),    icon: '❤️', color: 'text-gold' },
            { label: 'Total Contacts', value: totalContacts.toLocaleString(), icon: '💬', color: 'text-brand' },
          ].map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
                <p className="text-muted text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {(listings?.length || 0) > 0 && (
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-5 w-fit">
          {['all', 'approved', 'pending', 'draft', 'rejected'].map((s) => {
            const count = s === 'all' ? listings?.length : listings?.filter((l) => l.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === s ? 'bg-brand text-white' : 'text-muted hover:text-cream'
                }`}
              >
                {s} {count > 0 && <span className="opacity-70 ml-1">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-36 animate-pulse" />)}</div>
      ) : (listings?.length || 0) === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-cream font-display font-semibold">No listings yet</p>
          <p className="text-muted text-sm mt-1 mb-5">Create your first property listing to get started.</p>
          <Link to="/listing/new" className="btn-primary">Add your first listing</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center"><p className="text-muted">No {filter} listings</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      )}
    </div>
  );
}
