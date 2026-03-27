import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#00C2A8', '#F4A944', '#8A9BB0', '#3B82F6', '#EC4899'];

export default function DashboardPage() {
  const { data: finance } = useQuery({
    queryKey: ['finance'],
    queryFn: () => api.get('/admin/finance').then((r) => r.data),
  });

  const { data: traffic } = useQuery({
    queryKey: ['traffic'],
    queryFn: () => api.get('/analytics/traffic?days=30').then((r) => r.data),
  });

  const { data: behaviour } = useQuery({
    queryKey: ['behaviour'],
    queryFn: () => api.get('/analytics/behaviour').then((r) => r.data),
  });

  const formatNGN = (v) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(v || 0);

  const monthlyData = finance?.monthly?.map((m) => ({
    month: new Date(m.month).toLocaleString('default', { month: 'short' }),
    revenue: parseFloat(m.revenue),
  })) || [];

  const trafficPie = traffic?.sources?.map((s) => ({
    name: s.source,
    value: parseInt(s.visits),
  })) || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-cream">Dashboard</h1>
        <p className="text-muted text-sm">Last 30 days overview</p>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue',     value: formatNGN(finance?.summary?.total_gross),      icon: '💰', color: 'text-brand' },
          { label: 'Unilo Commission',  value: formatNGN(finance?.summary?.total_commission),  icon: '📊', color: 'text-gold' },
          { label: 'Total Payouts',     value: formatNGN(finance?.summary?.total_payouts),     icon: '🏦', color: 'text-cream' },
          { label: 'Transactions',      value: finance?.summary?.transaction_count ?? '—',     icon: '🔁', color: 'text-cream' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="stat-card">
            <span className="text-2xl">{icon}</span>
            <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
            <p className="text-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Revenue chart ───────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-cream mb-4">Monthly Revenue</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00C2A8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#8A9BB0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8A9BB0', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#0f2035', border: '1px solid #ffffff15', borderRadius: 12 }}
                labelStyle={{ color: '#F5F0E8' }}
                formatter={(v) => [formatNGN(v), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00C2A8" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted text-sm">No data yet</div>
        )}
      </div>

      {/* ── Two-column: Traffic + Cities ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic sources pie */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-cream mb-4">Traffic Sources</h2>
          {trafficPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={trafficPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {trafficPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f2035', border: '1px solid #ffffff15', borderRadius: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#8A9BB0' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted text-sm">No data yet</div>
          )}
        </div>

        {/* Top cities */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-cream mb-4">Revenue by City</h2>
          <div className="space-y-2">
            {finance?.by_city?.length > 0 ? finance.by_city.map((c) => (
              <div key={c.city} className="flex items-center justify-between text-sm">
                <span className="text-cream">{c.city}</span>
                <span className="text-brand font-medium">{formatNGN(c.revenue)}</span>
              </div>
            )) : (
              <p className="text-muted text-sm">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Top searches ──────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-cream mb-4">Top Search Terms</h2>
        <div className="flex flex-wrap gap-2">
          {behaviour?.top_searches?.length > 0
            ? behaviour.top_searches.slice(0, 15).map((s) => (
                <span key={s.search_query} className="badge bg-white/8 text-cream border border-white/10">
                  {s.search_query} <span className="text-brand ml-1">{s.count}</span>
                </span>
              ))
            : <p className="text-muted text-sm">No searches yet</p>
          }
        </div>
      </div>
    </div>
  );
}
