import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { COLORS, STYLES, ANIMATIONS, TYPOGRAPHY } from '../utils/designSystem';

const COMMUNITY_COLORS = {
  primary: '#8b5cf6',
  primaryDark: '#7c3aed',
  primaryLight: '#a78bfa',
  navy: '#0a0a0a',
  cream: '#f5f5f5',
};

export default function CommunityPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'explore');
  const [selectedUni, setSelectedUni] = useState('all');

  const universities = ['University of Lagos', 'Covenant University', 'OAU Ile-Ife', 'UNIPORT', 'UNIZIK'];

  const { data: posts } = useQuery({
    queryKey: ['community-posts', selectedUni, activeTab],
    queryFn: () =>
      api
        .get(`/community/posts?uni=${selectedUni}`)
        .then((r) => r.data)
        .catch(() => ({ posts: [] })),
  });

  const { data: groups } = useQuery({
    queryKey: ['community-groups'],
    queryFn: () =>
      api
        .get('/community/groups')
        .then((r) => r.data)
        .catch(() => ({ groups: [] })),
  });

  const { data: trends } = useQuery({
    queryKey: ['community-trends'],
    queryFn: () =>
      api
        .get('/community/trends')
        .then((r) => r.data)
        .catch(() => ({ trends: [] })),
  });

  const tabs = [
    { id: 'explore', label: 'Explore' },
    { id: 'trends', label: 'Trends' },
    { id: 'groups', label: 'Groups' },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <motion.main
      className="min-h-dvh pb-32"
      style={{ backgroundColor: COMMUNITY_COLORS.navy }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ─── HEADER WITH BACK BUTTON ────────────────────────────────────────── */}
      <motion.div
        className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center gap-3 border-b"
        style={{
          backgroundColor: `${COMMUNITY_COLORS.primary}15`,
          borderColor: `${COMMUNITY_COLORS.primary}30`,
          backdropFilter: 'blur(10px)',
        }}
        variants={ANIMATIONS.slideDownFade}
      >
        <motion.button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg transition-all"
          style={{
            backgroundColor: `${COMMUNITY_COLORS.primary}20`,
            color: COMMUNITY_COLORS.primary,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ← Back
        </motion.button>
        <div className="flex-1">
          <h1 className={`${TYPOGRAPHY.h3}`} style={{ color: COMMUNITY_COLORS.cream }}>
            Community
          </h1>
          <p className={`${TYPOGRAPHY.caption}`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
            Connect, share & discover
          </p>
        </div>
      </motion.div>

      {/* ─── TABS ──────────────────────────────────────────────────────────────── */}
      <motion.div
        className="sticky top-16 z-30 px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b"
        style={{
          backgroundColor: `${COMMUNITY_COLORS.primary}08`,
          borderColor: `${COMMUNITY_COLORS.primary}20`,
        }}
        variants={ANIMATIONS.slideDownFade}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: activeTab === tab.id ? COMMUNITY_COLORS.primary : 'transparent',
              color: activeTab === tab.id ? COMMUNITY_COLORS.navy : COMMUNITY_COLORS.cream,
              borderColor: activeTab === tab.id ? 'transparent' : `${COMMUNITY_COLORS.primary}30`,
              borderWidth: '1px',
            }}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* ─── CONTENT AREAS ──────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* EXPLORE TAB */}
        {activeTab === 'explore' && (
          <motion.div
            variants={ANIMATIONS.staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {/* University Selector */}
            <motion.div variants={ANIMATIONS.staggerItem}>
              <label className={`${TYPOGRAPHY.label} block mb-2`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                Select University
              </label>
              <select
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
                className={`w-full ${STYLES.inputBase}`}
                style={{
                  backgroundColor: `${COMMUNITY_COLORS.primary}10`,
                  borderColor: `${COMMUNITY_COLORS.primary}30`,
                  color: COMMUNITY_COLORS.cream,
                }}
              >
                <option value="all" style={{ color: COMMUNITY_COLORS.navy }}>
                  All Universities
                </option>
                {universities.map((uni) => (
                  <option key={uni} value={uni} style={{ color: COMMUNITY_COLORS.navy }}>
                    {uni}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Posts */}
            {posts?.length === 0 ? (
              <motion.div
                className="text-center py-12"
                variants={ANIMATIONS.slideUpFade}
              >
                <div className="text-4xl mb-3">📭</div>
                <p style={{ color: COMMUNITY_COLORS.cream }}>No posts yet</p>
              </motion.div>
            ) : (
              posts?.map((post, idx) => (
                <motion.div
                  key={post.id}
                  className={`${STYLES.cardBase} p-4 sm:p-6`}
                  style={{
                    backgroundColor: `${COMMUNITY_COLORS.primary}08`,
                    borderColor: `${COMMUNITY_COLORS.primary}20`,
                  }}
                  variants={ANIMATIONS.staggerItem}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: `${COMMUNITY_COLORS.primary}40` }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`${TYPOGRAPHY.body} font-semibold`} style={{ color: COMMUNITY_COLORS.cream }}>
                          {post.author_name}
                        </span>
                        {post.is_verified && (
                          <span style={{ color: COMMUNITY_COLORS.primary }}>✓</span>
                        )}
                      </div>
                      <span className={`${TYPOGRAPHY.caption}`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                        {post.university}
                      </span>
                    </div>
                    <span className={`${TYPOGRAPHY.caption}`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                      {post.time_ago}
                    </span>
                  </div>

                  <p className={`${TYPOGRAPHY.body} mb-3`} style={{ color: COMMUNITY_COLORS.cream }}>
                    {post.content}
                  </p>

                  <div className="flex gap-4 text-sm" style={{ color: COMMUNITY_COLORS.primaryLight }}>
                    <button className="hover:scale-110 transition">❤️ {post.likes}</button>
                    <button className="hover:scale-110 transition">💬 {post.comments}</button>
                    <button className="hover:scale-110 transition">🔄 {post.shares}</button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* TRENDS TAB */}
        {activeTab === 'trends' && (
          <motion.div
            variants={ANIMATIONS.staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {/* Admin Featured */}
            <motion.div
              className={`${STYLES.cardBase} p-4 sm:p-6`}
              style={{
                backgroundColor: `${COMMUNITY_COLORS.primary}20`,
                borderColor: `${COMMUNITY_COLORS.primary}40`,
              }}
              variants={ANIMATIONS.staggerItem}
            >
              <span className="text-xs font-semibold" style={{ color: COMMUNITY_COLORS.primary }}>
                📌 FEATURED
              </span>
              <h3 className={`${TYPOGRAPHY.h4} mt-1`} style={{ color: COMMUNITY_COLORS.cream }}>
                Housing Crisis: What We Need to Know
              </h3>
              <p className={`${TYPOGRAPHY.bodySmall} mt-1`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                Admin update on new housing regulations
              </p>
            </motion.div>

            {/* Trending Topics */}
            {trends?.length === 0 ? (
              <motion.div
                className="text-center py-12"
                variants={ANIMATIONS.slideUpFade}
              >
                <div className="text-4xl mb-3">📊</div>
                <p style={{ color: COMMUNITY_COLORS.cream }}>No trends yet</p>
              </motion.div>
            ) : (
              trends?.map((trend) => (
                <motion.div
                  key={trend.id}
                  className={`${STYLES.cardBase} p-4 sm:p-6 hover:scale-105 cursor-pointer`}
                  style={{
                    backgroundColor: `${COMMUNITY_COLORS.primary}08`,
                    borderColor: `${COMMUNITY_COLORS.primary}20`,
                  }}
                  variants={ANIMATIONS.staggerItem}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`${TYPOGRAPHY.h4}`} style={{ color: COMMUNITY_COLORS.cream }}>
                        #{trend.hashtag}
                      </h3>
                      <p className={`${TYPOGRAPHY.caption} mt-1`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                        {trend.posts_count} posts • {trend.engagement}
                      </p>
                    </div>
                    <span className="text-2xl">{trend.emoji}</span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* GROUPS TAB */}
        {activeTab === 'groups' && (
          <motion.div
            variants={ANIMATIONS.staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <motion.div variants={ANIMATIONS.staggerItem}>
              <input
                type="text"
                placeholder="Search groups..."
                className={`w-full ${STYLES.inputBase}`}
                style={{
                  backgroundColor: `${COMMUNITY_COLORS.primary}10`,
                  borderColor: `${COMMUNITY_COLORS.primary}30`,
                  color: COMMUNITY_COLORS.cream,
                }}
              />
            </motion.div>

            {groups?.length === 0 ? (
              <motion.div
                className="text-center py-12"
                variants={ANIMATIONS.slideUpFade}
              >
                <div className="text-4xl mb-3">👥</div>
                <p style={{ color: COMMUNITY_COLORS.cream }}>No groups yet</p>
              </motion.div>
            ) : (
              groups?.map((group) => (
                <motion.div
                  key={group.id}
                  className={`${STYLES.cardBase} p-4 sm:p-6`}
                  style={{
                    backgroundColor: `${COMMUNITY_COLORS.primary}08`,
                    borderColor: `${COMMUNITY_COLORS.primary}20`,
                  }}
                  variants={ANIMATIONS.staggerItem}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: `${COMMUNITY_COLORS.primary}40` }} />
                    <div className="flex-1">
                      <h3 className={`${TYPOGRAPHY.h4}`} style={{ color: COMMUNITY_COLORS.cream }}>
                        {group.name}
                      </h3>
                      <p className={`${TYPOGRAPHY.bodySmall} mt-1`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                        {group.description}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs" style={{ color: COMMUNITY_COLORS.primaryLight }}>
                        <span>👥 {group.members}</span>
                        <span>🏫 {group.universities}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <motion.div
            variants={ANIMATIONS.staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {/* Profile Header */}
            <motion.div
              className={`${STYLES.cardBase} p-6 text-center`}
              style={{
                backgroundColor: `${COMMUNITY_COLORS.primary}10`,
                borderColor: `${COMMUNITY_COLORS.primary}30`,
              }}
              variants={ANIMATIONS.staggerItem}
            >
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3"
                style={{ backgroundColor: `${COMMUNITY_COLORS.primary}40` }}
              />
              <h2 className={`${TYPOGRAPHY.h3}`} style={{ color: COMMUNITY_COLORS.cream }}>
                Your Name
              </h2>
              <p className={`${TYPOGRAPHY.bodySmall} mt-1`} style={{ color: COMMUNITY_COLORS.primaryLight }}>
                University of Lagos • CS • 200L
              </p>
              <div className="flex justify-center gap-3 mt-3 text-sm" style={{ color: COMMUNITY_COLORS.primaryLight }}>
                <span>📝 12 posts</span>
                <span>👥 342 followers</span>
              </div>
            </motion.div>

            {/* Settings */}
            {['Edit Profile', 'Notifications', 'Blocked Users', 'Sign Out'].map((item, idx) => (
              <motion.button
                key={item}
                className={`w-full ${STYLES.cardBase} p-4 text-left font-medium`}
                style={{
                  backgroundColor: `${COMMUNITY_COLORS.primary}08`,
                  borderColor: `${COMMUNITY_COLORS.primary}20`,
                  color: COMMUNITY_COLORS.cream,
                }}
                variants={ANIMATIONS.staggerItem}
                whileHover={{ x: 4 }}
              >
                {item}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Floating Create Button */}
      {activeTab === 'explore' && (
        <motion.button
          className="fixed bottom-28 right-6 w-14 h-14 rounded-full font-bold text-2xl shadow-lg"
          style={{
            backgroundColor: COMMUNITY_COLORS.primary,
            color: COMMUNITY_COLORS.navy,
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ➕
        </motion.button>
      )}
    </motion.main>
  );
}
