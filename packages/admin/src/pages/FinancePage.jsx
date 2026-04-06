import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import api from '../lib/api';

const fmt = (v) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(v || 0);

const fmtK = (v) => v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`;

function Skeleton({ className }) {
  return <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />;
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card">
      <p className="text-muted text-xs uppercase tracking-wide font-medium">{label}</p>
      <p className={`font-display font-bold text-2xl mt-1 ${color || 'text-cream'}`}>{value}</p>
      {sub && <p className="text-muted text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

const MOCK_MONTHLY = [
  { month: 'Oct', revenue:       0, projected:  80000 },
  { month: 'Nov', revenue:       0, projected: 150000 },
  { month: 'Dec', revenue:   85000, projected: 200000 },
  { month: 'Jan', revenue:  220000, projected: 280000 },
  { month: 'Feb', revenue:  310000, projected: 350000 },
  { month: 'Mar', revenue:  480000, projected: null   },
  { month: 'Apr', revenue:    null, projected: 620000 },
  { month: 'May', revenue:    null, projected: 780000 },
  { month: 'Jun', revenue:    null, projected: 960000 },
];

const MOCK_CITIES = [
  { city: 'Port Harcourt', revenue: 680000, bookings: 8 },
  { city: 'Lagos',         revenue: 280000, bookings: 3 },
  { city: 'Ibadan',        revenue: 130000, bookings: 1 },
  { city: 'Nsukka',        revenue:       0, bookings: 0 },
  { city: 'Ile-Ife',       revenue:       0, bookings: 0 },
];

const MOCK_SUMMARY = {
  total_gross:      1090000,
  total_commission:   54500,
  total_payouts:    1035500,
  transaction_count:      12,
};

export default function FinancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['finance-detail'],
    queryFn: () => api.get('/admin/finance').then((r) => r.data).catch(() => null),
  });

  const summary  = data?.summary  || MOCK_SUMMARY;
  const byCity   = data?.by_city  || MOCK_CITIES;
  const monthly  = data?.monthly?.map((m) => ({
    month:     new Date(m.month).toLocaleString('default', { month: 'short' }),
    revenue:   parseFloat(m.revenue),
    projected: null,
  })) || MOCK_MONTHLY;

  const maxCity = Math.max(...byCity.map((c) => parseFloat(c.revenue)));

  const chartStyle = {
    contentStyle: { background: '#0f2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 },
    labelStyle:   { color: '#F5F0E8', fontSize: 11 },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-cream">Finance & Earnings</h1>
        <p className="text-muted text-sm mt-1">All-time revenue · commission · payouts</p>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Gross Revenue"    value={fmt(summary.total_gross)}       color="text-cream" />
          <StatCard label="Unilo Commission" value={fmt(summary.total_commission)}  color="text-brand" sub="5% of gross" />
          <StatCard label="Landlord Payouts" value={fmt(summary.total_payouts)}     color="text-gold"  />
          <StatCard label="Transactions"     value={summary.transaction_count ?? 0} color="text-cream" sub="completed" />
        </div>
      )}

      {/* Revenue chart */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-cream">Revenue pipeline</h2>
            <p className="text-muted text-xs">Actual (teal) + projected (dotted gold)</p>
          </div>
          <span className="text-brand font-display font-bold">
            {fmt(monthly.reduce((a, m) => a + (m.revenue || 0), 0))} YTD
          </span>
        </div>
        {isLoading ? <Skeleton className="h-48" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00C2A8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00C2A8" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="proG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#F4A944" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#F4A944" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#8A9BB0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A9BB0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={48} />
              <Tooltip {...chartStyle} formatter={(v, name) => [fmt(v), name === 'revenue' ? 'Actual' : 'Projected']} />
              <Area type="monotone" dataKey="revenue"   stroke="#00C2A8" strokeWidth={2}   fill="url(#revG)" dot={false} connectNulls={false} />
              <Area type="monotone" dataKey="projected" stroke="#F4A944" strokeWidth={1.5} fill="url(#proG)" strokeDasharray="4 3" dot={false} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue by city */}
      <div className="card p-5">
        <h2 className="font-display font-bold text-cream mb-4">Revenue by city</h2>
        {isLoading ? <Skeleton className="h-48" /> : (
          <>
            <div className="space-y-3 mb-5">
              {byCity.map((c) => {
                const pct = maxCity ? (parseFloat(c.revenue) / maxCity) * 100 : 0;
                return (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className="text-cream text-xs font-medium w-28 shrink-0">{c.city}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: pct > 0 ? '#00C2A8' : 'transparent' }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-20 text-right shrink-0 ${parseFloat(c.revenue) > 0 ? 'text-brand' : 'text-muted'}`}>
                      {parseFloat(c.revenue) > 0 ? fmt(c.revenue) : '₦0'}
                    </span>
                    <span className="text-muted text-xs w-16 text-right shrink-0">
                      {c.bookings} booking{c.bookings !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Insight */}
            {byCity.filter((c) => parseFloat(c.revenue) === 0).length > 0 && (
              <div className="p-3 rounded-xl bg-warning/8 border border-warning/15">
                <p className="text-warning text-xs font-medium">
                  ⚠ {byCity.filter((c) => parseFloat(c.revenue) === 0).map((c) => c.city).join(', ')} have{' '}
                  zero revenue. These cities have search demand but no completed transactions — they need listings first.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction table */}
      <div className="card p-5">
        <h2 className="font-display font-bold text-cream mb-4">Recent transactions</h2>
        {isLoading ? (
          <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : summary.transaction_count === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted text-sm">No transactions yet. Revenue will appear here once students complete bookings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-muted text-[10px] uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Listing</th>
                  <th className="text-left px-3 py-2">City</th>
                  <th className="text-right px-3 py-2">Gross</th>
                  <th className="text-right px-3 py-2">Commission</th>
                  <th className="text-right px-3 py-2">Payout</th>
                  <th className="text-left px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td colSpan={6} className="px-3 py-4 text-center text-muted text-xs">
                    Transactions will populate here from live data
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
