unilo...platform
```
unilo/
├── packages/
│   ├── client/          → unilo.com  (Vite + React + PWA — student-facing)
│   ├── admin/           → admin.unilo.com  (Vite + React — landlord & head admin)
│   └── server/          → API server  (Node + Express + Sequelize + PostgreSQL)
└── package.json         → workspace root
```

---

## Tech Stack

| Layer       | Tech                                              |
|-------------|---------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Framer Motion       |
| PWA         | Vite PWA plugin, Workbox service worker           |
| Routing     | React Router v6                                   |
| State       | Zustand (auth) + TanStack Query (server state)    |
| Charts      | Recharts                                          |
| Map         | Leaflet + react-leaflet                           |
| Backend     | Node.js, Express                                  |
| ORM         | Sequelize + PostgreSQL (Supabase)                 |
| Auth        | JWT + bcrypt, role-based guards                   |
| Photos      | Cloudinary (multer-storage-cloudinary)            |
| Video       | YouTube embed (no hosting costs)                  |
| Analytics   | Custom events table + UTM tracking                |
| Deploy      | Vercel (client + admin) + Render (API)            |

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/yourname/unilo.git
cd unilo
npm install
```

### 2. Configure environment

```bash
cp packages/server/.env.example packages/server/.env
# Edit .env with your DATABASE_URL, JWT_SECRET, Cloudinary keys
```

### 3. Set up database

Create a Supabase project → copy the PostgreSQL connection string into `.env`.

```bash
npm run db:migrate   # Run all migrations
npm run db:seed      # (optional) seed with sample data
```

### 4. Run all three services

```bash
npm run dev
# server → http://localhost:5000
# client → http://localhost:3000
# admin  → http://localhost:3001
```

---

## Roles

| Role         | Access                                                        |
|--------------|---------------------------------------------------------------|
| `viewer`     | Browse, search, filter, watch tours, save to wishlist        |
| `user_admin` | Create listings, upload photos, add YouTube links, toggle vacancy |
| `head_admin` | Approve/reject listings, manage all users, full analytics    |

---

## Key Endpoints

```
POST   /api/auth/register         Register (viewer or user_admin)
POST   /api/auth/login            Login → JWT
GET    /api/auth/me               Current user

GET    /api/listings              Search + filter (public)
GET    /api/listings/:id          Single listing + analytics event
POST   /api/listings              Create (landlord)
PATCH  /api/listings/:id          Update (owner or head_admin)
POST   /api/listings/:id/submit   Submit for approval
POST   /api/listings/:id/wishlist Toggle save (viewer)
GET    /api/listings/my/all       Landlord's own listings

POST   /api/upload/photos/:id     Upload photos to Cloudinary
DELETE /api/upload/photos/:id     Delete photo

GET    /api/admin/pending         Pending listings (head_admin)
POST   /api/admin/listings/:id/approve
POST   /api/admin/listings/:id/reject
DELETE /api/admin/listings/:id
GET    /api/admin/users
POST   /api/admin/users/:id/suspend
GET    /api/admin/finance

GET    /api/analytics/traffic
GET    /api/analytics/behaviour
```

---

## YouTube Integration

1. Landlord records property tour → uploads to YouTube
2. Pastes YouTube URL into admin listing form
3. Server extracts video ID with regex (handles youtu.be, watch?v=, embed/ formats)
4. Stored as `youtube_video_id` on the listing
5. Viewer page renders `<iframe src="https://youtube.com/embed/{id}">` — responsive 16:9, autoplay off

---

## UTM Tracking

Every share link, Instagram bio link, and WhatsApp message gets tagged:

```
https://unilo.com?utm_source=whatsapp&utm_medium=share&utm_campaign=listing_share
```

When a visitor lands via that link, the source is logged to `analytics_events`. The head admin dashboard shows the breakdown by source, city, device, and peak hours.

---

## PWA (Progressive Web App)

Students on Android/iOS can tap **"Add to Home Screen"** → Unilo installs like a native app.

- **Offline**: Service worker caches pages; the app still loads on 3G/no connection
- **Background sync**: Checks for new listings silently when back online
- **Push notifications**: Ready to wire up (manifest + service worker scaffolded)
- **No app store**: Zero download friction, no ₦1,500 Play Store fee

---

## Deployment

### API → Render (render.com)

1. Create new **Web Service** → connect GitHub repo
2. Root directory: `packages/server`
3. Build: `npm install`  Start: `node src/index.js`
4. Add environment variables from `.env.example`

### Client → Vercel (unilo.com)

1. Import repo → set root to `packages/client`
2. Add env var: `VITE_API_URL=https://api.unilo.com/api`
3. Deploy

### Admin → Vercel (admin.unilo.com)

1. Import repo → set root to `packages/admin`
2. Add env var: `VITE_API_URL=https://api.unilo.com/api`
3. Deploy → configure custom domain `admin.unilo.com`

---

## Seeding a Head Admin

After deployment, run this once on the server:

```sql
UPDATE users SET role = 'head_admin' WHERE email = 'your@email.com';
```

Or add a seed file in `packages/server/seeders/`.
