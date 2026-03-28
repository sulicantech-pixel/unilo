require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const authRoutes      = require('./routes/auth');
const listingRoutes   = require('./routes/listings');
const adminRoutes     = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes    = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Trust Render's reverse proxy ─────────────────────────────────────────────
// Must be BEFORE rate limiter — fixes ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
// Hardcoded + env fallback so it never breaks if Render env vars aren't set
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://unilo-client.vercel.app',
    'https://unilo-admin.vercel.app',
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Try again later.' },
});

// More generous for analytics — high-volume fire-and-forget events
const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analytics events.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter,      authRoutes);
app.use('/api/listings',                    listingRoutes);
app.use('/api/admin',                       adminRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);
app.use('/api/upload',                      uploadRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production',
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const syncOptions = process.env.NODE_ENV === 'development'
      ? { alter: true }
      : { force: false };

    await sequelize.sync(syncOptions);
    console.log('✅ Models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Unilo API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
