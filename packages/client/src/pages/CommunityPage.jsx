/**
 * CommunityPage — Phase 1 + Phase 2 scaffold
 *
 * TABS:
 *   My Lodge   — private group for confirmed residents (Phase 1, fully functional)
 *   Feed       — campus-scoped social feed (Phase 2 scaffold, shows "coming soon" if empty)
 *   Explore    — discover other campus feeds
 *   Communitik — branding/about for the social layer
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

const PURPLE  = '#8b5cf6';
const BRAND   = '#ff6b00';
const NAVY    = '#0a0a0a';
const CREAM   = '#f5f0e8';
const MUTED   = 'rgba(255,255,255,0.42)';
const GLASS   = 'rgba(255,255,255,0.04)';
const BORDER  = 'rgba(255,255,255,0.08)';

// ── SVG icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Globe: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  Compass: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  Zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Lock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  MessageCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Pin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function Avatar({ name, size = 36, color = PURPLE }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}25`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color, fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ── LODGE GROUP (Phase 1) ─────────────────────────────────────────────────────
function LodgeGroup({ user }) {
  const qc = useQueryClient();
  const [text, setText]           = useState('');
  const [complaint, setComplaint] = useState(false);
  const [compText, setCompText]   = useState('');
  const bottomRef = useRef(null);

  const { data: lodge } = useQuery({
    queryKey: ['my-lodge'],
    queryFn: () => api.get('/community/my-lodge').then(r => r.data).catch(() => null),
    retry: false,
  });

  const { data: msgs = [], isLoading } = useQuery({
    queryKey: ['lodge-messages', lodge?.id],
    queryFn: () => api.get(`/community/lodge/${lodge.id}/messages`).then(r => r.data),
    enabled: !!lodge?.id,
    refetchInterval: 15_000,
  });

  const sendMsg = useMutation({
    mutationFn: body => api.post(`/community/lodge/${lodge.id}/messages`, body),
    onSuccess: () => { qc.invalidateQueries(['lodge-messages', lodge?.id]); setText(''); },
  });

  const sendComplaint = useMutation({
    mutationFn: body => api.post(`/community/lodge/${lodge.id}/complaints`, body),
    onSuccess: () => { qc.invalidateQueries(['lodge-messages', lodge?.id]); setComplaint(false); setCompText(''); },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Not in a lodge yet
  if (!lodge) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${PURPLE}15`, border: `1px solid ${PURPLE}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 18 }}>🏘️</div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: CREAM, margin: '0 0 8px' }}>No lodge yet</h3>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, maxWidth: 260, margin: '0 0 20px' }}>
          Once you book and pay for a room, you'll be automatically added to that lodge's group. You can contact neighbours, the caretaker, and the landlord here.
        </p>
        <button onClick={() => window.location.href = '/search'}
          style={{ background: PURPLE, color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          Find a room
        </button>
      </div>
    );
  }

  const dailyUsed  = lodge.daily_messages_used ?? 0;
  const dailyLimit = 2;
  const isLandlord = user?.role === 'user_admin' || user?.role === 'head_admin' || lodge.is_caretaker;
  const canSend    = isLandlord || dailyUsed < dailyLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 130px)' }}>

      {/* Lodge header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, background: `${PURPLE}08`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${PURPLE}20`, border: `1px solid ${PURPLE}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏘️</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: CREAM, margin: 0 }}>{lodge.name || 'My Lodge'}</p>
            <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0' }}>
              {lodge.member_count || 0} residents · {lodge.city}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: PURPLE, background: `${PURPLE}15`, border: `1px solid ${PURPLE}30`, borderRadius: 99, padding: '4px 8px' }}>
            <Icons.Lock /> Private
          </div>
        </div>

        {/* Daily limit bar (non-landlord) */}
        {!isLandlord && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: MUTED }}>Daily messages</span>
              <span style={{ fontSize: 11, color: dailyUsed >= dailyLimit ? '#f87171' : PURPLE, fontWeight: 600 }}>
                {dailyUsed}/{dailyLimit} used
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(dailyUsed / dailyLimit) * 100}%`, background: dailyUsed >= dailyLimit ? '#ef4444' : PURPLE, borderRadius: 99, transition: 'width 0.3s' }} />
            </div>
            {dailyUsed >= dailyLimit && (
              <p style={{ fontSize: 11, color: '#f87171', marginTop: 5 }}>
                Daily limit reached · <span style={{ color: BRAND, cursor: 'pointer', fontWeight: 600 }}>Buy credits</span> for more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s infinite', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 10, width: '30%', background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: 14, width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          ))
        ) : msgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: MUTED, fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
            No messages yet. Be the first to say hello to your neighbours!
          </div>
        ) : msgs.map(msg => {
          const isMe        = msg.user_id === user?.id;
          const isAnnounce  = msg.type === 'announcement';
          const isComplaint = msg.type === 'complaint';
          return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              {!isMe && <Avatar name={msg.sender_name} size={32} color={isAnnounce ? BRAND : PURPLE} />}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && (
                  <p style={{ fontSize: 11, color: MUTED, margin: '0 0 3px', paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {msg.sender_name}
                    {isAnnounce && <span style={{ fontSize: 10, background: `${BRAND}20`, color: BRAND, padding: '1px 6px', borderRadius: 99, border: `1px solid ${BRAND}30` }}>Landlord</span>}
                    {isComplaint && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '1px 6px', borderRadius: 99 }}>Complaint</span>}
                  </p>
                )}
                <div style={{
                  padding: '10px 13px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : isAnnounce ? '4px 18px 18px 18px' : '18px 18px 18px 4px',
                  background: isMe ? `${PURPLE}25` : isAnnounce ? `${BRAND}15` : isComplaint ? 'rgba(239,68,68,0.1)' : GLASS,
                  border: `1px solid ${isMe ? `${PURPLE}40` : isAnnounce ? `${BRAND}30` : isComplaint ? 'rgba(239,68,68,0.25)' : BORDER}`,
                }}>
                  {isAnnounce && (
                    <p style={{ fontSize: 10, fontWeight: 700, color: BRAND, margin: '0 0 4px', letterSpacing: '0.06em' }}>📌 ANNOUNCEMENT</p>
                  )}
                  {isComplaint && (
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#f87171', margin: '0 0 4px', letterSpacing: '0.06em' }}>🚨 COMPLAINT</p>
                  )}
                  <p style={{ fontSize: 14, color: CREAM, margin: 0, lineHeight: 1.55 }}>{msg.content}</p>
                  {msg.resolved && (
                    <p style={{ fontSize: 10, color: '#10b981', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Icons.Check /> Resolved
                    </p>
                  )}
                </div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '3px 0 0', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>

      {/* Complaint form */}
      <AnimatePresence>
        {complaint && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderTop: '1px solid rgba(239,68,68,0.2)', flexShrink: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icons.Alert /> File a complaint — always free, no credit used
            </p>
            <textarea value={compText} onChange={e => setCompText(e.target.value)}
              placeholder="Describe the issue (water, light, security, maintenance…)"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 12px', color: CREAM, fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'none', minHeight: 72 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => { setComplaint(false); setCompText(''); }}
                style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', fontSize: 13, color: MUTED, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cancel
              </button>
              <button onClick={() => compText.trim() && sendComplaint.mutate({ content: compText, type: 'complaint' })}
                disabled={!compText.trim() || sendComplaint.isPending}
                style={{ flex: 2, background: 'rgba(239,68,68,0.7)', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {sendComplaint.isPending ? 'Sending…' : '🚨 Submit complaint'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}`, flexShrink: 0, background: '#0d0d0d', paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        {canSend ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <button onClick={() => setComplaint(c => !c)}
              style={{ width: 38, height: 38, borderRadius: 11, background: complaint ? 'rgba(239,68,68,0.2)' : GLASS, border: `1px solid ${complaint ? 'rgba(239,68,68,0.4)' : BORDER}`, color: complaint ? '#f87171' : MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
              title="File complaint">
              <Icons.Alert />
            </button>
            <div style={{ flex: 1, background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && text.trim()) { e.preventDefault(); sendMsg.mutate({ content: text }); } }}
                placeholder="Say something to your neighbours…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: CREAM, fontSize: 14, fontFamily: 'DM Sans, sans-serif', caretColor: PURPLE }} />
            </div>
            <motion.button
              onClick={() => text.trim() && sendMsg.mutate({ content: text })}
              disabled={!text.trim() || sendMsg.isPending}
              whileTap={{ scale: 0.9 }}
              style={{ width: 40, height: 40, borderRadius: '50%', background: text.trim() ? PURPLE : 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
              <Icons.Send />
            </motion.button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 14 }}>
            <Icons.Lock />
            <p style={{ fontSize: 13, color: MUTED, flex: 1, margin: 0 }}>Daily limit reached (2 messages/day)</p>
            <button style={{ fontSize: 12, fontWeight: 700, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              Buy credits →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CAMPUS FEED (Phase 2 scaffold) ────────────────────────────────────────────
function CampusFeed({ user }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [postText, setPostText]       = useState('');
  const [selectedUni, setSelectedUni] = useState(user?.university || 'all');
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['campus-feed', selectedUni],
    queryFn: () => api.get(`/community/posts?uni=${selectedUni}`).then(r => r.data?.posts ?? []).catch(() => []),
  });

  const createPost = useMutation({
    mutationFn: body => api.post('/community/posts', body),
    onSuccess: () => { qc.invalidateQueries(['campus-feed']); setPostText(''); setComposeOpen(false); },
  });

  const likePost = useMutation({
    mutationFn: id => api.post(`/community/posts/${id}/like`),
    onSuccess: () => qc.invalidateQueries(['campus-feed']),
  });

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Coming soon banner if no posts */}
      {!isLoading && posts.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ margin: '16px 16px 0', background: `${PURPLE}10`, border: `1px solid ${PURPLE}25`, borderRadius: 20, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📡</div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: CREAM, margin: '0 0 6px' }}>
            Communitik is warming up
          </p>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: '0 0 14px' }}>
            Be the first student at your campus to post. Your university's feed starts with you.
          </p>
          {user ? (
            <button onClick={() => setComposeOpen(true)}
              style={{ background: PURPLE, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Post something →
            </button>
          ) : (
            <button onClick={() => window.location.href = '/register'}
              style={{ background: PURPLE, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Join to post
            </button>
          )}
        </motion.div>
      )}

      {/* Post composer */}
      {user && (
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>
          <div onClick={() => setComposeOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '12px 14px', cursor: 'pointer' }}>
            <Avatar name={`${user.first_name} ${user.last_name}`} size={32} />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>What's happening near {user.university || 'your campus'}?</span>
          </div>
        </div>
      )}

      {/* Posts */}
      <div style={{ padding: '0 16px' }}>
        {posts.map((post, i) => (
          <motion.div key={post.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            style={{ padding: '16px 0', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <Avatar name={post.author_name} size={38} color={PURPLE} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: CREAM }}>{post.author_name}</span>
                  {post.university && <span style={{ fontSize: 11, color: PURPLE, background: `${PURPLE}15`, padding: '1px 7px', borderRadius: 99 }}>{post.university}</span>}
                  {post.is_verified && <span style={{ fontSize: 11, color: BRAND }}>✓</span>}
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
                </div>
                <p style={{ fontSize: 14, color: CREAM, lineHeight: 1.6, margin: '6px 0 10px' }}>{post.content}</p>
                <div style={{ display: 'flex', gap: 18 }}>
                  {[
                    { icon: '❤️', count: post.likes || 0, action: () => likePost.mutate(post.id) },
                    { icon: '💬', count: post.comments || 0, action: () => {} },
                    { icon: '🔁', count: post.shares || 0, action: () => {} },
                  ].map(({ icon, count, action }) => (
                    <button key={icon} onClick={action}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: MUTED, fontFamily: 'DM Sans, sans-serif', transition: 'color 0.15s' }}>
                      {icon} {count > 0 && count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 60, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setComposeOpen(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 540, background: '#111', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '24px 24px 0 0', padding: '18px 20px 36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: CREAM }}>New post</span>
                <button onClick={() => setComposeOpen(false)} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '50%', width: 30, height: 30, color: MUTED, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Avatar name={`${user?.first_name} ${user?.last_name}`} size={36} />
                <textarea value={postText} onChange={e => setPostText(e.target.value)} autoFocus
                  placeholder="What's happening near your campus?"
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: CREAM, fontSize: 15, fontFamily: 'DM Sans, sans-serif', resize: 'none', minHeight: 100, lineHeight: 1.6, caretColor: PURPLE }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12, color: MUTED }}>
                  {user?.university || 'Campus'} · visible to all students
                </span>
                <button onClick={() => postText.trim() && createPost.mutate({ content: postText, university: user?.university })}
                  disabled={!postText.trim() || createPost.isPending}
                  style={{ background: postText.trim() ? PURPLE : `${PURPLE}40`, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: postText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'DM Sans, sans-serif' }}>
                  {createPost.isPending ? 'Posting…' : 'Post'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── COMMUNITIK INFO TAB ───────────────────────────────────────────────────────
function CommunitikInfo() {
  return (
    <div style={{ padding: '24px 16px 100px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>
          <span style={{ color: PURPLE }}>Commun</span><span style={{ color: CREAM }}>itik</span>
        </div>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>The campus social network, built inside Unilo</p>
      </div>

      {[
        { icon: '🏘️', title: 'Lodge walls', desc: 'Every building on Unilo gets a private group. Your lodge, your rules.' },
        { icon: '📡', title: 'Campus feeds', desc: 'See what is happening near your university — posted by students like you.' },
        { icon: '🗳️', title: 'Polls & confessions', desc: 'Anonymous campus polls. Real opinions, no judgment.' },
        { icon: '🛍️', title: 'Campus marketplace', desc: 'Sublet rooms, sell textbooks, find lesson teachers — all in one place.' },
        { icon: '💬', title: '2 free messages/day', desc: 'Enough to stay connected. Buy credits if you need more — it keeps groups clean.' },
        { icon: '🚨', title: 'Complaints always free', desc: 'Report water, light, or security issues to your landlord. No credits needed, ever.' },
      ].map(item => (
        <div key={item.title} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${PURPLE}12`, border: `1px solid ${PURPLE}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: '0 0 3px' }}>{item.title}</p>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'lodge',      label: 'My Lodge',    IconC: Icons.Home },
  { id: 'feed',       label: 'Feed',        IconC: Icons.Globe },
  { id: 'explore',    label: 'Explore',     IconC: Icons.Compass },
  { id: 'communitik', label: 'Communitik',  IconC: Icons.Zap },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('lodge');

  return (
    <motion.div
      style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: `${NAVY}f2`, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${PURPLE}25`,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <div style={{ padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              <span style={{ color: PURPLE }}>Commun</span><span style={{ color: CREAM }}>itik</span>
            </h1>
            <p style={{ fontSize: 11, color: MUTED, margin: '2px 0 0' }}>Your campus · your people</p>
          </div>
          {user && (
            <Avatar name={`${user.first_name} ${user.last_name}`} size={34} />
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 16px', gap: 0, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? PURPLE : MUTED,
                borderBottom: `2px solid ${activeTab === tab.id ? PURPLE : 'transparent'}`,
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              <span style={{ color: activeTab === tab.id ? PURPLE : MUTED }}><tab.IconC /></span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {activeTab === 'lodge'      && <LodgeGroup user={user} />}
          {activeTab === 'feed'       && <CampusFeed user={user} />}
          {activeTab === 'explore'    && (
            <div style={{ padding: '24px 16px 100px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🗺️</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: CREAM, marginBottom: 8 }}>Explore campuses</p>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, maxWidth: 260, margin: '0 auto 20px' }}>Browse feeds from other Nigerian universities — coming in Phase 2.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['University of Lagos', 'Covenant University', 'UNIPORT', 'OAU Ile-Ife', 'UNIZIK'].map(uni => (
                  <div key={uni} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 14, opacity: 0.5 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${PURPLE}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
                    <span style={{ fontSize: 14, color: CREAM, fontWeight: 500 }}>{uni}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: PURPLE }}>Coming soon</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'communitik' && <CommunitikInfo />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
