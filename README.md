# ChatPilot ⚡

ChatPilot is a clean, minimal AI chatbot application built with React, Express, Supabase (Auth + Database), and Google Gemini AI.

---

## Architecture & Features

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS v3, `@supabase/supabase-js`, `react-markdown`, `lucide-react`.
- **Backend**: Node.js, Express 4 (ES Modules), `@google/genai` (official Google Gemini SDK), `@supabase/supabase-js`, `zod`, `cors`, `helmet`, `express-rate-limit`, `pg`.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) and Supabase Auth (Email + Password).
- **AI Integration**: Powered by Google Gemini (`gemini-2.5-flash`), with multi-turn conversation memory (the last 20 messages are sent as context) and a tailored system prompt.
- **Security**: The Gemini API key and Supabase Service Role key are stored strictly on the server. The frontend never talks to Gemini directly.

---

## Project Structure

```text
ChatPilot/
├── .gitignore
├── README.md
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # PostgreSQL DDL, triggers, and RLS policies
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── scripts/
│   │   └── migrate.js                  # Direct Postgres migration runner
│   └── src/
│       ├── index.js                    # Express server entry point
│       ├── config/
│       │   └── env.js                  # Zod environment variable validation
│       ├── lib/
│       │   ├── supabaseAdmin.js        # Supabase Admin client with Service Role Key
│       │   └── gemini.js               # Official @google/genai runner
│       ├── middleware/
│       │   ├── auth.js                 # JWT Bearer verification middleware
│       │   └── errorHandler.js         # Production-safe central error handler
│       ├── routes/
│       │   ├── chat.js                 # POST /api/chat with rate limiting & Gemini
│       │   └── conversations.js        # GET & DELETE conversation endpoints
│       └── validators/
│           └── schemas.js              # Zod schemas for payload and parameter validation
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json                     # SPA client routing for Vercel
    ├── index.html
    ├── .env.example
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx                     # Route definitions & AuthProvider
        ├── index.css                   # Tailwind CSS & markdown styles
        ├── context/
        │   └── AuthContext.jsx         # Supabase Auth session provider
        ├── lib/
        │   ├── supabase.js             # Public Supabase client (Anon key)
        │   └── api.js                  # Authenticated fetch wrapper (/api/*)
        ├── components/
        │   ├── ProtectedRoute.jsx      # Auth guard redirecting to /login
        │   ├── Sidebar.jsx             # Collapsible sidebar with chat history & delete
        │   ├── ChatWindow.jsx          # Header, message scroll container, suggestions
        │   ├── MessageBubble.jsx       # User bubble & ReactMarkdown assistant bubble
        │   ├── ChatInput.jsx           # Multiline input with Enter / Shift+Enter
        │   ├── TypingIndicator.jsx     # "Thinking..." animated bounce indicator
        │   └── ErrorBanner.jsx         # Friendly error alerts
        └── pages/
            ├── Login.jsx               # Email/password login
            ├── Signup.jsx              # Email/password registration
            └── Chat.jsx                # Main responsive chat interface
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **npm**: v9 or higher
- A [Supabase](https://supabase.com) account & project
- A [Google AI Studio](https://aistudio.google.com/) Gemini API Key

---

### 2. Environment Configuration

#### Server (`/server/.env`):
Create or update `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_DB_URL=postgresql://postgres.your-project-ref:YOUR_DB_PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
```

- `SUPABASE_URL`: From Supabase Project Settings → API → Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: From Supabase Project Settings → API → `service_role` (secret) key.
- `GEMINI_API_KEY`: From Google AI Studio.
- `SUPABASE_DB_URL`: (Optional if running migrations via Supabase SQL Editor) Direct PostgreSQL connection URI from Project Settings → Database → Connection string (Node.js / URI).

#### Client (`/client/.env`):
Create or update `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:5000
```

- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase public `anon` key.
- `VITE_API_BASE_URL`: Base URL of the backend (e.g. `http://localhost:5000`).

---

### 3. Database Migration

You can apply the database schema via either method:

#### Option A: Supabase SQL Editor (Recommended & Instant)
1. Open your project at [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab on the left sidebar.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository, copy its entire contents, paste them into the SQL Editor, and click **Run**.

#### Option B: Automated Migration Script
If you have set `SUPABASE_DB_URL` in `server/.env`:
```bash
cd server
npm run migrate
```

---

### 4. Running the Application Locally

#### Start Backend:
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`. You can verify it with:
```bash
curl http://localhost:5000/api/health
# {"status":"ok"}
```

#### Start Frontend:
In a separate terminal window:
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`. Open your browser to `http://localhost:5173`.

---

## Deployment Guidelines

### Backend on Render:
1. Create a **New Web Service** connected to your repository.
2. Root Directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Add Environment Variables from `server/.env` (`CLIENT_URL` should be your deployed frontend URL on Vercel).

### Frontend on Vercel:
1. Import repository into Vercel.
2. Root Directory: `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Environment Variables from `client/.env` (`VITE_API_BASE_URL` pointing to your deployed Render URL).
7. `vercel.json` is already included to ensure single-page client routing.

