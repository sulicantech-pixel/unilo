import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('explore'); // explore, trends, create, groups, profile
  const [selectedUni, setSelectedUni] = useState('all'); // 'all' or specific uni
  const [selectedDept, setSelectedDept] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('post'); // post, story, poll, event

  // Mock data
  const universities = ['University of Lagos', 'Covenant University', 'OAU Ile-Ife', 'UNIPORT', 'UNIZIK'];
  const departments = ['Computer Science', 'Engineering', 'Medicine', 'Law', 'Business'];

  const { data: posts } = useQuery({
    queryKey: ['community-posts', selectedUni, selectedDept],
    queryFn: () => api.get(`/community/posts?uni=${selectedUni}&dept=${selectedDept}`).then((r) => r.data),
  });

  const { data: groups } = useQuery({
    queryKey: ['community-groups'],
    queryFn: () => api.get('/community/groups').then((r) => r.data),
  });

  const { data: trends } = useQuery({
    queryKey: ['community-trends'],
    queryFn: () => api.get('/community/trends').then((r) => r.data),
  });

  // ─── EXPLORE TAB ───────────────────────────────────────────────
  if (activeTab === 'explore') {
    return (
      <div className="min-h-dvh bg-navy pb-24">
        {/* Header with filters */}
        <div className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-4 space-y-3">
          <h1 className="font-display font-bold text-cream text-lg">Community Feed</h1>

          {/* University Selector - Scrollable Dropdown */}
          <div className="relative">
            <label className="text-xs text-muted block mb-1.5">Select University</label>
            <select
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
            >
              <option value="all">All Universities</option>
              {universities.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          </div>

          {/* Department Selector */}
          {selectedUni !== 'all' && (
            <div className="relative">
              <label className="text-xs text-muted block mb-1.5">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-cream text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {posts?.map((post) => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand/20" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-cream">{post.author_name}</span>
                    {post.is_verified && <span className="text-brand text-xs">✓</span>}
                  </div>
                  <span className="text-xs text-muted">{post.university}</span>
                </div>
                <span className="text-xs text-muted">{post.time_ago}</span>
              </div>

              <p className="text-cream text-sm mb-3">{post.content}</p>

              {post.image && <img src={post.image} alt="" className="w-full rounded-lg mb-3" />}
              {post.video_embed && (
                <div className="aspect-video bg-black/50 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-white">▶ Video</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted pt-3 border-t border-white/10">
                <button className="hover:text-brand">❤️ {post.likes}</button>
                <button className="hover:text-brand">💬 {post.comments}</button>
                <button className="hover:text-brand">🔄 {post.shares}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── TRENDS TAB ────────────────────────────────────────────────
  if (activeTab === 'trends') {
    return (
      <div className="min-h-dvh bg-navy pb-24">
        <div className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-4">
          <h1 className="font-display font-bold text-cream text-lg">Trending Now</h1>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {/* Admin Featured Section */}
          <div className="bg-brand/20 border border-brand/40 rounded-lg p-4">
            <span className="text-xs text-brand font-semibold">📌 FEATURED</span>
            <h3 className="text-cream font-semibold mt-1">Housing Crisis: What We Need to Know</h3>
            <p className="text-muted text-sm mt-1">Admin update on new housing regulations</p>
          </div>

          {/* Trending Topics */}
          {trends?.map((trend) => (
            <div key={trend.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-cream font-semibold">#{trend.hashtag}</h3>
                  <p className="text-xs text-muted mt-1">{trend.posts_count} posts • {trend.engagement}</p>
                </div>
                <span className="text-xl">{trend.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── GROUPS TAB ────────────────────────────────────────────────
  if (activeTab === 'groups') {
    return (
      <div className="min-h-dvh bg-navy pb-24">
        <div className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-4 flex items-center gap-3">
          <h1 className="font-display font-bold text-cream text-lg">Groups & Communities</h1>
          <input
            type="text"
            placeholder="Search groups..."
            className="ml-auto flex-1 bg-white/5 border border-white/10 rounded px-3 py-1 text-xs text-cream placeholder-muted"
          />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {/* Personalized Groups First */}
          <div className="text-xs text-muted font-semibold mb-3">👤 YOUR GROUPS</div>
          
          {groups?.recommended?.map((group) => (
            <div key={group.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand/20" />
                <div className="flex-1">
                  <h3 className="text-cream font-semibold">{group.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{group.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span>👥 {group.members}</span>
                    <span>👨 {group.male_ratio}% | 👩 {group.female_ratio}%</span>
                    <span>🏫 {group.universities}</span>
                  </div>
                </div>
                <button className="bg-brand text-navy text-xs px-3 py-1 rounded font-semibold">
                  {group.is_member ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}

          {/* All Groups */}
          <div className="text-xs text-muted font-semibold mb-3 mt-6">🌍 ALL GROUPS</div>
          
          {groups?.all?.map((group) => (
            <div key={group.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <h3 className="text-cream font-semibold">{group.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{group.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span>👥 {group.members}</span>
                    <span>🏫 {group.universities}</span>
                  </div>
                </div>
                <button className="bg-white/10 hover:bg-white/20 text-cream text-xs px-3 py-1 rounded">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── PROFILE TAB ────────────────────────────────────────────────
  if (activeTab === 'profile') {
    return (
      <div className="min-h-dvh bg-navy pb-24">
        <div className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-white/10 px-4 py-4">
          <h1 className="font-display font-bold text-cream text-lg">My Profile</h1>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
          {/* Profile Header */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-brand/20 mx-auto mb-3" />
            <h2 className="text-cream font-semibold text-lg">Your Name</h2>
            <p className="text-muted text-sm">University of Lagos • Computer Science • 200L</p>
            <div className="flex justify-center gap-3 mt-3 text-xs text-muted">
              <span>📝 12 posts</span>
              <span>👥 342 followers</span>
              <span>⭐ Member since Jan 2024</span>
            </div>
          </div>

          {/* Your Posts */}
          <div>
            <h3 className="text-cream font-semibold mb-3">Your Recent Posts</h3>
            {/* Posts would render here */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center text-muted text-sm">
              No posts yet
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-2">
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-cream p-3 rounded text-sm">
              Edit Profile
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-cream p-3 rounded text-sm">
              Notifications & Privacy
            </button>
            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-cream p-3 rounded text-sm">
              Blocked Users
            </button>
            <button className="w-full bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger p-3 rounded text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
