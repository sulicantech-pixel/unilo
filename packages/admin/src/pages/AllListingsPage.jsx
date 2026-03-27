// AllListingsPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const STATUS_STYLES = {
  draft:    'bg-white/10 text-muted',
  pending:  'bg-warning/15 text-warning border border-warning/20',
  approved: 'bg-success/15 text-success border border-success/20',
  rejected: 'bg-danger/15 text-danger border border-danger/20',
};

export function AllListingsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['all-listings', status],
    queryFn: () => api.get(`/listings?status=${status}&limit=50`).then((r) => r.data),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/admin/listings/${id}`),
    onSuccess: () => qc.invalidateQueries(['all-listings']),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-cream">All Listings</h1>
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-muted text-xs">
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">City</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Views</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.listings?.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-cream font-medium truncate max-w-[200px]">{l.title}</td>
                  <td className="px-4 py-3 text-muted">{l.city}</td>
                  <td className="px-4 py-3 text-brand">
                    ₦{parseInt(l.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_STYLES[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{l.view_count}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { if (confirm('Delete this listing?')) remove.mutate(l.id); }}
                      className="text-danger text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// UsersPage.jsx
export function UsersPage() {
  const qc = useQueryClient();
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', role],
    queryFn: () => api.get(`/admin/users?role=${role}`).then((r) => r.data),
  });

  const toggleSuspend = useMutation({
    mutationFn: (id) => api.post(`/admin/users/${id}/suspend`),
    onSuccess: () => qc.invalidateQueries(['users']),
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-2xl text-cream">Users</h1>
        <select className="input w-40" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="viewer">Students</option>
          <option value="user_admin">Landlords</option>
          <option value="head_admin">Head Admins</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="card h-14 animate-pulse" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr className="text-muted text-xs">
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2">
                  <td className="px-4 py-3 text-cream font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-white/5 text-muted text-xs">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'head_admin' && (
                      <button
                        onClick={() => toggleSuspend.mutate(u.id)}
                        className={`text-xs hover:underline ${u.is_suspended ? 'text-success' : 'text-danger'}`}
                      >
                        {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// FinancePage.jsx
export function FinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['finance-detail'],
    queryFn: () => api.get('/admin/finance').then((r) => r.data),
  });

  const fmt = (v) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display font-bold text-2xl text-cream">Finance & Earnings</h1>

      {isLoading ? <div className="card h-40 animate-pulse" /> : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Gross Revenue',     value: fmt(data?.summary?.total_gross),       icon: '💰' },
              { label: 'Unilo Commission',  value: fmt(data?.summary?.total_commission),   icon: '📊' },
              { label: 'Landlord Payouts',  value: fmt(data?.summary?.total_payouts),      icon: '🏦' },
              { label: 'Transactions',      value: data?.summary?.transaction_count ?? 0,  icon: '🔁' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="stat-card">
                <span className="text-2xl">{icon}</span>
                <p className="font-display font-bold text-xl text-brand">{value}</p>
                <p className="text-muted text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h2 className="font-display font-semibold text-cream mb-4">Revenue by City</h2>
            <table className="w-full text-sm">
              <thead className="text-muted text-xs border-b border-white/10">
                <tr>
                  <th className="text-left pb-3">City</th>
                  <th className="text-right pb-3">Revenue</th>
                  <th className="text-right pb-3">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {data?.by_city?.map((c) => (
                  <tr key={c.city} className="border-b border-white/5">
                    <td className="py-2.5 text-cream">{c.city}</td>
                    <td className="py-2.5 text-right text-brand font-medium">{fmt(c.revenue)}</td>
                    <td className="py-2.5 text-right text-muted">{c.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// AnalyticsPage.jsx
export function AnalyticsPage() {
  const { data: traffic } = useQuery({
    queryKey: ['traffic-detail'],
    queryFn: () => api.get('/analytics/traffic?days=30').then((r) => r.data),
  });
  const { data: behaviour } = useQuery({
    queryKey: ['behaviour-detail'],
    queryFn: () => api.get('/analytics/behaviour').then((r) => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display font-bold text-2xl text-cream">Behaviour Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic sources */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-cream mb-4">Traffic Sources (30d)</h2>
          <div className="space-y-3">
            {traffic?.sources?.map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-cream text-sm w-24 capitalize">{s.source}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${Math.min((s.visits / (traffic.sources[0]?.visits || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-muted text-xs w-10 text-right">{s.visits}</span>
              </div>
            )) || <p className="text-muted text-sm">No data</p>}
          </div>
        </div>

        {/* Device types */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-cream mb-4">Device Types</h2>
          <div className="space-y-3">
            {behaviour?.devices?.map((d) => (
              <div key={d.device_type} className="flex items-center justify-between">
                <span className="text-cream text-sm capitalize">{d.device_type}</span>
                <span className="text-brand font-medium">{d.count}</span>
              </div>
            )) || <p className="text-muted text-sm">No data</p>}
          </div>
        </div>

        {/* Top cities */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-cream mb-4">Top Cities</h2>
          <div className="space-y-2">
            {behaviour?.top_cities?.map((c, i) => (
              <div key={c.city} className="flex items-center justify-between text-sm">
                <span className="text-muted">{i + 1}.</span>
                <span className="text-cream flex-1 ml-2">{c.city}</span>
                <span className="text-brand">{c.count}</span>
              </div>
            )) || <p className="text-muted text-sm">No data</p>}
          </div>
        </div>

        {/* Peak hours */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-cream mb-4">Peak Usage Hours</h2>
          <div className="flex items-end gap-1 h-24">
            {behaviour?.peak_hours?.map((h) => {
              const max = Math.max(...(behaviour.peak_hours.map((x) => parseInt(x.count))));
              const pct = max ? (parseInt(h.count) / max) * 100 : 0;
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-brand/30 rounded-sm" style={{ height: `${pct}%`, minHeight: 2 }}>
                    <div className="w-full h-full bg-brand/60 rounded-sm" />
                  </div>
                  {parseInt(h.hour) % 6 === 0 && (
                    <span className="text-muted text-[9px]">{h.hour}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top searches */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-cream mb-4">Top Search Terms</h2>
        <div className="space-y-2">
          {behaviour?.top_searches?.map((s) => (
            <div key={s.search_query} className="flex items-center justify-between text-sm">
              <span className="text-cream">{s.search_query}</span>
              <span className="badge bg-brand/10 text-brand">{s.count} searches</span>
            </div>
          )) || <p className="text-muted text-sm">No searches yet</p>}
        </div>
      </div>
    </div>
  );
}

export default AllListingsPage;
