import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAdminAuth } from '../store/authStore';

// ── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_STYLES = {
  viewer:     'bg-white/8 text-muted border-white/10',
  user_admin: 'bg-brand/10 text-brand border-brand/20',
  head_admin: 'bg-gold/10 text-gold border-gold/20',
  analyst:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const ROLE_LABELS = {
  viewer:     'Student',
  user_admin: 'Landlord',
  head_admin: 'Head Admin',
  analyst:    'Analyst',
};

const USER_TAGS = [
  'VIP landlord', 'Needs follow-up', 'High performer', 'Ghost landlord',
  'New user', 'Complaints raised', 'Verified identity', 'Premium candidate',
];

// ── Health Score bar ──────────────────────────────────────────────────────────
function HealthBar({ score }) {
  const color = score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color }}>{score}%</span>
    </div>
  );
}

// ── Notes & Tags Panel ────────────────────────────────────────────────────────
function NotesPanel({ user, onClose, canEdit }) {
  const qc = useQueryClient();
  const [note, setNote] = useState(user.admin_note || '');
  const [tags, setTags] = useState(user.admin_tags || []);

  const saveNote = useMutation({
    mutationFn: () => api.patch(`/admin/users/${user.id}/note`, { note, tags }),
    onSuccess: () => { qc.invalidateQueries(['users']); onClose(); },
  });

  const toggleTag = (tag) =>
    setTags((t) => t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-cream">Notes & Tags</h2>
            <p className="text-muted text-sm">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-cream">✕</button>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <p className="text-muted text-xs mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {USER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => canEdit && toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  tags.includes(tag)
                    ? 'bg-brand/15 text-brand border-brand/30'
                    : 'bg-white/5 text-muted border-white/10 hover:border-white/25'
                } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-4">
          <p className="text-muted text-xs mb-2">Internal note (not visible to user)</p>
          <textarea
            className="input min-h-[100px] resize-none text-sm"
            placeholder="Add a note about this user…"
            value={note}
            onChange={(e) => canEdit && setNote(e.target.value)}
            readOnly={!canEdit}
          />
        </div>

        <div className="flex gap-3">
          {canEdit && (
            <button
              onClick={() => saveNote.mutate()}
              disabled={saveNote.isPending}
              className="btn-primary flex-1"
            >
              {saveNote.isPending ? 'Saving…' : 'Save'}
            </button>
          )}
          <button onClick={onClose} className="btn-ghost flex-1">
            {canEdit ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User Row ──────────────────────────────────────────────────────────────────
function UserRow({ user, onNotes, isHeadAdmin }) {
  const qc = useQueryClient();

  const toggleSuspend = useMutation({
    mutationFn: () => api.post(`/admin/users/${user.id}/suspend`),
    onSuccess: () => qc.invalidateQueries(['users']),
  });

  const daysSinceJoin = Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24));
  const isNew = daysSinceJoin < 14;

  return (
    <tr className="border-b border-white/5 hover:bg-white/2 transition-colors group">
      {/* Name + avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand/15 border border-brand/20 flex items-center justify-center text-brand text-xs font-bold shrink-0">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-cream text-xs font-medium flex items-center gap-1.5">
              {user.name}
              {isNew && <span className="badge bg-brand/10 text-brand border-brand/20 text-[9px]">New</span>}
              {user.is_suspended && <span className="badge bg-danger/10 text-danger border-danger/20 text-[9px]">Suspended</span>}
            </p>
            {user.business_name && (
              <p className="text-muted text-[10px] truncate">{user.business_name}</p>
            )}
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3 text-muted text-xs max-w-[180px]">
        <span className="truncate block">{user.email}</span>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <span className={`badge text-[10px] border ${ROLE_STYLES[user.role] || ROLE_STYLES.viewer}`}>
          {ROLE_LABELS[user.role] || user.role}
        </span>
      </td>

      {/* Health (landlords only) */}
      <td className="px-4 py-3 w-32">
        {user.role === 'user_admin' && user.health_score !== undefined ? (
          <HealthBar score={user.health_score} />
        ) : (
          <span className="text-muted text-xs">—</span>
        )}
      </td>

      {/* Tags */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {(user.admin_tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="text-[9px] bg-white/6 text-muted px-1.5 py-0.5 rounded-full border border-white/10">{tag}</span>
          ))}
          {(user.admin_tags?.length || 0) > 2 && (
            <span className="text-[9px] text-muted">+{user.admin_tags.length - 2}</span>
          )}
        </div>
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-muted text-xs">
        {new Date(user.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onNotes(user)}
            className="text-muted text-xs hover:text-cream transition-colors"
          >
            📝 Notes
          </button>
          {isHeadAdmin && user.role !== 'head_admin' && (
            <button
              onClick={() => toggleSuspend.mutate()}
              disabled={toggleSuspend.isPending}
              className={`text-xs transition-colors ${user.is_suspended ? 'text-success hover:underline' : 'text-danger hover:underline'}`}
            >
              {user.is_suspended ? 'Unsuspend' : 'Suspend'}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user: me } = useAdminAuth();
  const isHeadAdmin = me?.role === 'head_admin';

  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [notesTarget, setNotesTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', role],
    queryFn: () => api.get(`/admin/users?role=${role}&limit=100`).then((r) => r.data),
  });

  const users = (data?.users || []).filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.business_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: data?.total || 0,
    students: (data?.users || []).filter((u) => u.role === 'viewer').length,
    landlords: (data?.users || []).filter((u) => u.role === 'user_admin').length,
    suspended: (data?.users || []).filter((u) => u.is_suspended).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-cream">Users</h1>
        <p className="text-muted text-sm">{stats.total} registered · {stats.landlords} landlords · {stats.suspended} suspended</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Users', value: stats.total, color: 'text-cream' },
          { label: 'Students', value: stats.students, color: 'text-muted' },
          { label: 'Landlords', value: stats.landlords, color: 'text-brand' },
          { label: 'Suspended', value: stats.suspended, color: 'text-danger' },
        ].map((s) => (
          <div key={s.label} className="card p-3">
            <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
            <p className="text-muted text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input
            className="input pl-9 text-sm"
            placeholder="Search name, email, business…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select className="input w-40 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="viewer">Students</option>
          <option value="user_admin">Landlords</option>
          <option value="analyst">Analysts</option>
          <option value="head_admin">Head Admins</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="card h-14 animate-pulse" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-muted text-[10px] uppercase tracking-wider">
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3 w-32">Health</th>
                  <th className="text-left px-4 py-3">Tags</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    onNotes={setNotesTarget}
                    isHeadAdmin={isHeadAdmin}
                  />
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-12 text-center text-muted text-sm">No users found</div>
            )}
          </div>
        </div>
      )}

      {/* Notes panel */}
      {notesTarget && (
        <NotesPanel
          user={notesTarget}
          onClose={() => setNotesTarget(null)}
          canEdit={isHeadAdmin || me?.role === 'analyst'}
        />
      )}
    </div>
  );
}
