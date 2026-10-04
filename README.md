# zen-beat

**AI-powered adaptive music that reads your mood from your face.**

zen-beat uses in-browser face detection to work out how you're feeling, then matches
you with a playlist and runs a timed listening session tuned to that mood.

**🌐 Live demo:** [https://zen-beat-main.vercel.app](https://zen-beat-main.vercel.app)

> The product is branded **MoodSync** inside the app UI; the repository and
> deployment are named `zen-beat`.

---

## How it works

1. **Enable your camera** — the app requests `getUserMedia` and shows a live preview.
2. **Scan My Mood** — face-api samples your expression **once per second for 15 seconds**,
   tallying which emotion wins most often.
3. **Result** — the dominant emotion becomes a listening *mode* (`focus`, `relax`, or
   `calm`), with a 0–100 mood score and a percentage breakdown per emotion.
4. **Therapy session** — a 60-second countdown plays the matched playlist.
5. **Progress** — sessions are logged and charted over time.

Emotion detection runs entirely in your browser. Camera frames are not uploaded.

### Emotion → mode mapping

| Detected emotion | Mode      | Playlist          |
| ---------------- | --------- | ----------------- |
| happy, surprised | `focus`   | Lo-fi Beats       |
| neutral         | `focus`   | Lo-fi Beats       |
| sad, fearful    | `relax`   | Calm Vibes        |
| tired           | `relax`   | Calm Vibes        |
| angry, disgusted| `calm`    | Meditation Sounds |

Mood score weights: happy `90`, neutral `70`, tired `50`, sad `30`, angry `20`.

### Features

- Real-time expression detection with `@vladmandic/face-api` (TinyFaceDetector +
  faceExpressionNet, models loaded from jsDelivr CDN)
- Music platforms: **Spotify**, **Wynk**, **JioSaavn**, **Gaana**
- Language selection: English, Hindi, Telugu, Tamil, other
- Mood score, per-emotion breakdown, and a progress dashboard
- Zen mode — a distraction-free full-screen listening overlay
- Email/password auth with JWT (bcrypt-hashed passwords)
- Onboarding walkthrough on first visit

---

## Tech stack

**Frontend**

| | |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router 6 |
| UI | shadcn/ui + Radix, Tailwind CSS |
| Animation | Framer Motion |
| Data | TanStack Query |
| Face AI | `@vladmandic/face-api` |
| Charts | Recharts |
| Icons | Lucide React |

**Backend**

| | |
| --- | --- |
| Runtime | Express 5 (Node) |
| Database | SQLite (`sqlite3`) |
| Auth | `jsonwebtoken` + `bcryptjs` |
| AI tooling | Model Context Protocol (`@modelcontextprotocol/sdk`) |
| Validation | Zod |

---

## Project structure

```
src/
  components/      UI incl. WebcamPreview, MusicPlayer, ZenModeOverlay
  hooks/           useAuth, useEmotionDetection, useZenMode
  pages/           Index, Auth, NotFound
  lib/apiConfig.ts API base URL resolution
backend/
  app.js           Express app factory — shared by server + serverless
  server.js        Local dev entry point (port 4000)
  mcp/             SpotifyTherapist MCP server
api/
  index.js         Vercel serverless entry point
vercel.json        Static build + API routing config
```

`backend/app.js` exports an app factory so the **same** Express instance serves both
local development (`server.js`) and the Vercel serverless function (`api/index.js`).

---

## Getting started

```bash
git clone https://github.com/prabhasarya07-blip/zen-beat.git
cd zen-beat
npm install
npm run dev
```

The frontend starts on **http://localhost:5000** (`vite --port 5000`).

To run the API locally, in a second terminal:

```bash
cd backend
npm install
node server.js     # → http://localhost:4000
```

### Environment variables

Create a `.env` in the project root (`.env` is git-ignored):

```bash
# Where the frontend should reach the API.
# Leave unset on Vercel — it defaults to same-origin "/api".
VITE_API_URL=http://localhost:4000/api
```

> The current build does not import Supabase anywhere — auth is JWT-based against the
> Express/SQLite backend. The `VITE_SUPABASE_*` variables in your local `.env` are
> currently unused and can be removed.

The backend reads `PORT` (default `4000`) and `CORS_ORIGINS`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |

---

## API

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Sign in, returns a JWT |
| POST | `/api/emotions` | Bearer | Log a detected emotion + get AI message |
| GET | `/api/emotions` | Bearer | List logged emotions |
| GET | `/api/emotions/progress` | Bearer | Aggregated mood history |
| GET | `/health` | — | Health check |

---

## Deployment

Deployed on **Vercel**, connected to the GitHub repo — pushes to `main` trigger a build.

`vercel.json` defines two builds:

1. `@vercel/static-build` from `package.json`, output `dist/`
2. `@vercel/node` from `api/index.js`, including `backend/database.sqlite` and `backend/mcp/**`

Routes send `/api/*` to the serverless function and fall back to `index.html` for SPA
client-side routing.

### Known caveats

- **Camera access requires HTTPS** (or `localhost`). The Vercel deployment is HTTPS, so
  it works there; serving the build over plain HTTP on a LAN IP will not.
- The SQLite file is bundled into the function. Serverless filesystems are ephemeral,
  so **emotion history does not persist reliably across deployments** on Vercel.
  A hosted database (Supabase/Postgres) is the path forward for durable storage.
- Detection quality depends on lighting and framing; it's a demo-grade classifier, not
  a clinical one.

---

## License

ISC