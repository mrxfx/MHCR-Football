# MHCR Football™
**Everything Football, One Place.**

A complete football platform built with Next.js 15, TypeScript, Tailwind CSS, and Firebase.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set up environment variables
```bash
cp .env.local.example .env.local
```
Fill in your Firebase values in `.env.local`.

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **mhcrftbl**
3. Enable **Firestore Database** and **Authentication** (Email/Password)
4. Update **Firestore Security Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

5. Create your first admin user in Firebase Console → **Authentication → Add user**

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home — hero, scoreboard, top teams, news
│   ├── teams/
│   │   ├── page.tsx            # Teams list
│   │   └── [id]/page.tsx       # Team detail with squad
│   ├── players/page.tsx        # Players with search & filter
│   ├── matches/page.tsx        # Fixtures & results (real-time)
│   ├── standings/page.tsx      # League table
│   ├── news/page.tsx           # News articles
│   ├── ai-assistant/page.tsx   # AI chat interface
│   ├── about/page.tsx          # About page
│   └── admin/
│       ├── page.tsx            # Admin login
│       ├── dashboard/page.tsx  # Dashboard with stats
│       ├── teams/page.tsx      # Teams CRUD
│       ├── players/page.tsx    # Players CRUD
│       ├── matches/page.tsx    # Matches CRUD + live toggle
│       ├── standings/page.tsx  # Standings CRUD
│       ├── news/page.tsx       # News CRUD
│       └── settings/page.tsx   # App settings
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx      # Sidebar + bottom nav
│   │   └── AdminLayout.tsx     # Admin sidebar with all nav items
│   └── ProtectedRoute.tsx      # Auth guard for admin pages
├── contexts/
│   ├── AuthContext.tsx         # Firebase Auth context
│   └── ThemeContext.tsx        # Dark/light mode context
└── lib/
    ├── firebase.ts             # Firebase initialization
    ├── firestore.ts            # Firestore collections & types
    └── utils.ts                # Helper utilities
```

---

## 🗄️ Firestore Collections

| Collection  | Fields |
|-------------|--------|
| `teams`     | name, coach, stadium, founded, active, logo |
| `players`   | name, team (id), position, number, goals, image |
| `matches`   | homeTeam, awayTeam, homeScore, awayScore, status, live, date |
| `standings` | team (id), played, won, draw, lost, points |
| `news`      | title, description, image, date |
| `settings`  | appName, logoUrl, themeColor |

> **Tip:** `matches.live = true` enables real-time LIVE badge and updates via `onSnapshot()`.

---

## 🌍 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or push to GitHub and import in [vercel.com/new](https://vercel.com/new).

Add your environment variables in Vercel → Project Settings → Environment Variables.

---

## 🌍 Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --build
```

Set environment variables in Netlify → Site Settings → Environment Variables.

---

## 🌍 Deploy to a VPS (Ubuntu)

```bash
# 1. Build
npm run build

# 2. Install PM2
npm install -g pm2

# 3. Start
pm2 start npm --name "mhcr-football" -- start

# 4. Configure Nginx reverse proxy to port 3000
```

---

## 📱 Features

- ⚽ **Home** — Hero banner, featured match, real-time scoreboard, top teams, latest news
- 🏆 **Teams** — Team cards with logo, coach, stadium; team detail with full squad
- 👤 **Players** — Searchable and filterable player cards with stats
- 📅 **Matches** — Tabbed (All / Live / Upcoming / Finished), real-time via `onSnapshot`
- 📊 **Standings** — League table sorted by points
- 📰 **News** — News articles grid
- 🤖 **AI Assistant** — Chat interface with football Q&A
- ℹ️ **About** — Platform info, credits
- 🔐 **Admin Panel** — Full CRUD for all data, protected by Firebase Auth
- 🌙 **Dark Mode** — System-aware with manual toggle
- 📱 **Mobile** — Responsive with bottom navigation bar

---

## 🔐 Admin Access

1. Create a user in Firebase Console → Authentication → Add user
2. Visit `/admin` on your site
3. Sign in with your credentials

---

## 👨‍💻 Credits

- **Developed by:** Rahul Haldar
- **Sponsored by:** Haldar Family
- **Version:** 1.0

---

*MHCR Football™ — Everything Football, One Place.*
