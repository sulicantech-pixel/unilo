import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (v, period) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(v) + (period === 'monthly' ? '/mo' : '/yr');

const AMENITY_ICONS = {
  wifi: '📶', generator: '⚡', water: '💧', security: '🔒',
  parking: '🚗', kitchen: '🍳', furnished: '🛋️', air_conditioning: '❄️', cctv: '📹',
};

// Quality flags — things Patrick needs to know before approving
function getFlags(listing) {
  const flags = [];
  const photoCount = listing.photos?.length || 0;
  if (photoCount === 0) flags.push({ type: 'error', text: 'No photos' });
  else if (photoCount < 3) flags.push({ type: 'warn', text: `Only ${photoCount} photo${photoCount > 1 ? 's' : ''}` });
  if (!listing.whatsapp_number) flags.push({ type: 'warn', text: 'No WhatsApp' });
  if (!listing.description || listing.description.length < 50) flags.push({ type: 'warn', text: 'Short description' });
  if (!listing.youtube_video_id) flags.push({ type: 'info', text: 'No video tour' });
  return flags;
}

// ── Quality Flags Bar ─────────────────────────────────────────────────────────
function FlagsBar({ flags }) {
  if (!flags.length) return (
    <span className="text-success text-xs flex items-center gap-1">
      <span>✓</span> All quality checks passed
    </span>
  );
  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((f, i) => (
        <span
          key={i}
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
            f.type === 'error' ? 'bg-danger/10 text-danger border-danger/20' :
            f.type === 'warn'  ? 'bg-warning/10 text-warning border-warning/20' :
            'bg-white/8 text-muted border-white/10'
          }`}
        >
          {f.type === 'error' ? '✕' : f.type === 'warn' ? '⚠' : 'ℹ'} {f.text}
        </span>
      ))}
    </div>
  );
}

// ── Photo Strip ───────────────────────────────────────────────────────────────
function PhotoStrip({ photos }) {
  const [active, setActive] = useState(0);
  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-48 bg-white/4 rounded-xl flex items-center justify-center border border-white/8">
        <div className="text-center">
          <span className="text-4xl block mb-1">📷</span>
          <p className="text-muted text-xs">No photos uploaded</p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white/4">
        <img
          src={photos[active]?.url}
          alt="listing"
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
          {active + 1} / {photos.length}
        </span>
      </div>
      {photos.length > 1 && (
        <div className="flex gap-1.5 mt-2">
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                i === active ? 'border-brand' : 'border-transparent'
              }`}
            >
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
const QUICK_REASONS = [
  'Photos are too dark or low quality',
  'Price is unrealistically high for the area',
  'Address is incomplete or unverifiable',
  'Description contains false information',
  'WhatsApp number is invalid or missing',
  'Duplicate listing already exists',
];

function RejectModal({ listing, onConfirm, onClose, isPending }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-md">
        <h2 className="font-display font-semibold text-cream text-lg mb-0.5">Reject listing</h2>
        <p className="text-muted text-sm mb-4 truncate">"{listing.title}"</p>

        <p className="text-muted text-xs mb-2">Quick reasons:</p>
        <div className="space-y-1.5 mb-3">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-colors ${
                reason === r
                  ? 'bg-danger/10 text-danger border-danger/25'
                  : 'bg-white/3 text-muted border-white/8 hover:border-white/20 hover:text-cream'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          className="input min-h-[80px] resize-none text-sm"
          placeholder="Or write a custom reason…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || !reason.trim()}
            className="btn-danger flex-1"
          >
            {isPending ? 'Rejecting…' : 'Confirm Reject'}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Single Listing Review Card ─────────────────────────────────────────────────
function ReviewCard({ listing, selected, onSelect, onApprove, onReject, approving, batchMode }) {
  const flags = getFlags(listing);
  const hasErrors = flags.some((f) => f.type === 'error');
  const submittedAt = listing.updated_at
    ? new Date(listing.updated_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className={`card overflow-hidden transition-all ${selected ? 'ring-2 ring-brand' : ''}`}>
      {/* Card header */}
      <div className="flex items-start gap-3 p-4 border-b border-white/8">
        {batchMode && (
          <button
            onClick={() => onSelect(listing.id)}
            className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              selected ? 'bg-brand border-brand' : 'border-white/30 hover:border-brand'
            }`}
          >
            {selected && <span className="text-navy text-xs font-bold">✓</span>}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-cream leading-tight">{listing.title}</h3>
              <p className="text-muted text-xs mt-0.5">
                📍 {listing.address}, {listing.city} · {fmtPrice(listing.price, listing.price_period)}
              </p>
              <p className="text-muted text-xs mt-0.5">
                By: <span className="text-cream">{listing.landlord?.business_name || listing.landlord?.name}</span>
                {' '}· {listing.landlord?.email}
                {' '}· Submitted {submittedAt}
              </p>
            </div>
            <span className="badge bg-warning/15 text-warning border border-warning/20 text-[10px] shrink-0">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {/* Left: Photos */}
        <PhotoStrip photos={listing.photos} />

        {/* Right: Details */}
        <div className="space-y-3">
          {/* Property details */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Type', value: listing.type?.replace(/_/g, ' ') },
              { label: 'Beds', value: listing.bedrooms },
              { label: 'Baths', value: listing.bathrooms },
            ].map((d) => (
              <div key={d.label} className="bg-white/4 rounded-xl p-2.5 text-center border border-white/6">
                <p className="text-cream text-sm font-bold capitalize">{d.value}</p>
                <p className="text-muted text-[10px]">{d.label}</p>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.amenities.map((a) => (
                <span key={a} className="text-[10px] bg-white/5 text-muted px-2 py-0.5 rounded-full border border-white/8">
                  {AMENITY_ICONS[a] || ''} {a.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p className="text-muted text-xs leading-relaxed line-clamp-3">{listing.description}</p>
          )}

          {/* Video + WhatsApp */}
          <div className="flex gap-2">
            {listing.youtube_video_id && (
              <a
                href={`https://youtube.com/watch?v=${listing.youtube_video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand hover:underline flex items-center gap-1"
              >
                ▶ Video tour
              </a>
            )}
            {listing.whatsapp_number && (
              <a
                href={`https://wa.me/${listing.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-success hover:underline flex items-center gap-1"
              >
                💬 {listing.whatsapp_number}
              </a>
            )}
          </div>

          {/* Quality flags */}
          <FlagsBar flags={flags} />
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-white/8 bg-white/1">
        <button
          onClick={() => onApprove(listing.id)}
          disabled={approving || hasErrors}
          className="btn-primary text-sm py-2 flex-1"
          title={hasErrors ? 'Fix errors before approving' : 'Approve this listing'}
        >
          {approving ? 'Approving…' : '✓ Approve'}
        </button>
        <button
          onClick={() => onReject(listing)}
          className="btn-danger text-sm py-2 flex-1"
        >
          ✕ Reject
        </button>
        {hasErrors && (
          <span className="text-danger text-[10px] ml-1">
            Fix {flags.filter((f) => f.type === 'error').length} error{flags.filter((f) => f.type === 'error').length > 1 ? 's' : ''} first
          </span>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PendingListingsPage() {
  const qc = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [filter, setFilter] = useState('all'); // all | flags | clean

  const { data, isLoading } = useQuery({
    queryKey: ['pending-listings'],
    queryFn: () => api.get('/admin/pending').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const approve = useMutation({
    mutationFn: (id) => api.post(`/admin/listings/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries(['pending-listings']);
      setSelected((s) => { const n = new Set(s); n.delete(approve.variables); return n; });
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/admin/listings/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries(['pending-listings']);
      setRejectTarget(null);
    },
  });

  const batchApprove = useMutation({
    mutationFn: (ids) => Promise.all(ids.map((id) => api.post(`/admin/listings/${id}/approve`))),
    onSuccess: () => {
      qc.invalidateQueries(['pending-listings']);
      setSelected(new Set());
      setBatchMode(false);
    },
  });

  const toggleSelect = useCallback((id) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const listings = data || [];

  const filteredListings = listings.filter((l) => {
    if (filter === 'flags') return getFlags(l).length > 0;
    if (filter === 'clean') return getFlags(l).length === 0;
    return true;
  });

  const cleanCount  = listings.filter((l) => getFlags(l).length === 0).length;
  const flaggedCount = listings.filter((l) => getFlags(l).length > 0).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-cream">Pending Approval</h1>
          <p className="text-muted text-sm mt-0.5">
            {listings.length} listing{listings.length !== 1 ? 's' : ''} awaiting review
            {cleanCount > 0 && (
              <span className="text-success ml-2">· {cleanCount} ready to approve</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {batchMode && selected.size > 0 && (
            <button
              onClick={() => batchApprove.mutate([...selected])}
              disabled={batchApprove.isPending}
              className="btn-primary text-sm"
            >
              {batchApprove.isPending ? 'Approving…' : `✓ Approve ${selected.size} selected`}
            </button>
          )}
          <button
            onClick={() => { setBatchMode((v) => !v); setSelected(new Set()); }}
            className={`btn-ghost text-sm ${batchMode ? 'border-brand text-brand' : ''}`}
          >
            {batchMode ? 'Exit batch' : 'Batch mode'}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {listings.length > 0 && (
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-5 w-fit">
          {[
            { key: 'all', label: 'All', count: listings.length },
            { key: 'clean', label: '✓ Ready', count: cleanCount },
            { key: 'flags', label: '⚠ Has issues', count: flaggedCount },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === key ? 'bg-brand text-navy' : 'text-muted hover:text-cream'
              }`}
            >
              {label} <span className="ml-1 opacity-70">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Batch select all */}
      {batchMode && filteredListings.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/4 border border-white/10">
          <button
            onClick={() => {
              const cleanIds = filteredListings
                .filter((l) => getFlags(l).every((f) => f.type !== 'error'))
                .map((l) => l.id);
              setSelected(new Set(cleanIds));
            }}
            className="text-brand text-xs hover:underline"
          >
            Select all ready ({cleanCount})
          </button>
          <span className="text-muted text-xs">·</span>
          <button onClick={() => setSelected(new Set())} className="text-muted text-xs hover:text-cream">
            Clear selection
          </button>
          {selected.size > 0 && (
            <span className="text-cream text-xs ml-auto">{selected.size} selected</span>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-cream font-display font-semibold text-lg">Queue is clear!</p>
          <p className="text-muted text-sm mt-1">No listings awaiting approval. Check back later.</p>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-muted">No listings match this filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredListings.map((listing) => (
            <ReviewCard
              key={listing.id}
              listing={listing}
              selected={selected.has(listing.id)}
              onSelect={toggleSelect}
              onApprove={(id) => approve.mutate(id)}
              onReject={setRejectTarget}
              approving={approve.isPending && approve.variables === listing.id}
              batchMode={batchMode}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          listing={rejectTarget}
          onConfirm={(reason) => reject.mutate({ id: rejectTarget.id, reason })}
          onClose={() => setRejectTarget(null)}
          isPending={reject.isPending}
        />
      )}
    </div>
  );
}
