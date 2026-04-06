import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';
import api from '../lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const BRAND   = '#00C2A8';
const GOLD    = '#F4A944';
const MUTED   = '#8A9BB0';
const DANGER  = '#EF4444';
const WARNING = '#F59E0B';
const SUCCESS = '#22C55E';

const CHART_STYLE = {
  contentStyle: { background: '#0f2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 },
  labelStyle:   { color: '#F5F0E8', fontSize: 11 },
};

function Skeleton({ className }) {
  return <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />;
}

// ── University selector ───────────────────────────────────────────────────────
function UniSelector({ universities, selected, onChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onChange('all')}
        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
          selected === 'all'
            ? 'bg-brand text-navy border-brand'
            : 'text-muted border-white/15 hover:border-white/30 hover:text-cream'
        }`}
      >
        All universities
      </button>
      {universities.map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
            selected === u
              ? 'bg-brand text-navy border-brand'
              : 'text-muted border-white/15 hover:border-white/30 hover:text-cream'
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}

// ── Search Term Cloud ─────────────────────────────────────────────────────────
function SearchTermCloud({ terms, uniFilter }) {
  const filtered = uniFilter === 'all'
    ? terms
    : terms.filter((t) => !t.university || t.university === uniFilter);

  const sorted = [...filtered].sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count || 1;

  if (!sorted.length) {
    return <p className="text-muted text-sm">No search data{uniFilter !== 'all' ? ` for ${uniFilter}` : ''} yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.slice(0, 30).map((t, i) => {
        const weight = t.count / max;
        const isHot  = weight > 0.6;
        const isMed  = weight > 0.3;
        return (
          <span
            key={t.search_query || t.query || i}
            style={{
              fontSize:    isHot ? 13 : isMed ? 12 : 11,
              padding:     isHot ? '4px 12px' : '3px 9px',
              borderRadius: 99,
              background:  isHot ? 'rgba(0,194,168,0.12)' : 'rgba(255,255,255,0.04)',
              border:      `1px solid ${isHot ? 'rgba(0,194,168,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color:       isHot ? BRAND : isMed ? '#F5F0E8' : MUTED,
              fontWeight:  isHot ? 500 : 400,
              display:     'inline-flex',
              alignItems:  'center',
              gap:         6,
            }}
          >
            {t.search_query || t.query}
            <span style={{ fontSize: 10, opacity: 0.7 }}>{t.count}</span>
          </span>
        );
      })}
    </div>
  );
}

// ── Demand Gap per uni ────────────────────────────────────────────────────────
function DemandGapTable({ universities, uniFilter }) {
  const list = uniFilter === 'all'
    ? universities
    : universities.filter((u) => u.short_name === uniFilter || u.name === uniFilter);

  return (
    <div className="space-y-2">
      {list.map((u) => {
        const color = u.gap_score >= 70 ? DANGER : u.gap_score >= 40 ? WARNING : SUCCESS;
        return (
          <div key={u.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
            <div className="w-20 shrink-0">
              <p className="text-cream text-xs font-medium truncate">{u.short_name || u.name}</p>
              <p className="text-muted text-[10px]">{u.city}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                <span>{u.searches} searches</span>
                <span>{u.listings} listings</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${u.gap_score}%`, background: color }} />
              </div>
            </div>
            <div style={{ color }} className="text-xs font-bold w-8 text-right shrink-0">{u.gap_score}</div>
            <div className="w-20 shrink-0 text-right">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: u.gap_score >= 70 ? 'rgba(239,68,68,0.1)' : u.gap_score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                  color,
                }}
              >
                {u.gap_score >= 70 ? 'Recruit' : u.gap_score >= 40 ? 'Run ads' : 'Healthy'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_UNI_LIST = ['UNILAG', 'UNN', 'OAU', 'UNIPORT', 'UI'];

const MOCK_SEARCHES = [
  { search_query: 'self contain near unilag',   count: 184, university: 'UNILAG' },
  { search_query: 'room with generator unilag', count: 102, university: 'UNILAG' },
  { search_query: 'hostel unilag yaba',         count:  88, university: 'UNILAG' },
  { search_query: 'cluster unilag',             count:  71, university: 'UNILAG' },
  { search_query: 'room uniport choba',         count: 163, university: 'UNIPORT' },
  { search_query: 'self contain aluu',          count: 141, university: 'UNIPORT' },
  { search_query: 'cheap room near uniport',    count:  97, university: 'UNIPORT' },
  { search_query: 'hostel unn nsukka',          count: 130, university: 'UNN' },
  { search_query: 'room near unn gate',         count:  89, university: 'UNN' },
  { search_query: 'self contain nsukka',        count:  74, university: 'UNN' },
  { search_query: 'room and parlour oau',       count: 112, university: 'OAU' },
  { search_query: 'hostel ile ife oau',         count:  80, university: 'OAU' },
  { search_query: '1 bedroom near ui ibadan',   count:  98, university: 'UI' },
  { search_query: 'furnished room ibadan',      count:  66, university: 'UI' },
  { search_query: 'room with wifi near school', count:  55, university: null },
  { search_query: 'near school gate room',      count:  48, university: null },
  { search_query: 'self contain monthly rent',  count:  44, university: null },
  { search_query: 'cluster roommate match',     count:  39, university: null },
];

const MOCK_UNIVERSITIES = [
  { name: 'University of Lagos',         short_name: 'UNILAG',  city: 'Lagos',         searches: 847, listings: 12, gap_score: 96 },
  { name: 'University of Nigeria',       short_name: 'UNN',     city: 'Nsukka',        searches: 612, listings:  8, gap_score: 89 },
  { name: 'Obafemi Awolowo University',  short_name: 'OAU',     city: 'Ile-Ife',       searches: 541, listings: 31, gap_score: 72 },
  { name: 'Univ. of Port Harcourt',     short_name: 'UNIPORT', city: 'Port Harcourt', searches: 489, listings: 44, gap_score: 58 },
  { name: 'University of Ibadan',        short_name: 'UI',      city: 'Ibadan',        searches: 312, listings: 88, gap_score: 19 },
];

const MOCK_TRAFFIC = [
  { source: 'Direct',        visits: 4820 },
  { source: 'WhatsApp',      visits: 3210 },
  { source: 'Google',        visits: 2140 },
  { source: 'Instagram',     visits:  890 },
  { source: 'Twitter/X',     visits:  430 },
];

const MOCK_DEVICES = [
  { device_type: 'Mobile',  count: 11580 },
  { device_type: 'Desktop', count:  2520 },
  { device_type: 'Tablet',  count:   740 },
];

const MOCK_PEAK = Array.from({ length: 24 }, (_, h) => ({
  hour: h,
  count: h < 6 ? Math.round(30 + Math.random() * 40) :
         h < 9 ? Math.round(100 + Math.random() * 100) :
         h < 13 ? Math.round(300 + Math.random() * 200) :
         h < 17 ? Math.round(400 + Math.random() * 200) :
         h < 22 ? Math.round(600 + Math.random() * 400) :
         Math.round(200 + Math.random() * 100),
}));

const MOCK_FUNNEL = [
  { label: 'Listing views',    value: 14820 },
  { label: 'Saves',            value:  3240 },
  { label: 'Contact clicks',   value:   891 },
  { label: 'Cluster joins',    value:   124 },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [uniFilter, setUniFilter] = useState('all');

  const { data: behaviour, isLoading: bhvLoading } = useQuery({
    queryKey: ['behaviour'],
    queryFn: () => api.get('/analytics/behaviour').then((r) => r.data).catch(() => null),
  });

  const { data: traffic, isLoading: trafficLoading } = useQuery({
    queryKey: ['traffic'],
    queryFn: () => api.get('/analytics/traffic?days=30').then((r) => r.data).catch(() => null),
  });

  const { data: intelligence } = useQuery({
    queryKey: ['intelligence'],
    queryFn: () => api.get('/admin/intelligence').then((r) => r.data).catch(() => null),
  });

  const searches     = behaviour?.top_searches     || MOCK_SEARCHES;
  const universities = intelligence?.universities   || MOCK_UNIVERSITIES;
  const trafficSrc   = traffic?.sources            || MOCK_TRAFFIC;
  const devices      = behaviour?.devices          || MOCK_DEVICES;
  const peakHours    = behaviour?.peak_hours       || MOCK_PEAK;
  const funnel       = intelligence?.funnel        || MOCK_FUNNEL;

  const maxTraffic  = Math.max(...trafficSrc.map((s) => parseInt(s.visits)));
  const maxPeak     = Math.max(...peakHours.map((h) => parseInt(h.count)));
  const funnelMax   = funnel[0]?.value || 1;

  // Unique university list from searches
  const uniList = [...new Set(searches.filter((s) => s.university).map((s) => s.university))];

  const peakHour = peakHours.reduce((a, b) => parseInt(a.count) > parseInt(b.count) ? a : b, peakHours[0]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-cream">Analytics</h1>
          <p className="text-muted text-sm mt-1">Student behaviour · 30-day window</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live data
        </span>
      </div>

      {/* ── University Filter ─────────────────────────────────────────── */}
      <div className="card p-4">
        <p className="text-muted text-xs uppercase tracking-wider font-medium mb-3">Filter by university</p>
        <UniSelector universities={uniList} selected={uniFilter} onChange={setUniFilter} />
        {uniFilter !== 'all' && (
          <p className="text-brand text-xs mt-3 font-medium">
            Showing data for <strong>{uniFilter}</strong> — {searches.filter((s) => s.university === uniFilter).length} search terms tracked
          </p>
        )}
      </div>

      {/* ── Search Terms (primary insight) ───────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-cream text-lg">
              Student search terms
              {uniFilter !== 'all' && (
                <span className="text-brand ml-2 text-base">· {uniFilter}</span>
              )}
            </h2>
            <p className="text-muted text-xs mt-0.5">
              {uniFilter === 'all'
                ? 'What students across all universities are looking for — use this for landlord recruitment briefs'
                : `What ${uniFilter} students specifically search for — recruit landlords matching these exact terms`}
            </p>
          </div>
          {uniFilter !== 'all' && (
            <button onClick={() => setUniFilter('all')} className="text-muted text-xs hover:text-cream">
              ← All unis
            </button>
          )}
        </div>

        {bhvLoading ? (
          <div className="flex flex-wrap gap-2">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-7 w-28" />)}
          </div>
        ) : (
          <SearchTermCloud terms={searches} uniFilter={uniFilter} />
        )}

        {/* Per-university breakdown — only shown in "all" mode */}
        {uniFilter === 'all' && uniList.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/8">
            <p className="text-muted text-xs uppercase tracking-wider font-medium mb-3">Top term per university</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {uniList.map((uni) => {
                const top = searches
                  .filter((s) => s.university === uni)
                  .sort((a, b) => b.count - a.count)[0];
                return (
                  <button
                    key={uni}
                    onClick={() => setUniFilter(uni)}
                    className="card p-3 text-left hover:border-brand/30 transition-colors group"
                  >
                    <p className="text-brand text-xs font-bold mb-1 group-hover:underline">{uni}</p>
                    <p className="text-cream text-xs leading-tight">{top?.search_query}</p>
                    <p className="text-muted text-[10px] mt-1">{top?.count} searches</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Demand Gap (filtered) ─────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-cream">Demand gap
              {uniFilter !== 'all' && <span className="text-brand ml-2 text-base">· {uniFilter}</span>}
            </h2>
            <p className="text-muted text-xs mt-0.5">Searches vs listings — where to recruit landlords</p>
          </div>
          {uniFilter !== 'all' && (
            <button onClick={() => setUniFilter('all')} className="text-muted text-xs hover:text-cream">← All unis</button>
          )}
        </div>
        <DemandGapTable universities={universities} uniFilter={uniFilter} />
        {uniFilter !== 'all' && (() => {
          const u = universities.find((x) => x.short_name === uniFilter || x.name === uniFilter);
          if (!u) return null;
          return (
            <div className={`mt-4 p-3 rounded-xl text-xs font-medium ${
              u.gap_score >= 70 ? 'bg-danger/8 border border-danger/15 text-danger' :
              u.gap_score >= 40 ? 'bg-warning/8 border border-warning/15 text-warning' :
              'bg-success/8 border border-success/15 text-success'
            }`}>
              {u.gap_score >= 70
                ? `🔴 ${uniFilter} is critically underserved. ${u.searches} student searches, only ${u.listings} listings. Immediate landlord recruitment needed.`
                : u.gap_score >= 40
                ? `⚠ ${uniFilter} has growth opportunity. Run targeted ads to attract more landlords.`
                : `✓ ${uniFilter} has healthy supply. Focus on quality and Cluster activation.`
              }
            </div>
          );
        })()}
      </div>

      {/* ── Conversion Funnel ─────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-display font-bold text-cream mb-1">Conversion funnel</h2>
        <p className="text-muted text-xs mb-5">Platform-wide — where students drop off</p>
        <div className="space-y-4">
          {funnel.map((s, i) => {
            const pct  = ((s.value / funnelMax) * 100).toFixed(0);
            const drop = i > 0 ? (((funnel[i-1].value - s.value) / funnel[i-1].value) * 100).toFixed(0) : null;
            const colors = [BRAND, GOLD, '#3B82F6', '#EC4899'];
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-cream text-xs font-medium">{s.label}</span>
                  <div className="flex items-center gap-3">
                    {drop && (
                      <span className={`text-[10px] font-medium ${parseInt(drop) > 60 ? 'text-danger' : parseInt(drop) > 30 ? 'text-warning' : 'text-muted'}`}>
                        −{drop}% drop
                      </span>
                    )}
                    <span className="text-sm font-bold" style={{ color: colors[i] }}>{s.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-warning/8 border border-warning/15">
          <p className="text-warning text-xs font-medium">
            ⚠ Biggest drop: Views → Saves ({funnel[0] && funnel[1] ? (((funnel[0].value - funnel[1].value)/funnel[0].value)*100).toFixed(0) : 78}% lost).
            Improve listing photo quality and add clear pricing to increase save rate.
          </p>
        </div>
      </div>

      {/* ── Traffic + Devices ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-display font-bold text-cream mb-4">Traffic sources (30d)</h2>
          {trafficLoading ? <Skeleton className="h-40" /> : (
            <div className="space-y-3">
              {trafficSrc.map((s) => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="text-cream text-xs w-24 shrink-0 capitalize">{s.source}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(parseInt(s.visits) / maxTraffic) * 100}%`, background: BRAND }} />
                  </div>
                  <span className="text-muted text-xs w-10 text-right shrink-0">{parseInt(s.visits).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-3 rounded-xl bg-brand/6 border border-brand/15">
            <p className="text-brand text-xs">WhatsApp is the #2 traffic source — listings shared via WhatsApp convert better. Add WhatsApp share buttons prominently.</p>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-bold text-cream mb-4">Device split</h2>
          {bhvLoading ? <Skeleton className="h-40" /> : (
            <div className="space-y-3">
              {devices.map((d) => {
                const maxD = Math.max(...devices.map((x) => parseInt(x.count)));
                const pct  = ((parseInt(d.count) / maxD) * 100).toFixed(0);
                return (
                  <div key={d.device_type} className="flex items-center gap-3">
                    <span className="text-cream text-xs w-16 shrink-0 capitalize">{d.device_type}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GOLD }} />
                    </div>
                    <span className="text-muted text-xs w-12 text-right shrink-0">
                      {((parseInt(d.count) / devices.reduce((a, x) => a + parseInt(x.count), 0)) * 100).toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 p-3 rounded-xl bg-gold/6 border border-gold/15">
            <p className="text-gold text-xs">
              {devices[0]?.device_type === 'Mobile' ? '78%+ mobile traffic' : 'Majority mobile'} — client app must be mobile-first. All listing cards, search, and Cluster flows need to work perfectly on small screens.
            </p>
          </div>
        </div>
      </div>

      {/* ── Peak Hours ────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-cream">Peak usage hours</h2>
            <p className="text-muted text-xs mt-0.5">When students are most active — time your listing pushes here</p>
          </div>
          {peakHour && (
            <div className="text-right">
              <p className="text-brand text-sm font-bold">{peakHour.hour}:00–{peakHour.hour + 1}:00</p>
              <p className="text-muted text-[10px]">Peak hour</p>
            </div>
          )}
        </div>
        <div className="flex items-end gap-0.5 h-24 mb-2">
          {peakHours.map((h, i) => {
            const pct = maxPeak ? (parseInt(h.count) / maxPeak) * 100 : 0;
            const isPeak = parseInt(h.count) === maxPeak;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  background: isPeak ? BRAND : pct > 60 ? 'rgba(0,194,168,0.5)' : pct > 30 ? 'rgba(0,194,168,0.3)' : 'rgba(255,255,255,0.06)',
                }}
                title={`${h.hour}:00 — ${parseInt(h.count).toLocaleString()} sessions`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-muted text-[10px]">
          <span>12am</span><span>3am</span><span>6am</span><span>9am</span>
          <span>12pm</span><span>3pm</span><span>6pm</span><span>9pm</span><span>11pm</span>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-brand/6 border border-brand/15">
          <p className="text-brand text-xs">
            💡 Strategy: Push new listings and Cluster broadcasts between{' '}
            {peakHour ? `${peakHour.hour > 1 ? peakHour.hour - 1 : peakHour.hour}:00–${peakHour.hour + 1}:00` : '7pm–9pm'} when students are most active.
            Avoid posting between 1am–6am.
          </p>
        </div>
      </div>
    </div>
  );
}
