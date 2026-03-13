<div align="center">

# 1PERCENT

### *Get 1% better every day.*

A social platform built around the compound growth philosophy — track your daily wins, share your progress, and grow alongside a community that shows up every single day.

**1.01³⁶⁵ = 37.78×**

[![Live Demo](https://img.shields.io/badge/Live_Demo-1percent.vercel.app-FF5C00?style=for-the-badge)](https://1percent-frontend-vercel.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge)](https://onepercent-backend-li8a.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](#license)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)

</div>

---

## What is 1PERCENT?

1PERCENT is a motivation-first social platform inspired by the atomic habits principle that small, consistent improvements compound into extraordinary results. Users post daily wins, maintain streaks, earn badges, join challenges, and hold each other accountable — all in a real-time social feed.

**Three pillars: TRACK → SHARE → COMPOUND**

---

## Features

### Core
- **Daily Posts** — 6 post types: Daily Win, Milestone, Reflection, Challenge, Goal Update, Photo Progress
- **Streak System** — Calendar-day based streaks with freeze protection, grace periods, and midnight reset via cron job
- **Streak Badges** — 4 tiers automatically awarded: On Fire (7d) → Consistent (30d) → Unstoppable (100d) → Legend (365d)
- **Social Graph** — Follow/unfollow with support for private accounts and pending follow requests
- **Hashtags** — Auto-extracted on post creation, searchable, trending calculated weekly

### Feed & Discovery
- **Home Feed** — Cursor-paginated feed of posts from followed users + self
- **Explore** — Recent public posts, trending hashtags, full-text search across posts/users/hashtags
- **Streak Leaderboard** — Top 50 community members ranked by current streak

### Engagement
- **Reactions** — Like/unlike with optimistic UI updates
- **Comments** — Threaded comments with reply support (2 levels deep)
- **Real-time Notifications** — WebSocket push via Socket.io for likes, comments, follows, streak milestones, and badge awards

### Challenges
- Create time-bound community challenges with a goal and date range
- Join/leave challenges, view participant list, dedicated challenge feed

### Profile
- Full profile editing: display name, bio, location, website, goal statement, focus areas
- Avatar & cover photo upload (Cloudinary)
- Follower/following lists
- Personal post history

### Themes
- 7 built-in themes: Dawn, Morning, Noon, Afternoon, Dusk, Evening, Night
- Theme persisted per user via localStorage
- All colors driven by CSS custom properties — zero hardcoded values

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool & dev server |
| Tailwind CSS v4 | Utility styling |
| TanStack Query v5 | Server state, caching, infinite scroll |
| Zustand v5 | Client state (auth, theme, UI) |
| React Router v7 | Client-side routing |
| Socket.io-client | Real-time notifications |
| Axios | HTTP client with JWT interceptor + auto-refresh |
| date-fns | Date formatting |
| react-hot-toast | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 20 + Express 5 | API server |
| Prisma 7 | ORM + migrations |
| PostgreSQL | Primary database |
| Redis | Session/cache layer |
| Socket.io | WebSocket server |
| JWT (jsonwebtoken) | Access + refresh token auth |
| bcryptjs | Password hashing |
| Multer + Cloudinary | Image upload |
| node-cron | Midnight streak reset job |
| Helmet + CORS | Security middleware |

### Infrastructure
| Service | Role |
|---|---|
| Vercel | Frontend hosting |
| Render | Backend hosting (Docker) |
| Render PostgreSQL | Managed database |
| Cloudinary | Image storage & CDN |

---

## Project Structure

```
1percent/
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── api/                  # Axios API clients
│   │   │   ├── client.ts         # Base instance + JWT interceptor
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── users.ts
│   │   │   ├── notifications.ts
│   │   │   └── search.ts
│   │   ├── components/
│   │   │   ├── layout/           # AppShell, Sidebar, Topbar, BottomNav
│   │   │   ├── post/             # PostCard, ComposeModal, CommentSection
│   │   │   ├── profile/          # StreakBadge, Leaderboard
│   │   │   └── settings/         # ThemePicker, ThemeFloating
│   │   ├── hooks/                # useAuth, useFeed, useLike, useComments, useSocket
│   │   ├── pages/                # FeedPage, ExplorePage, StreaksPage, etc.
│   │   ├── store/                # Zustand: authStore, themeStore, uiStore
│   │   └── types/                # TypeScript interfaces
│   └── vite.config.ts
│
└── backend/                      # Express API
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    ├── src/
    │   ├── modules/
    │   │   ├── auth/             # Register, login, refresh, logout
    │   │   ├── users/            # Profile, follow, suggestions
    │   │   ├── posts/            # Feed, create, explore
    │   │   ├── likes/            # Toggle like + notification
    │   │   ├── comments/         # Add, get, reply + notification
    │   │   ├── notifications/    # CRUD + real-time push
    │   │   ├── challenges/       # Create, join, leave, feed
    │   │   ├── search/           # Full-text, trending, recent
    │   │   └── streaks/          # Leaderboard, badge service
    │   ├── middleware/
    │   │   ├── auth.js           # JWT verification
    │   │   └── upload.js         # Multer + Cloudinary
    │   ├── jobs/
    │   │   ├── scheduler.js      # node-cron setup
    │   │   └── streakReset.js    # Midnight streak reset + freeze logic
    │   └── app.js
    └── Dockerfile
```

---

## Getting Started

### Prerequisites
- Node.js 20.19+
- PostgreSQL database
- Redis instance
- Cloudinary account (free tier)

### Backend

```bash
git clone https://github.com/ridyaG/1percent-backend
cd 1percent-backend
npm install
```

Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m

BCRYPT_ROUNDS=12

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

Run migrations and start:
```bash
npx prisma migrate dev
npx prisma db seed    # optional sample data
npm run dev
```

### Frontend

```bash
git clone https://github.com/ridyaG/1percent-frontend
cd 1percent-frontend
npm install
```

Create a `.env` file:
```env
# Local dev — uses Vite proxy to avoid CORS
VITE_API_URL=/api/v1
VITE_WS_URL=http://localhost:5173
```

```bash
npm run dev
```

The Vite dev server proxies `/api` → `localhost:3001` automatically.

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Create account |
| POST | `/api/v1/auth/login` | — | Login, returns tokens |
| POST | `/api/v1/auth/refresh` | — | Rotate refresh token |
| POST | `/api/v1/auth/logout` | — | Invalidate refresh token |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/posts` | ✓ | Create post |
| GET | `/api/v1/posts/feed/home` | ✓ | Paginated home feed |
| GET | `/api/v1/posts/feed/explore` | ✓ | Public explore feed |
| POST | `/api/v1/posts/:id/like` | ✓ | Toggle like |
| GET | `/api/v1/posts/:id/comments` | — | Get comments |
| POST | `/api/v1/posts/:id/comments` | ✓ | Add comment |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users/:username` | — | Get profile |
| PATCH | `/api/v1/users/me` | ✓ | Update profile |
| GET | `/api/v1/users/:id/posts` | — | User's posts |
| GET | `/api/v1/users/:id/followers` | — | Follower list |
| GET | `/api/v1/users/:id/following` | — | Following list |
| POST | `/api/v1/users/:id/follow` | ✓ | Follow user |
| DELETE | `/api/v1/users/:id/follow` | ✓ | Unfollow user |
| GET | `/api/v1/users/me/suggestions` | ✓ | Suggested users |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/notifications` | ✓ | All notifications |
| GET | `/api/v1/notifications/unread-count` | ✓ | Unread count |
| PATCH | `/api/v1/notifications/:id/read` | ✓ | Mark one read |
| PATCH | `/api/v1/notifications/read-all` | ✓ | Mark all read |

### Challenges
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/challenges` | — | List active challenges |
| POST | `/api/v1/challenges` | ✓ | Create challenge |
| GET | `/api/v1/challenges/:id` | — | Challenge detail |
| POST | `/api/v1/challenges/:id/join` | ✓ | Join challenge |
| DELETE | `/api/v1/challenges/:id/join` | ✓ | Leave challenge |
| GET | `/api/v1/challenges/:id/posts` | — | Challenge feed |

### Search & Streaks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/search?q=&type=` | — | Search posts/users/hashtags |
| GET | `/api/v1/search/trending` | — | Trending hashtags |
| GET | `/api/v1/search/recent-posts` | — | Recent public posts |
| GET | `/api/v1/streaks/leaderboard` | — | Top 50 by streak |

---

## Database Schema

Core models and their relationships:

```
User ──< Post ──< Like
     ──< Comment ──< Comment (replies)
     ──< Follow (self-referential)
     ──< UserBadge
     ──< Notification
     ──< RefreshToken
     ──< ChallengeParticipant >── Challenge ──< ChallengePost >── Post
```

**Streak logic:** Calculated on every post creation. If `lastPostDate` was yesterday → `streak + 1`. If today → no change. Anything else → reset to 1. A nightly cron job at midnight UTC resets streaks for users who missed a day (respecting streak freeze count).

---

## Deployment

### Backend (Render)

The backend ships as a Docker container. Render auto-deploys on every push to `main`.

```dockerfile
FROM node:20.19-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
EXPOSE 3001
CMD ["sh", "-c", "node scripts/migrate.js && node src/app.js"]
```

Required environment variables on Render: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `BCRYPT_ROUNDS`, `CLOUDINARY_*`, `CLIENT_URL`, `NODE_ENV=production`

### Frontend (Vercel)

Connect the GitHub repo to Vercel. Set one environment variable:
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
VITE_WS_URL=https://your-backend.onrender.com
```

Vercel detects Vite automatically — no build config needed.

---

## Real-time Events

Socket.io room pattern: each authenticated user joins `user:{userId}` on connect.

```js
// Client
socket.emit('join_room', { userId });

// Server emits on like/comment/follow/badge/streak events
socket.to(`user:${recipientId}`).emit('notification', notificationObject);
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `N` | Open compose modal |
| `Esc` | Close any modal |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT © [Ridya Gupta](https://github.com/ridyaG)

---

<div align="center">

**Built on the belief that small, consistent actions compound into extraordinary results.**

*Day 1 starts today.*

</div>
