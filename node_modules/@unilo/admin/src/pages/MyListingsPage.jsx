import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

// Status badge helper
const STATUS_STYLES = {
  draft:    'bg-white/10 text-muted',
  pending:  'bg-warning/15 text-warning border border-warning/20',
  approved: 'bg-success/15 text-success border border-success/20',
  rejected: 'bg-danger/15 text-danger border border-danger/20',
};

export default function MyListingsPage() {
  const qc = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => api.get('/listings/my/all').then((r) => r.data),
  });

  const submitForReview = useMutation({
    mutationFn: (id) => api.post(`/listings/${id}/submit`),
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  });

  const toggleVacancy = useMutation({
    mutationFn: ({ id, is_vacant }) => api.patch(`/listings/${id}`, { is_vacant }),
    onSuccess: () => qc.invalidateQueries(['my-listings']),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-cream">My Listings</h1>
          <p className="text-muted text-sm">{listings?.length ?? 0} properties</p>
        </div>
        <Link to="/listing/new" className="btn-primary text-sm">
          + Add Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      ) : listings?.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-cream font-display font-semibold">No listings yet</p>
          <p className="text-muted text-sm mt-1 mb-5">Create your first property listing to get started.</p>
          <Link to="/listing/new" className="btn-primary">Add your first listing</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const cover = listing.photos?.[0]?.url;
            const price = new Intl.NumberFormat('en-NG', {
              style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
            }).format(listing.price);

            return (
              <div key={listing.id} className="card p-4 flex gap-4 items-center">
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                  {cover
                    ? <img src={cover} className="w-full h-full object-cover" alt={listing.title} />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold text-cream text-sm truncate">{listing.title}</h3>
                    <span className={`badge text-xs ${STATUS_STYLES[listing.status]}`}>
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-muted text-xs mt-0.5">{listing.city} · {price}/{listing.price_period === 'monthly' ? 'mo' : 'yr'}</p>
                  {listing.status === 'rejected' && listing.rejection_reason && (
                    <p className="text-danger text-xs mt-1">Rejected: {listing.rejection_reason}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {listing.status === 'draft' && (
                    <button
                      onClick={() => submitForReview.mutate(listing.id)}
                      disabled={submitForReview.isPending}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Submit
                    </button>
                  )}
                  {listing.status === 'approved' && (
                    <button
                      onClick={() => toggleVacancy.mutate({ id: listing.id, is_vacant: !listing.is_vacant })}
                      className={`badge border cursor-pointer text-xs px-3 py-1.5 ${
                        listing.is_vacant
                          ? 'bg-brand/10 text-brand border-brand/30'
                          : 'bg-white/5 text-muted border-white/20'
                      }`}
                    >
                      {listing.is_vacant ? '✓ Vacant' : '✗ Occupied'}
                    </button>
                  )}
                  <span className="text-muted text-xs text-center">
                    👁 {listing.view_count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
