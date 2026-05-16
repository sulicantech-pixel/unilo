/**
 * CommunityPage — Communitik Social Layer
 * Tabs: Feed · Explore · Lodge
 * Brand: dark/purple Unilo palette
 * Icons: SVG only (no emoji in UI chrome)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

// ── Design tokens ─────────────────────────────────────────────────────────────
const P      = '#8b5cf6';   // purple primary
const PD     = '#7c3aed';   // purple dark
const PL     = '#a78bfa';   // purple light
const BRAND  = '#ff6b00';   // orange accent
const NAVY   = '#0a0a0a';
const INK    = '#111111';
const INK2   = '#161616';
const CREAM  = '#f5f0e8';
const MUTED  = 'rgba(245,240,232,0.42)';
const FAINT  = 'rgba(245,240,232,0.18)';
const GLASS  = 'rgba(255,255,255,0.04)';
const WIRE   = 'rgba(255,255,255,0.08)';
const WIRE2  = 'rgba(255,255,255,0.05)';
const SUCCESS = '#10b981';
const DANGER  = '#ef4444';

// ── SVG Icon library ──────────────────────────────────────────────────────────
const Icon = {
  Feed: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11a9 9 0 019 9"/><path d="M4 4a16 16 0 0116 16"/><circle cx="5" cy="19" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  Explore: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  ),
  Lodge: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Send: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Heart: ({ size = 15, filled }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  Comment: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Share: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Alert: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Lock: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  ),
  Check: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Plus: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Users: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Flame: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
    </svg>
  ),
  Pin: ({ size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Globe: ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  ),
  Verified: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={P} stroke="none">
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
      <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  ChevronRight: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Image: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Megaphone: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

const UNIV_COLORS = [P, '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6', '#8b5cf6'];
function uniColor(name = '') {
  const code = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return UNIV_COLORS[code % UNIV_COLORS.length];
}

function Avatar({ name = '?', size = 36, color }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const c = color || uniColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${c}20`, border: `1.5px solid ${c}45`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 800, color: c,
      fontFamily: 'Syne, sans-serif', flexShrink: 0, letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  );
}

// Seeded demo posts so Feed is never empty on first load
const SEED_POSTS = [
  {
    id: 'seed-1', author_name: 'Tolu Adeyemi', university: 'UNILAG', is_verified: true,
    content: 'Just found out about a free AWS cloud scholarship for Nigerian students — deadline is June 30. Check the link in the UNILAG community group. Tag a coursemate who needs this.',
    likes: 47, comments: 12, shares: 23, created_at: new Date(Date.now() - 3600 * 2 * 1000).toISOString(), is_seed: true,
  },
  {
    id: 'seed-2', author_name: 'Chisom Eze', university: 'FUTO', is_verified: true,
    content: 'Mechanical Engineering final year project defense is tomorrow and I still haven\'t slept. Someone send help and indomie.',
    likes: 134, comments: 41, shares: 8, created_at: new Date(Date.now() - 3600 * 5 * 1000).toISOString(), is_seed: true,
  },
  {
    id: 'seed-3', author_name: 'Fatima Bello', university: 'ABU Zaria', is_verified: true,
    content: 'The new library annex in ABU is finally open and it has AC. I repeat — the library has AC. I might just live here until finals.',
    likes: 89, comments: 27, shares: 15, created_at: new Date(Date.now() - 3600 * 9 * 1000).toISOString(), is_seed: true,
  },
  {
    id: 'seed-4', author_name: 'Emeka Okonkwo', university: 'UNN', is_verified: false,
    content: 'Anybody selling Thermodynamics 300L textbook? Preferably not too highlighted. DM me.',
    likes: 6, comments: 18, shares: 2, created_at: new Date(Date.now() - 3600 * 14 * 1000).toISOString(), is_seed: true,
  },
  {
    id: 'seed-5', author_name: 'Sade Oluwatobi', university: 'Covenant University', is_verified: true,
    content: 'Reminder that the inter-uni hackathon registrations close this Friday. Teams of 2–4. Prize pool is ₦500k. Covenant, UNILAG, FUTO all eligible. Who\'s building?',
    likes: 203, comments: 64, shares: 98, created_at: new Date(Date.now() - 3600 * 22 * 1000).toISOString(), is_seed: true,
  },
];

const EXPLORE_CAMPUSES = [
  { name: 'University of Lagos', short: 'UNILAG', city: 'Lagos', waiting: 312, active: true },
  { name: 'FUTO', short: 'FUTO', city: 'Owerri', waiting: 187, active: true },
  { name: 'Covenant University', short: 'CU', city: 'Ota', waiting: 241, active: true },
  { name: 'Ahmadu Bello University', short: 'ABU', city: 'Zaria', waiting: 143, active: false },
  { name: 'University of Nigeria', short: 'UNN', city: 'Nsukka', waiting: 98, active: false },
  { name: 'OAU Ile-Ife', short: 'OAU', city: 'Ile-Ife', waiting: 176, active: false },
  { name: 'UNIPORT', short: 'UNIPORT', city: 'Port Harcourt', waiting: 89, active: false },
  { name: 'UNIZIK', short: 'UNIZIK', city: 'Awka', waiting: 64, active: false },
];

// ── FEED TAB ─────────────────────────────────────────────────────────────────
function FeedTab({ user }) {
  const qc = useQueryClient();
  const [composeOpen, setComposeOpen] = useState(false);
  const [postText, setPostText] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [likedIds, setLikedIds] = useState(new Set());
  const textareaRef = useRef(null);

  const { data: rawPosts = [], isLoading } = useQuery({
    queryKey: ['campus-feed'],
    queryFn: () => api.get('/community/posts').then(r => r.data?.posts ?? []).catch(() => []),
  });

  const posts = rawPosts.length > 0 ? rawPosts : SEED_POSTS;

  const createPost = useMutation({
    mutationFn: body => api.post('/community/posts', body),
    onSuccess: () => { qc.invalidateQueries(['campus-feed']); setPostText(''); setComposeOpen(false); },
  });

  const likePost = useMutation({
    mutationFn: id => api.post(`/community/posts/${id}/like`),
    onMutate: id => {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
  });

  useEffect(() => {
    if (composeOpen && textareaRef.current) textareaRef.current.focus();
  }, [composeOpen]);

  const handleKey = useCallback(e => {
    if (e.key === 'Escape') setComposeOpen(false);
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div style={{ paddingBottom: 90 }}>

      {/* Compose bar */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${WIRE}`, background: INK }}>
        <div onClick={() => setComposeOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <Avatar name={user ? `${user.first_name} ${user.last_name}` : 'Guest'} size={36} />
          <div style={{
            flex: 1, background: GLASS, border: `1px solid ${WIRE}`,
            borderRadius: 22, padding: '10px 16px',
            fontSize: 14, color: FAINT, fontFamily: 'DM Sans, sans-serif',
            transition: 'border-color 0.15s',
          }}>
            What's happening on campus?
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `${P}18`, border: `1px solid ${P}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: P, flexShrink: 0,
          }}>
            <Icon.Image size={16} />
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', borderBottom: `1px solid ${WIRE}` }}>
        {['For You', 'Trending', 'UNILAG', 'FUTO', 'Covenant'].map((f, i) => (
          <button key={f} style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            background: i === 0 ? P : GLASS,
            border: `1px solid ${i === 0 ? P : WIRE}`,
            color: i === 0 ? '#fff' : MUTED,
            transition: 'all 0.15s',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div>
        {isLoading ? (
          [...Array(3)].map((_, i) => <PostSkeleton key={i} />)
        ) : (
          posts.map((post, i) => (
            <PostCard
              key={post.id || i}
              post={post}
              index={i}
              liked={likedIds.has(post.id)}
              onLike={() => !post.is_seed && likePost.mutate(post.id)}
            />
          ))
        )}
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 70, display: 'flex', alignItems: 'flex-end' }}
            onClick={() => setComposeOpen(false)}>
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', background: INK2, borderRadius: '24px 24px 0 0',
                border: `1px solid ${WIRE}`, borderBottom: 'none',
                padding: '20px 20px 40px',
              }}>

              {/* Handle */}
              <div style={{ width: 36, height: 4, background: WIRE, borderRadius: 2, margin: '0 auto 18px' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: CREAM }}>New post</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Anon toggle */}
                  <button onClick={() => setIsAnon(a => !a)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 99,
                    background: isAnon ? `${P}20` : GLASS,
                    border: `1px solid ${isAnon ? P : WIRE}`,
                    color: isAnon ? PL : MUTED, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                  }}>
                    <Icon.Globe size={12} />
                    {isAnon ? 'Anonymous' : 'Public'}
                  </button>
                  <button onClick={() => setComposeOpen(false)} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: GLASS, border: `1px solid ${WIRE}`,
                    color: MUTED, fontSize: 16, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Avatar name={isAnon ? '??' : (user ? `${user.first_name} ${user.last_name}` : 'You')} size={38} color={isAnon ? MUTED : undefined} />
                <textarea
                  ref={textareaRef}
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                  placeholder={`What's happening near ${user?.university || 'your campus'}?`}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: CREAM, fontSize: 15, fontFamily: 'DM Sans, sans-serif',
                    resize: 'none', minHeight: 100, lineHeight: 1.65,
                    caretColor: P,
                  }}
                />
              </div>

              {/* Character count + submit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${WIRE}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: FAINT }}>{user?.university || 'Campus'}</span>
                  {/* Circular progress for char limit */}
                  <svg width="22" height="22" viewBox="0 0 22 22">
                    <circle cx="11" cy="11" r="9" fill="none" stroke={WIRE} strokeWidth="2"/>
                    <circle cx="11" cy="11" r="9" fill="none"
                      stroke={postText.length > 240 ? DANGER : P}
                      strokeWidth="2" strokeDasharray={`${Math.min(postText.length / 280 * 56.5, 56.5)} 56.5`}
                      strokeLinecap="round" transform="rotate(-90 11 11)"
                      style={{ transition: 'stroke-dasharray 0.2s' }}
                    />
                  </svg>
                </div>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => postText.trim() && createPost.mutate({ content: postText, university: user?.university, is_anonymous: isAnon })}
                  disabled={!postText.trim() || createPost.isPending}
                  style={{
                    background: postText.trim() ? P : `${P}40`,
                    color: '#fff', border: 'none', borderRadius: 22,
                    padding: '10px 22px', fontSize: 14, fontWeight: 700,
                    cursor: postText.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s',
                  }}>
                  {createPost.isPending ? 'Posting…' : 'Post'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div style={{ padding: '16px', borderBottom: `1px solid ${WIRE}`, display: 'flex', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: WIRE2, flexShrink: 0, animation: 'comm-pulse 1.6s ease infinite' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 10, width: '35%', background: WIRE2, borderRadius: 6, marginBottom: 8, animation: 'comm-pulse 1.6s ease infinite' }} />
        <div style={{ height: 13, width: '90%', background: WIRE2, borderRadius: 6, marginBottom: 5, animation: 'comm-pulse 1.6s ease infinite 0.1s' }} />
        <div style={{ height: 13, width: '70%', background: WIRE2, borderRadius: 6, animation: 'comm-pulse 1.6s ease infinite 0.2s' }} />
      </div>
    </div>
  );
}

function PostCard({ post, index, liked, onLike }) {
  const [localLiked, setLocalLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setLocalLiked(l => !l);
    setLikeCount(c => localLiked ? c - 1 : c + 1);
    onLike();
  };

  const col = uniColor(post.university);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: '16px 16px', borderBottom: `1px solid ${WIRE}` }}>

      <div style={{ display: 'flex', gap: 11, marginBottom: 10 }}>
        <Avatar name={post.is_anonymous ? 'Anon' : post.author_name} size={40} color={post.is_anonymous ? MUTED : undefined} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: CREAM, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>
              {post.is_anonymous ? 'Anonymous' : post.author_name}
            </span>
            {post.is_verified && <Icon.Verified size={14} />}
            {post.university && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                color: col, background: `${col}18`,
                padding: '2px 8px', borderRadius: 99,
                border: `1px solid ${col}30`,
              }}>
                {post.university}
              </span>
            )}
            <span style={{ fontSize: 11, color: FAINT, marginLeft: 'auto' }}>{timeAgo(post.created_at)}</span>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 14.5, color: CREAM, lineHeight: 1.65, margin: '0 0 14px', paddingLeft: 51 }}>
        {post.content}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, paddingLeft: 51 }}>
        {[
          {
            icon: <Icon.Heart size={15} filled={localLiked} />,
            count: likeCount, action: handleLike,
            active: localLiked, activeColor: '#f43f5e',
          },
          { icon: <Icon.Comment size={15} />, count: post.comments || 0, action: () => {} },
          { icon: <Icon.Share size={15} />, count: post.shares || 0, action: () => {} },
        ].map(({ icon, count, action, active, activeColor }, i) => (
          <motion.button key={i} onClick={action} whileTap={{ scale: 0.85 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', borderRadius: 22,
              background: active ? `${activeColor}15` : 'none',
              border: 'none', cursor: 'pointer',
              fontSize: 13, color: active ? activeColor : MUTED,
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.15s',
            }}>
            {icon}
            {count > 0 && <span style={{ fontWeight: 600 }}>{count > 999 ? `${(count / 1000).toFixed(1)}k` : count}</span>}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── EXPLORE TAB ───────────────────────────────────────────────────────────────
function ExploreTab({ user }) {
  const [joined, setJoined] = useState(new Set());
  const total = EXPLORE_CAMPUSES.reduce((a, c) => a + c.waiting, 0);

  return (
    <div style={{ paddingBottom: 90 }}>

      {/* Hero banner */}
      <div style={{
        margin: '16px', borderRadius: 20, overflow: 'hidden',
        background: `linear-gradient(135deg, ${PD}22 0%, ${P}10 50%, transparent 100%)`,
        border: `1px solid ${P}30`, padding: '22px 20px',
        position: 'relative',
      }}>
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 120, height: 120,
          borderRadius: '50%', background: `${P}18`, filter: 'blur(30px)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: SUCCESS, boxShadow: `0 0 6px ${SUCCESS}` }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: SUCCESS, letterSpacing: '0.08em' }}>LIVE ACROSS AFRICA</span>
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 900, color: CREAM, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {total.toLocaleString()}+ students<br />already waiting
          </p>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            Join your campus feed. Be part of the first African student network.
          </p>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon.Flame size={14} />
        <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.08em' }}>CAMPUSES</span>
      </div>

      {/* Campus list */}
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {EXPLORE_CAMPUSES.map((campus, i) => {
          const col = uniColor(campus.short);
          const pct = Math.min((campus.waiting / 350) * 100, 100);
          const isJoined = joined.has(campus.name);
          const isUnlocked = campus.active;

          return (
            <motion.div
              key={campus.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{
                padding: '14px 16px', borderRadius: 16,
                background: isUnlocked ? `${col}08` : GLASS,
                border: `1px solid ${isUnlocked ? `${col}25` : WIRE}`,
                opacity: isUnlocked ? 1 : 0.75,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Badge */}
                <div style={{
                  width: 42, height: 42, borderRadius: 13,
                  background: `${col}18`, border: `1px solid ${col}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 900, color: col }}>{campus.short.slice(0, 2)}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: CREAM, fontFamily: 'Syne, sans-serif' }}>{campus.name}</span>
                    {isUnlocked && (
                      <span style={{ fontSize: 9, fontWeight: 800, color: SUCCESS, background: `${SUCCESS}18`, padding: '2px 7px', borderRadius: 99, letterSpacing: '0.06em' }}>LIVE</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: WIRE, borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
                        style={{ height: '100%', background: isUnlocked ? col : MUTED, borderRadius: 99 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: isUnlocked ? col : MUTED, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {campus.waiting} waiting
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setJoined(prev => { const n = new Set(prev); isJoined ? n.delete(campus.name) : n.add(campus.name); return n; })}
                  style={{
                    padding: '7px 14px', borderRadius: 22, flexShrink: 0,
                    background: isJoined ? `${col}20` : isUnlocked ? col : GLASS,
                    border: `1px solid ${isJoined ? col : isUnlocked ? col : WIRE}`,
                    color: isJoined ? col : isUnlocked ? '#fff' : MUTED,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                  }}>
                  {isJoined ? 'Joined' : isUnlocked ? 'Join' : 'Notify me'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ margin: '20px 16px', padding: '20px', borderRadius: 18, background: `${P}12`, border: `1px solid ${P}25`, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: CREAM, margin: '0 0 6px' }}>
          Don't see your campus?
        </p>
        <p style={{ fontSize: 13, color: MUTED, margin: '0 0 14px' }}>
          Request it and we'll launch when 50 students sign up.
        </p>
        <motion.button whileTap={{ scale: 0.95 }}
          style={{
            background: P, color: '#fff', border: 'none',
            borderRadius: 22, padding: '10px 24px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}>
          Request your campus
        </motion.button>
      </div>
    </div>
  );
}

// ── LODGE TAB ─────────────────────────────────────────────────────────────────
function LodgeTab({ user }) {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [complaint, setComplaint] = useState(false);
  const [compText, setCompText] = useState('');
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  if (!lodge) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 28px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: `${P}12`, border: `1px solid ${P}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, color: P,
        }}>
          <Icon.Lodge size={36} />
        </div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: CREAM, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          No lodge yet
        </h3>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, maxWidth: 270, margin: '0 0 24px' }}>
          Book a room on Unilo and you'll be added to your lodge's private group — connect with neighbours, caretaker, and landlord all in one place.
        </p>
        <motion.button whileTap={{ scale: 0.94 }}
          onClick={() => window.location.href = '/search'}
          style={{
            background: P, color: '#fff', border: 'none',
            borderRadius: 22, padding: '13px 28px',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: `0 8px 24px ${P}40`,
          }}>
          Find a room
        </motion.button>
        <p style={{ fontSize: 12, color: FAINT, marginTop: 16 }}>Verified Unilo rooms only</p>
      </div>
    );
  }

  const dailyUsed = parseInt(lodge.daily_messages_used || 0);
  const dailyLimit = 2;
  const isLandlord = user?.role === 'user_admin' || user?.role === 'head_admin' || lodge.is_caretaker;
  const canSend = isLandlord || dailyUsed < dailyLimit;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 130px)' }}>

      {/* Lodge header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${WIRE}`, background: `${P}06`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, height: 46, borderRadius: 15, background: `${P}18`, border: `1px solid ${P}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P, flexShrink: 0 }}>
            <Icon.Lodge size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: CREAM, margin: 0, letterSpacing: '-0.01em' }}>{lodge.name || 'My Lodge'}</p>
            <p style={{ fontSize: 12, color: MUTED, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon.Pin size={11} />{lodge.city} · {lodge.member_count || 0} residents
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: P, background: `${P}15`, border: `1px solid ${P}30`, borderRadius: 99, padding: '4px 10px' }}>
            <Icon.Lock size={11} /> Private
          </div>
        </div>

        {!isLandlord && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: MUTED }}>Daily messages</span>
              <span style={{ fontSize: 11, color: dailyUsed >= dailyLimit ? DANGER : P, fontWeight: 700 }}>
                {dailyUsed}/{dailyLimit}
              </span>
            </div>
            <div style={{ height: 3, background: WIRE, borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${(dailyUsed / dailyLimit) * 100}%` }}
                style={{ height: '100%', background: dailyUsed >= dailyLimit ? DANGER : P, borderRadius: 99 }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {dailyUsed >= dailyLimit && (
              <p style={{ fontSize: 11, color: DANGER, marginTop: 5 }}>
                Limit reached · <span style={{ color: BRAND, cursor: 'pointer', fontWeight: 600 }}>Buy credits</span> for more
              </p>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: WIRE2, flexShrink: 0, animation: 'comm-pulse 1.6s ease infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 9, width: '28%', background: WIRE2, borderRadius: 5, marginBottom: 6, animation: 'comm-pulse 1.6s ease infinite' }} />
                <div style={{ height: 34, width: '75%', background: WIRE2, borderRadius: 12, animation: 'comm-pulse 1.6s ease infinite 0.1s' }} />
              </div>
            </div>
          ))
        ) : msgs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: MUTED }}>
            <div style={{ color: `${P}60`, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Icon.Comment size={40} /></div>
            <p style={{ fontSize: 14, fontWeight: 600, color: CREAM, margin: '0 0 6px' }}>All quiet here</p>
            <p style={{ fontSize: 13, color: MUTED }}>Be the first to say hello to your neighbours.</p>
          </div>
        ) : msgs.map(msg => {
          const isMe = msg.user_id === user?.id;
          const isAnnounce = msg.type === 'announcement';
          const isComplaint = msg.type === 'complaint';
          return (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              {!isMe && <Avatar name={msg.sender_name} size={30} color={isAnnounce ? BRAND : P} />}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && (
                  <p style={{ fontSize: 10, color: MUTED, margin: '0 0 3px', paddingLeft: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {msg.sender_name}
                    {isAnnounce && <span style={{ fontSize: 9, background: `${BRAND}20`, color: BRAND, padding: '1px 6px', borderRadius: 99, fontWeight: 700, letterSpacing: '0.04em' }}>LANDLORD</span>}
                    {isComplaint && <span style={{ fontSize: 9, background: `${DANGER}15`, color: DANGER, padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>COMPLAINT</span>}
                  </p>
                )}
                <div style={{
                  padding: '10px 13px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : isAnnounce ? '4px 18px 18px 18px' : '18px 18px 18px 4px',
                  background: isMe ? `${P}25` : isAnnounce ? `${BRAND}12` : isComplaint ? `${DANGER}10` : GLASS,
                  border: `1px solid ${isMe ? `${P}40` : isAnnounce ? `${BRAND}28` : isComplaint ? `${DANGER}25` : WIRE}`,
                }}>
                  {isAnnounce && (
                    <p style={{ fontSize: 9, fontWeight: 800, color: BRAND, margin: '0 0 4px', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon.Pin size={9} /> ANNOUNCEMENT
                    </p>
                  )}
                  {isComplaint && (
                    <p style={{ fontSize: 9, fontWeight: 800, color: DANGER, margin: '0 0 4px', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon.Alert size={9} /> COMPLAINT
                    </p>
                  )}
                  <p style={{ fontSize: 14, color: CREAM, margin: 0, lineHeight: 1.55 }}>{msg.content}</p>
                  {msg.resolved && (
                    <p style={{ fontSize: 10, color: SUCCESS, margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Icon.Check size={10} /> Resolved
                    </p>
                  )}
                </div>
                <p style={{ fontSize: 10, color: `${CREAM}28`, margin: '3px 0 0', textAlign: isMe ? 'right' : 'left', paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Complaint form */}
      <AnimatePresence>
        {complaint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', padding: '12px 16px', background: `${DANGER}06`, borderTop: `1px solid ${DANGER}20`, flexShrink: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DANGER, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon.Alert size={13} /> File a complaint — always free
            </p>
            <textarea value={compText} onChange={e => setCompText(e.target.value)}
              placeholder="Describe the issue (water, electricity, security, maintenance…)"
              style={{ width: '100%', background: `${DANGER}08`, border: `1px solid ${DANGER}25`, borderRadius: 12, padding: '10px 13px', color: CREAM, fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'none', minHeight: 72, lineHeight: 1.6 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => { setComplaint(false); setCompText(''); }}
                style={{ flex: 1, background: 'none', border: `1px solid ${WIRE}`, borderRadius: 12, padding: '10px', fontSize: 13, color: MUTED, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                Cancel
              </button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => compText.trim() && sendComplaint.mutate({ content: compText, type: 'complaint' })}
                disabled={!compText.trim() || sendComplaint.isPending}
                style={{ flex: 2, background: `${DANGER}80`, border: 'none', borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                {sendComplaint.isPending ? 'Sending…' : 'Submit complaint'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${WIRE}`, flexShrink: 0, background: INK2, paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
        {canSend ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setComplaint(c => !c)}
              style={{ width: 38, height: 38, borderRadius: 12, background: complaint ? `${DANGER}20` : GLASS, border: `1px solid ${complaint ? `${DANGER}40` : WIRE}`, color: complaint ? DANGER : MUTED, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
              title="File complaint">
              <Icon.Alert size={15} />
            </motion.button>
            <div style={{ flex: 1, background: GLASS, border: `1px solid ${WIRE}`, borderRadius: 22, padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && text.trim()) { e.preventDefault(); sendMsg.mutate({ content: text }); } }}
                placeholder="Say something to your neighbours…"
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: CREAM, fontSize: 14, fontFamily: 'DM Sans, sans-serif', caretColor: P }} />
            </div>
            <motion.button whileTap={{ scale: 0.88 }}
              onClick={() => text.trim() && sendMsg.mutate({ content: text })}
              disabled={!text.trim() || sendMsg.isPending}
              style={{ width: 40, height: 40, borderRadius: '50%', background: text.trim() ? P : WIRE2, border: 'none', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s', boxShadow: text.trim() ? `0 4px 14px ${P}50` : 'none' }}>
              <Icon.Send size={16} />
            </motion.button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: WIRE2, border: `1px solid ${WIRE}`, borderRadius: 14 }}>
            <Icon.Lock size={13} />
            <p style={{ fontSize: 13, color: MUTED, flex: 1, margin: 0 }}>Daily limit reached (2 messages/day)</p>
            <button style={{ fontSize: 12, fontWeight: 700, color: BRAND, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
              Buy credits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TABS config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'feed',    label: 'Feed',    IC: Icon.Feed },
  { id: 'explore', label: 'Explore', IC: Icon.Explore },
  { id: 'lodge',   label: 'Lodge',   IC: Icon.Lodge },
];

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <motion.div
      style={{ minHeight: '100dvh', background: NAVY, fontFamily: 'DM Sans, sans-serif' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}>

      <style>{`
        @keyframes comm-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: `${NAVY}f0`, backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${P}20`,
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        <div style={{ padding: '0 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
              <span style={{ color: P }}>Commun</span><span style={{ color: CREAM }}>itik</span>
            </h1>
            <p style={{ fontSize: 11, color: FAINT, margin: '3px 0 0', letterSpacing: '0.02em' }}>your campus · your people</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Online indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: `${SUCCESS}12`, border: `1px solid ${SUCCESS}25` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: SUCCESS, boxShadow: `0 0 5px ${SUCCESS}` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: SUCCESS }}>LIVE</span>
            </div>
            {user && <Avatar name={`${user.first_name} ${user.last_name}`} size={34} />}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', padding: '4px 16px 0' }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? P : MUTED,
                  borderBottom: `2px solid ${active ? P : 'transparent'}`,
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                  position: 'relative',
                }}>
                <span style={{ color: active ? P : MUTED, transition: 'color 0.15s' }}>
                  <tab.IC size={16} />
                </span>
                {tab.label}
                {tab.id === 'lodge' && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: P, position: 'absolute', top: 8, right: 8 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}>
          {activeTab === 'feed'    && <FeedTab user={user} />}
          {activeTab === 'explore' && <ExploreTab user={user} />}
          {activeTab === 'lodge'   && <LodgeTab user={user} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
