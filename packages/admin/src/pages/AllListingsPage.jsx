import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const STATUS_STYLES = {
  draft:    'bg-white/10 text-muted border-white/10',
  pending:  'bg-warning/15 text-warning border-warning/20',
  approved: 'bg-success/15 text-success border-success/20',
  rejected: 'bg-danger/15 text-danger border-danger/20',
};

const fmtPrice = (v) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(v || 0);

function ConvBadge({ views, saves }) {
  if (!views) return <span className="text-muted text-xs">—</span>;
  const rate = ((saves || 0) / views * 100).toFixed(1);
  const color = rate >= 25 ? 'text-success' : rate >= 10 ? 'text-warning' : 'text-danger';
  return <span className={`text-xs font-medium ${color}`}>{rate}%</span>;
}

export default function AllListingsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // table | cards

  const { data, isLoading } = useQuery({
    queryKey: ['all-listings', status],
    queryFn: () => api.get(`/listings?status=${status}&limit=100`).then((r) => r.data),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/admin/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['all-listings']);
      setDeleteConfirm(null);
    },
  });

  const approve = useMutation({
    mutationFn: (id) => api.post(`/admin/listings/${id}/approve`),
    onSuccess: () => qc.invalidateQueries(['all-listings']),
  });

  const listings = (data?.listings || [])
    .filter((l) =>
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'views') return (b.view_count || 0) - (a.view_count || 0);
      if (sortBy === 'price') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'conv') {
        const ra = a.view_count ? (a.save_count || 0) / a.view_count : 0;
        const rb = b.view_count ? (b.save_count || 0) / b.view_count : 0;
        return rb - ra;
      }
      return 0;
    });

  // Summary stats
  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === 'approved').length,
    pending: listings.filter((l) => l.status === 'pending').length,
    totalViews: listings.reduce((a, l) => a + (l.view_count || 0), 0),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-cream">All Listings</h1>
          <p className="text-muted text-sm">{stats.total} listings · {stats.approved} live · {stats.pending} pending</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-cream' },
          { label: 'Live', value: stats.approved, color: 'text-success' },
          { label: 'Pending', value: stats.pending, color: 'text-warning' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'text-brand' },
        ].map((s) => (
          <div key={s.label} className="card p-3">
            <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
            <p className="text-muted text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            className="input pl-9 text-sm"
            placeholder="Search title or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status filter */}
        <select className="input w-36 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>

        {/* Sort */}
        <select className="input w-36 text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created">Newest first</option>
          <option value="views">Most viewed</option>
          <option value="price">Highest price</option>
          <option value="conv">Best conversion</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${viewMode === 'table' ? 'bg-brand text-navy font-medium' : 'text-muted hover:text-cream'}`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${viewMode === 'cards' ? 'bg-brand text-navy font-medium' : 'text-muted hover:text-cream'}`}
          >
            Cards
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-14 animate-pulse" />)}
        </div>
      ) : viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-muted text-[10px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Listing</th>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Views</th>
                  <th className="text-right px-4 py-3">Saves</th>
                  <th className="text-right px-4 py-3">Conv.</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          {l.photos?.[0]?.url
                            ? <img src={l.photos[0].url} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center text-sm">🏠</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-cream font-medium truncate max-w-[180px] text-xs">{l.title}</p>
                          <p className="text-muted text-[10px] capitalize">{l.type?.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">{l.city}</td>
                    <td className="px-4 py-3 text-brand font-medium text-xs text-right">
                      ₦{parseInt(l.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] border ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs text-right">{(l.view_count || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted text-xs text-right">{(l.save_count || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <ConvBadge views={l.view_count} saves={l.save_count} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        {l.status === 'pending' && (
                          <button
                            onClick={() => approve.mutate(l.id)}
                            className="text-success text-xs hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(l)}
                          className="text-danger text-xs hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {listings.length === 0 && (
            <div className="p-12 text-center text-muted text-sm">No listings found</div>
          )}
        </div>
      ) : (
        // Cards view
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="card overflow-hidden">
              <div className="h-36 bg-white/5 relative">
                {l.photos?.[0]?.url
                  ? <img src={l.photos[0].url} className="w-full h-full object-cover" alt={l.title} />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                }
                <span className={`absolute top-2 right-2 badge text-[10px] border ${STATUS_STYLES[l.status]}`}>
                  {l.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-cream text-sm font-display font-semibold truncate">{l.title}</h3>
                <p className="text-muted text-xs mt-0.5">{l.city} · ₦{parseInt(l.price).toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted">
                  <span>👁 {l.view_count || 0}</span>
                  <span>❤️ {l.save_count || 0}</span>
                  <span>💬 {l.contact_count || 0}</span>
                  <span className="ml-auto">
                    <ConvBadge views={l.view_count} saves={l.save_count} />
                  </span>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
                  {l.status === 'pending' && (
                    <button
                      onClick={() => approve.mutate(l.id)}
                      className="btn-primary text-xs py-1.5 flex-1"
                    >
                      ✓ Approve
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(l)}
                    className="btn-danger text-xs py-1.5 flex-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm">
            <h2 className="font-display font-semibold text-cream text-lg mb-1">Delete listing?</h2>
            <p className="text-muted text-sm mb-1">"{deleteConfirm.title}"</p>
            <p className="text-danger text-xs mb-5">This cannot be undone. All views, saves, and data will be lost.</p>
            <div className="flex gap-3">
              <button
                onClick={() => remove.mutate(deleteConfirm.id)}
                disabled={remove.isPending}
                className="btn-danger flex-1"
              >
                {remove.isPending ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
