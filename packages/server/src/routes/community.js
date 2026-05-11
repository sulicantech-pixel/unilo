/**
 * Community routes
 * GET  /api/community/my-lodge              — get user's lodge group
 * GET  /api/community/lodge/:id/messages   — get messages
 * POST /api/community/lodge/:id/messages   — send message (2/day limit)
 * POST /api/community/lodge/:id/complaints — file complaint (always free)
 * GET  /api/community/posts                — campus feed posts
 * POST /api/community/posts                — create post
 * POST /api/community/posts/:id/like       — like a post
 */
const router  = require('express').Router();
const { Op }  = require('sequelize');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { User, Listing, sequelize } = require('../models');

// ── Helper: ensure community tables exist ─────────────────────────────────────
async function ensureTables() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS lodge_groups (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id   UUID REFERENCES listings(id) ON DELETE CASCADE,
      name         VARCHAR(200),
      city         VARCHAR(100),
      member_count INT DEFAULT 0,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS lodge_members (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lodge_id   UUID REFERENCES lodge_groups(id) ON DELETE CASCADE,
      user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
      role       VARCHAR(20) DEFAULT 'resident',
      joined_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(lodge_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS lodge_messages (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lodge_id    UUID REFERENCES lodge_groups(id) ON DELETE CASCADE,
      user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
      sender_name VARCHAR(100),
      content     TEXT NOT NULL,
      type        VARCHAR(20) DEFAULT 'message',
      resolved    BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS lodge_daily_usage (
      id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lodge_id UUID,
      user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
      date     DATE DEFAULT CURRENT_DATE,
      count    INT DEFAULT 0,
      UNIQUE(lodge_id, user_id, date)
    );
    CREATE TABLE IF NOT EXISTS community_posts (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
      author_name  VARCHAR(100),
      university   VARCHAR(200),
      content      TEXT NOT NULL,
      likes        INT DEFAULT 0,
      comments     INT DEFAULT 0,
      shares       INT DEFAULT 0,
      is_verified  BOOLEAN DEFAULT FALSE,
      is_anonymous BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS community_post_likes (
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
      PRIMARY KEY(user_id, post_id)
    );
  `).catch(() => {}); // silent if already exists
}

ensureTables();

// ── GET /api/community/my-lodge ───────────────────────────────────────────────
router.get('/my-lodge', authenticate, async (req, res) => {
  try {
    const [lodges] = await sequelize.query(`
      SELECT lg.*, lm.role AS my_role,
        (SELECT count FROM lodge_daily_usage WHERE lodge_id = lg.id AND user_id = :uid AND date = CURRENT_DATE LIMIT 1) AS daily_messages_used,
        (lm.role = 'caretaker' OR lm.role = 'landlord') AS is_caretaker
      FROM lodge_groups lg
      JOIN lodge_members lm ON lm.lodge_id = lg.id
      WHERE lm.user_id = :uid
      ORDER BY lm.joined_at DESC
      LIMIT 1
    `, { replacements: { uid: req.user.id }, type: sequelize.QueryTypes.SELECT });

    if (!lodges) return res.json(null);
    res.json({ ...lodges, daily_messages_used: parseInt(lodges.daily_messages_used || 0) });
  } catch (err) {
    console.error('[my-lodge]', err);
    res.json(null);
  }
});

// ── GET /api/community/lodge/:id/messages ─────────────────────────────────────
router.get('/lodge/:id/messages', authenticate, async (req, res) => {
  try {
    // Verify member
    const [member] = await sequelize.query(
      `SELECT id FROM lodge_members WHERE lodge_id = :lid AND user_id = :uid`,
      { replacements: { lid: req.params.id, uid: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );
    if (!member) return res.status(403).json({ error: 'Not a member of this lodge' });

    const messages = await sequelize.query(`
      SELECT * FROM lodge_messages WHERE lodge_id = :lid ORDER BY created_at ASC LIMIT 100
    `, { replacements: { lid: req.params.id }, type: sequelize.QueryTypes.SELECT });

    res.json(messages);
  } catch (err) {
    console.error('[lodge-messages]', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── POST /api/community/lodge/:id/messages ────────────────────────────────────
router.post('/lodge/:id/messages', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(422).json({ error: 'Message cannot be empty' });

    // Verify member and get role
    const [member] = await sequelize.query(
      `SELECT role FROM lodge_members WHERE lodge_id = :lid AND user_id = :uid`,
      { replacements: { lid: req.params.id, uid: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );
    if (!member) return res.status(403).json({ error: 'Not a member of this lodge' });

    const isPrivileged = ['landlord', 'caretaker'].includes(member.role) ||
      ['user_admin', 'head_admin'].includes(req.user.role);

    // Check daily limit for regular members
    if (!isPrivileged) {
      const [usage] = await sequelize.query(
        `SELECT count FROM lodge_daily_usage WHERE lodge_id = :lid AND user_id = :uid AND date = CURRENT_DATE`,
        { replacements: { lid: req.params.id, uid: req.user.id }, type: sequelize.QueryTypes.SELECT }
      );
      const used = parseInt(usage?.count || 0);
      if (used >= 2) return res.status(429).json({ error: 'Daily message limit reached', buy_credits: true });
    }

    // Insert message
    const [msg] = await sequelize.query(`
      INSERT INTO lodge_messages (lodge_id, user_id, sender_name, content, type)
      VALUES (:lid, :uid, :name, :content, :type)
      RETURNING *
    `, {
      replacements: {
        lid: req.params.id, uid: req.user.id,
        name: `${req.user.first_name} ${req.user.last_name}`,
        content: content.trim(),
        type: isPrivileged ? 'announcement' : 'message',
      },
      type: sequelize.QueryTypes.INSERT,
    });

    // Increment daily usage
    if (!isPrivileged) {
      await sequelize.query(`
        INSERT INTO lodge_daily_usage (lodge_id, user_id, date, count)
        VALUES (:lid, :uid, CURRENT_DATE, 1)
        ON CONFLICT (lodge_id, user_id, date) DO UPDATE SET count = lodge_daily_usage.count + 1
      `, { replacements: { lid: req.params.id, uid: req.user.id } });
    }

    res.status(201).json(msg);
  } catch (err) {
    console.error('[send-message]', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── POST /api/community/lodge/:id/complaints ──────────────────────────────────
router.post('/lodge/:id/complaints', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(422).json({ error: 'Complaint content required' });

    const [member] = await sequelize.query(
      `SELECT id FROM lodge_members WHERE lodge_id = :lid AND user_id = :uid`,
      { replacements: { lid: req.params.id, uid: req.user.id }, type: sequelize.QueryTypes.SELECT }
    );
    if (!member) return res.status(403).json({ error: 'Not a member of this lodge' });

    const [complaint] = await sequelize.query(`
      INSERT INTO lodge_messages (lodge_id, user_id, sender_name, content, type)
      VALUES (:lid, :uid, :name, :content, 'complaint')
      RETURNING *
    `, {
      replacements: {
        lid: req.params.id, uid: req.user.id,
        name: `${req.user.first_name} ${req.user.last_name}`,
        content: content.trim(),
      },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error('[complaint]', err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

// ── GET /api/community/posts ──────────────────────────────────────────────────
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const { uni = 'all', limit = 20, offset = 0 } = req.query;
    const where = uni !== 'all' ? `WHERE university ILIKE :uni` : '';
    const posts = await sequelize.query(`
      SELECT * FROM community_posts ${where}
      ORDER BY created_at DESC LIMIT :limit OFFSET :offset
    `, {
      replacements: { uni: `%${uni}%`, limit: parseInt(limit), offset: parseInt(offset) },
      type: sequelize.QueryTypes.SELECT,
    });
    res.json({ posts });
  } catch (err) {
    console.error('[posts]', err);
    res.json({ posts: [] });
  }
});

// ── POST /api/community/posts ─────────────────────────────────────────────────
router.post('/posts', authenticate, async (req, res) => {
  try {
    const { content, university, is_anonymous = false } = req.body;
    if (!content?.trim()) return res.status(422).json({ error: 'Content required' });

    const [post] = await sequelize.query(`
      INSERT INTO community_posts (user_id, author_name, university, content, is_anonymous, is_verified)
      VALUES (:uid, :name, :uni, :content, :anon, :verified)
      RETURNING *
    `, {
      replacements: {
        uid:      req.user.id,
        name:     is_anonymous ? 'Anonymous' : `${req.user.first_name} ${req.user.last_name}`,
        uni:      university || req.user.university || null,
        content:  content.trim(),
        anon:     is_anonymous,
        verified: !!req.user.university,
      },
      type: sequelize.QueryTypes.INSERT,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error('[create-post]', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// ── POST /api/community/posts/:id/like ───────────────────────────────────────
router.post('/posts/:id/like', authenticate, async (req, res) => {
  try {
    // Toggle like
    const [existing] = await sequelize.query(
      `SELECT 1 FROM community_post_likes WHERE user_id = :uid AND post_id = :pid`,
      { replacements: { uid: req.user.id, pid: req.params.id }, type: sequelize.QueryTypes.SELECT }
    );
    if (existing) {
      await sequelize.query(`DELETE FROM community_post_likes WHERE user_id = :uid AND post_id = :pid`, { replacements: { uid: req.user.id, pid: req.params.id } });
      await sequelize.query(`UPDATE community_posts SET likes = GREATEST(likes - 1, 0) WHERE id = :pid`, { replacements: { pid: req.params.id } });
      return res.json({ liked: false });
    }
    await sequelize.query(`INSERT INTO community_posts (user_id, post_id) VALUES (:uid, :pid) ON CONFLICT DO NOTHING`, { replacements: { uid: req.user.id, pid: req.params.id } }).catch(() => {});
    await sequelize.query(`INSERT INTO community_post_likes (user_id, post_id) VALUES (:uid, :pid) ON CONFLICT DO NOTHING`, { replacements: { uid: req.user.id, pid: req.params.id } });
    await sequelize.query(`UPDATE community_posts SET likes = likes + 1 WHERE id = :pid`, { replacements: { pid: req.params.id } });
    res.json({ liked: true });
  } catch (err) {
    console.error('[like]', err);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
