import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export default function PendingListingsPage() {
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null); // { id, title }
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pending-listings'],
    queryFn: () => api.get('/admin/pending').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const approve = useMutation({
    mutationFn: (id) => api.post(`/admin/listings/${id}/approve`),
    onSuccess: () => qc.invalidateQueries(['pending-listings']),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/admin/listings/${id}/reject`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries(['pending-listings']);
      setRejectModal(null);
      setReason('');
    },
  });

  const listings = data || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-cream">Pending Approval</h1>
          <p className="text-muted text-sm">{listings.length} listing{listings.length !== 1 ? 's' : ''} awaiting review</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-cream font-display font-semibold">All clear!</p>
          <p className="text-muted text-sm mt-1">No listings awaiting approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const cover = listing.photos?.[0]?.url;
            const price = new Intl.NumberFormat('en-NG', {
              style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
            }).format(listing.price);

            return (
              <div key={listing.id} className="card p-0 overflow-hidden flex flex-col sm:flex-row">
                {/* Photo */}
                <div className="w-full sm:w-48 h-36 sm:h-auto bg-white/5 shrink-0">
                  {cover
                    ? <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                  }
                </div>

                {/* Details */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-cream">{listing.title}</h3>
                      <p className="text-muted text-sm mt-0.5">
                        📍 {listing.address}, {listing.city} · {price}/{listing.price_period === 'monthly' ? 'mo' : 'yr'}
                      </p>
                      <p className="text-muted text-xs mt-1">
                        By: <span className="text-cream">{listing.landlord?.business_name || listing.landlord?.name}</span>
                        {' · '}{listing.landlord?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="badge bg-warning/15 text-warning border border-warning/20">Pending</span>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-muted text-sm mt-3 line-clamp-2">{listing.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => approve.mutate(listing.id)}
                      disabled={approve.isPending}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ id: listing.id, title: listing.title })}
                      className="btn-danger text-sm py-2 px-4"
                    >
                      ✕ Reject
                    </button>
                    {listing.youtube_video_id && (
                      <a
                        href={`https://youtube.com/watch?v=${listing.youtube_video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-sm py-2 px-4"
                      >
                        ▶ Tour
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reject modal ─────────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="font-display font-semibold text-cream text-lg mb-1">Reject listing</h2>
            <p className="text-muted text-sm mb-4">"{rejectModal.title}"</p>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Reason for rejection (shown to landlord)…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => reject.mutate({ id: rejectModal.id, reason })}
                disabled={reject.isPending}
                className="btn-danger flex-1"
              >
                {reject.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button onClick={() => setRejectModal(null)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
