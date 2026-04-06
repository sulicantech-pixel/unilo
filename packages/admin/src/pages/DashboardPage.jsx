import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import api from '../lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', maximumFractionDigits: 0,
  }).format(v || 0);

const fmtK = (v) =>
  v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`;

function GapScore({ score }) {
  const color =
    score >= 80 ? '#EF4444' :
    score >= 60 ? '#F59E0B' :
    score >= 40 ? '#00C2A8' : '#22C55E';
  const label =
    score >= 80 ? 'CRITICAL' :
    score >= 60 ? 'HIGH' :
    score >= 40 ? 'MEDIUM' : 'LOW';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 94.2} 94.2`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
          {score}
        </span>
      </div>
      <span className="text-[10px] font-bold tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, trend, icon, accent }) {
  const isUp = trend > 0;
  return (
    <div className="stat-card relative overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: accent || '#00C2A8' }}
      />
      <div className="flex items-start justify-between mb-3">
        <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="font-display font-bold text-2xl text-cream mb-0.5">{value}</p>
      {sub && <p className="text-muted text-xs">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isUp ? 'text-success' : 'text-danger'}`}>
          <span>{isUp ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  );
}

// Skeleton
function Skeleton({ className }) {
  return <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />;
}

// ── DEMAND MATRIX ─────────────────────────────────────────────────────────────
function DemandMatrix({ data, loading }) {
  const [sort, setSort] = useState('gap');

  if (loading) {
    return (
      <div className="card p-5">
        <Skeleton className="h-6 w-48 mb-4" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 mb-2" />)}
      </div>
    );
  }

  const universities = (data?.universities || MOCK_UNIVERSITIES).sort((a, b) => {
    if (sort === 'gap') return b.gap_score - a.gap_score;
    if (sort === 'searches') return b.searches - a.searches;
    if (sort === 'listings') return a.listings - b.listings;
    return 0;
  });

  const maxSearches = Math.max(...universities.map((u) => u.searches));

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-cream text-lg">Demand Intelligence Matrix</h2>
          <p className="text-muted text-xs mt-0.5">Universities ranked by unmet student housing demand</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          {[['gap', 'Gap Score'], ['searches', 'Searches'], ['listings', 'Listings']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sort === key ? 'bg-brand text-navy' : 'text-muted hover:text-cream'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-3 px-3 mb-2">
        <span className="col-span-3 text-muted text-[10px] uppercase tracking-wider">University</span>
        <span className="col-span-3 text-muted text-[10px] uppercase tracking-wider">Search Volume</span>
        <span className="col-span-2 text-muted text-[10px] uppercase tracking-wider">Listings</span>
        <span className="col-span-2 text-muted text-[10px] uppercase tracking-wider">Gap Score</span>
        <span className="col-span-2 text-muted text-[10px] uppercase tracking-wider">Action</span>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {universities.map((u, i) => (
          <div
            key={u.name}
            className="grid grid-cols-12 gap-3 items-center px-3 py-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors border border-white/5"
          >
            {/* Rank + name */}
            <div className="col-span-3 flex items-center gap-2.5">
              <span className="text-muted text-xs font-mono w-4 shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-cream text-xs font-medium truncate">{u.short_name || u.name}</p>
                <p className="text-muted text-[10px] truncate">{u.city}</p>
              </div>
            </div>

            {/* Search volume bar */}
            <div className="col-span-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(u.searches / maxSearches) * 100}%`,
                    background: u.gap_score >= 70 ? '#EF4444' : u.gap_score >= 40 ? '#F59E0B' : '#00C2A8',
                  }}
                />
              </div>
              <span className="text-cream text-xs font-medium w-8 text-right shrink-0">{u.searches}</span>
            </div>

            {/* Listings */}
            <div className="col-span-2">
              <span className={`text-sm font-bold ${u.listings < 5 ? 'text-danger' : u.listings < 20 ? 'text-warning' : 'text-success'}`}>
                {u.listings}
              </span>
              <span className="text-muted text-xs"> listed</span>
            </div>

            {/* Gap score */}
            <div className="col-span-2">
              <GapScore score={u.gap_score} />
            </div>

            {/* Action */}
            <div className="col-span-2">
              {u.gap_score >= 70 ? (
                <span className="text-[10px] font-bold text-danger bg-danger/10 border border-danger/20 px-2 py-1 rounded-lg">
                  Recruit landlords
                </span>
              ) : u.gap_score >= 40 ? (
                <span className="text-[10px] font-bold text-warning bg-warning/10 border border-warning/20 px-2 py-1 rounded-lg">
                  Run ads
                </span>
              ) : (
                <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-2 py-1 rounded-lg">
                  Healthy
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Insight callout */}
      {universities[0] && (
        <div className="mt-4 p-3 rounded-xl bg-danger/8 border border-danger/15">
          <p className="text-danger text-xs font-medium">
            🔴 Critical gap: <span className="text-cream">{universities[0].short_name || universities[0].name}</span> has{' '}
            <strong>{universities[0].searches} student searches</strong> but only{' '}
            <strong>{universities[0].listings} listings</strong>. Landlord recruitment campaign recommended.
          </p>
        </div>
      )}
    </div>
  );
}

// ── CONVERSION FUNNEL ────────────────────────────────────────────────────────
function ConversionFunnel({ data, loading }) {
  if (loading) return <div className="card p-5 h-48"><Skeleton className="h-full" /></div>;

  const stages = data?.funnel || MOCK_FUNNEL;
  const max = stages[0]?.value || 1;

  return (
    <div className="card p-5">
      <h2 className="font-display font-bold text-cream mb-1">Conversion Funnel</h2>
      <p className="text-muted text-xs mb-5">Platform-wide: views → saves → contacts → cluster joins</p>

      <div className="space-y-3">
        {stages.map((s, i) => {
          const pct = ((s.value / max) * 100).toFixed(0);
          const drop = i > 0 ? (((stages[i - 1].value - s.value) / stages[i - 1].value) * 100).toFixed(0) : null;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-cream text-xs font-medium">{s.label}</span>
                <div className="flex items-center gap-3">
                  {drop && (
                    <span className={`text-[10px] font-medium ${drop > 60 ? 'text-danger' : drop > 30 ? 'text-warning' : 'text-muted'}`}>
                      −{drop}% drop
                    </span>
                  )}
                  <span className="text-brand text-sm font-bold">{s.value.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: i === 0 ? '#00C2A8' : i === 1 ? '#F4A944' : i === 2 ? '#3B82F6' : '#EC4899',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Biggest drop insight */}
      <div className="mt-4 p-3 rounded-xl bg-warning/8 border border-warning/15">
        <p className="text-warning text-xs font-medium">
          ⚠ Biggest drop: Views → Saves. Students browse but don't save. Consider improving listing photo quality and pricing clarity.
        </p>
      </div>
    </div>
  );
}

// ── LANDLORD HEALTH ────────────────────────────────────────────────────────
function LandlordHealth({ data, loading }) {
  if (loading) return <div className="card p-5 h-48"><Skeleton className="h-full" /></div>;

  const landlords = data?.landlords || MOCK_LANDLORDS;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-cream">Landlord Health</h2>
          <p className="text-muted text-xs mt-0.5">Activity index — flagging ghosts</p>
        </div>
        <span className="badge bg-danger/10 text-danger border border-danger/20">
          {landlords.filter((l) => l.health < 40).length} inactive
        </span>
      </div>

      <div className="space-y-2.5">
        {landlords.slice(0, 6).map((l) => (
          <div key={l.name} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold shrink-0">
              {l.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-cream text-xs font-medium truncate">{l.name}</span>
                <span className={`text-xs font-bold ml-2 shrink-0 ${l.health >= 70 ? 'text-success' : l.health >= 40 ? 'text-warning' : 'text-danger'}`}>
                  {l.health}%
                </span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${l.health}%`,
                    background: l.health >= 70 ? '#22C55E' : l.health >= 40 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
              <p className="text-muted text-[10px] mt-0.5">{l.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── REVENUE CHART ─────────────────────────────────────────────────────────────
function RevenueChart({ data, loading }) {
  if (loading) return <div className="card p-5 h-64"><Skeleton className="h-full" /></div>;

  const monthly = data?.monthly || MOCK_MONTHLY;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-cream">Revenue Pipeline</h2>
          <p className="text-muted text-xs">Actual + projected (dotted)</p>
        </div>
        <span className="text-brand font-display font-bold text-sm">
          {fmt(monthly.reduce((a, m) => a + m.revenue, 0))} YTD
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F4A944" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#F4A944" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fill: '#8A9BB0', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8A9BB0', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={45} />
          <Tooltip
            contentStyle={{ background: '#0f2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}
            labelStyle={{ color: '#F5F0E8', fontSize: 11 }}
            formatter={(v, name) => [fmt(v), name === 'revenue' ? 'Actual' : 'Projected']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#00C2A8" strokeWidth={2} fill="url(#revGrad2)" dot={false} />
          <Area type="monotone" dataKey="projected" stroke="#F4A944" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#projGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── CLUSTER PIPELINE ─────────────────────────────────────────────────────────
function ClusterPipeline({ data, loading }) {
  if (loading) return <div className="card p-5 h-36"><Skeleton className="h-full" /></div>;

  const clusters = data?.clusters || MOCK_CLUSTERS;
  const total = clusters.reduce((a, c) => a + c.count, 0);

  return (
    <div className="card p-5">
      <h2 className="font-display font-bold text-cream mb-1">Cluster Pipeline</h2>
      <p className="text-muted text-xs mb-4">{total} active clusters · potential revenue</p>

      <div className="space-y-2.5">
        {clusters.map((c) => (
          <div key={c.stage} className="flex items-center gap-3">
            <span className="text-xs text-muted w-24 shrink-0">{c.stage}</span>
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(c.count / Math.max(...clusters.map((x) => x.count))) * 100}%`, background: c.color }}
              />
            </div>
            <span className="text-cream text-xs font-bold w-6 text-right shrink-0">{c.count}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
        <span className="text-muted text-xs">Est. revenue if all complete</span>
        <span className="text-brand font-display font-bold">{fmt(data?.potential_revenue || 1_250_000)}</span>
      </div>
    </div>
  );
}

// ── MOCK DATA (removed once API returns real data) ────────────────────────────
const MOCK_UNIVERSITIES = [
  { name: 'University of Lagos', short_name: 'UNILAG', city: 'Lagos', searches: 847, listings: 12, gap_score: 96 },
  { name: 'University of Nigeria', short_name: 'UNN', city: 'Nsukka', searches: 612, listings: 8, gap_score: 89 },
  { name: 'Obafemi Awolowo University', short_name: 'OAU', city: 'Ile-Ife', searches: 541, listings: 31, gap_score: 72 },
  { name: 'University of Port Harcourt', short_name: 'UNIPORT', city: 'Port Harcourt', searches: 489, listings: 44, gap_score: 58 },
  { name: 'Ahmadu Bello University', short_name: 'ABU', city: 'Zaria', searches: 390, listings: 27, gap_score: 51 },
  { name: 'University of Ibadan', short_name: 'UI', city: 'Ibadan', searches: 312, listings: 88, gap_score: 19 },
];

const MOCK_FUNNEL = [
  { label: 'Listing Views', value: 14820 },
  { label: 'Saves / Wishlists', value: 3240 },
  { label: 'Contact / WhatsApp', value: 891 },
  { label: 'Cluster Join', value: 124 },
];

const MOCK_LANDLORDS = [
  { name: 'Emeka Properties', health: 94, note: '3 active listings · last active today' },
  { name: 'Grace Realty', health: 81, note: '2 active listings · last active 2d ago' },
  { name: 'UniHomes PH', health: 65, note: '1 listing · not updated in 2 weeks' },
  { name: 'Bola Estates', health: 38, note: '2 draft listings · never submitted' },
  { name: 'Campus Lodge', health: 20, note: '0 active · last login 6 weeks ago' },
  { name: 'Chidi Rentals', health: 11, note: '1 rejected listing · no follow-up' },
];

const MOCK_MONTHLY = [
  { month: 'Oct', revenue: 0, projected: 80000 },
  { month: 'Nov', revenue: 0, projected: 150000 },
  { month: 'Dec', revenue: 85000, projected: 200000 },
  { month: 'Jan', revenue: 220000, projected: 280000 },
  { month: 'Feb', revenue: 310000, projected: 350000 },
  { month: 'Mar', revenue: 480000, projected: null },
  { month: 'Apr', revenue: null, projected: 620000 },
  { month: 'May', revenue: null, projected: 780000 },
];

const MOCK_CLUSTERS = [
  { stage: 'Broadcasting', count: 8, color: '#3B82F6' },
  { stage: 'Joining', count: 14, color: '#F4A944' },
  { stage: 'Locked In', count: 6, color: '#00C2A8' },
  { stage: 'In Review', count: 3, color: '#8B5CF6' },
  { stage: 'Paying', count: 2, color: '#22C55E' },
];

// ── PAGE ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: finance, isLoading: financeLoading } = useQuery({
    queryKey: ['finance'],
    queryFn: () => api.get('/admin/finance').then((r) => r.data),
  });

  const { data: intelligence, isLoading: intelLoading } = useQuery({
    queryKey: ['intelligence'],
    queryFn: () => api.get('/admin/intelligence').then((r) => r.data).catch(() => null),
  });

  const { data: behaviour, isLoading: bhvLoading } = useQuery({
    queryKey: ['behaviour'],
    queryFn: () => api.get('/analytics/behaviour').then((r) => r.data),
  });

  const isLoading = financeLoading;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Intelligence Hub</h1>
          <p className="text-muted text-sm mt-1">
            Real-time demand signals · {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live data
          </span>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={isLoading ? '—' : fmt(finance?.summary?.total_gross)}
          sub="All time"
          trend={12}
          icon="💰"
          accent="#00C2A8"
        />
        <StatCard
          label="Unilo Commission"
          value={isLoading ? '—' : fmt(finance?.summary?.total_commission)}
          sub="5% of gross"
          trend={8}
          icon="📊"
          accent="#F4A944"
        />
        <StatCard
          label="Active Listings"
          value={isLoading ? '—' : (finance?.summary?.active_listings ?? '—')}
          sub="Approved & visible"
          trend={-3}
          icon="🏠"
          accent="#3B82F6"
        />
        <StatCard
          label="Cluster Pipeline"
          value={isLoading ? '—' : (intelligence?.clusters?.reduce((a, c) => a + c.count, 0) ?? 33)}
          sub="Across all stages"
          trend={24}
          icon="🔗"
          accent="#8B5CF6"
        />
      </div>

      {/* ── Demand Matrix (full width) ─────────────────────────────────── */}
      <DemandMatrix data={intelligence} loading={intelLoading} />

      {/* ── Three columns ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart data={finance} loading={financeLoading} />
        </div>
        <ClusterPipeline data={intelligence} loading={intelLoading} />
      </div>

      {/* ── Two columns ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ConversionFunnel data={intelligence} loading={intelLoading} />
        <LandlordHealth data={intelligence} loading={intelLoading} />
      </div>

      {/* ── Top search terms ───────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-cream">Top Student Searches</h2>
            <p className="text-muted text-xs">What students are looking for — use this for landlord recruitment briefs</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(behaviour?.top_searches?.slice(0, 20) || MOCK_SEARCHES).map((s, i) => (
            <span
              key={s.search_query || s}
              className="badge border text-xs"
              style={{
                background: `rgba(0, 194, 168, ${0.05 + (1 - i / 20) * 0.1})`,
                borderColor: `rgba(0, 194, 168, ${0.1 + (1 - i / 20) * 0.2})`,
                color: i < 5 ? '#00C2A8' : '#8A9BB0',
                fontSize: i < 3 ? '13px' : '11px',
              }}
            >
              {s.search_query || s}
              {s.count && <span className="ml-1.5 opacity-60">{s.count}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCK_SEARCHES = [
  'self contain near unilag', 'room uniport choba', 'self contain aluu',
  'hostel unn nsukka', 'room and parlour oau', '1 bedroom near ui',
  'cluster unilag', 'cheap room near abubakar tafawa', 'furnished room ibadan',
  'room with generator', 'self contain with wifi', 'near school gate room',
];
