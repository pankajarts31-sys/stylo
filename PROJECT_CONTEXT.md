# STYLO — Project Context

> AI-powered fashion discovery platform combining an intelligent stylist chatbot, trending feed, visual/voice search, and real-time price comparison across 20+ Indian e-commerce stores.

---

## Project Overview

STYLO is a full-stack web application that serves as a **virtual fashion universe**. It lets users:

1. **Chat with an AI fashion stylist** powered by Google Gemini 2.5 Flash (streaming SSE responses).
2. **Browse a trending feed** of live fashion products pulled from Google Shopping via SerpApi.
3. **Compare prices** of any product across 20+ Indian e-commerce stores (Amazon, Flipkart, Myntra, Meesho, Ajio, etc.).
4. **Search by image** — upload a photo and get matching products (Gemini vision + SerpApi).
5. **Search by voice** — Web Speech API for hands-free text input.
6. **Save/wishlist** items to a personal collection (JWT-authenticated).
7. **Toggle gender context** (Men/Women) which prefixes all search queries for relevant results.

The frontend is a glassmorphism-styled, Pinterest-inspired masonry layout with smooth Framer Motion animations.

---

## Tech Stack

### Backend (`stylo-backend/`)
| Layer        | Technology                            |
|-------------|---------------------------------------|
| Framework    | **FastAPI** 0.110                    |
| Server       | **Uvicorn** 0.29                     |
| AI/LLM       | **Google Gemini 2.5 Flash** via `google-genai` SDK |
| Shopping Data| **SerpApi** (Google Shopping engine)  |
| Database     | **SQLite** (local dev) / **PostgreSQL** (Railway prod) |
| ORM          | **SQLAlchemy** 2.0                   |
| Auth         | **JWT** (python-jose) + **bcrypt** (passlib) |
| Validation   | **Pydantic** 2.6 + pydantic-settings |
| Python       | 3.10+ (venv)                         |

### Frontend (`stylo-frontend/`)
| Layer        | Technology                            |
|-------------|---------------------------------------|
| Framework    | **Next.js 16** (App Router, Turbopack) |
| Language     | **TypeScript** 5                     |
| UI           | **React 19** + inline styles + Tailwind CSS 4 |
| Animations   | **Framer Motion** 12                 |
| Icons        | **Lucide React**                     |
| Grid Layout  | **react-masonry-css** (Pinterest-style) |
| State        | React Context (Auth, Theme, Gender) + **Zustand** (available) |
| HTTP         | **Axios** (available) + native `fetch` |
| Styling      | Glassmorphism theme, CSS custom properties, Geist font |

### Deployment
| Target       | Service                              |
|-------------|---------------------------------------|
| Backend      | **Railway** (PostgreSQL + Uvicorn)   |
| Frontend     | **Vercel**                           |
| Domain       | `stylo-zeta.vercel.app` (frontend)   |

---

## Folder Structure

```
stylo/
├── .gitignore
├── stylo.db                      # SQLite database (auto-generated, gitignored)
├── PROJECT_CONTEXT.md            # This file
│
├── stylo-backend/
│   ├── true_main.py              # FastAPI app entrypoint (load .env, lifespan, routers)
│   ├── main.py                   # Re-export (if exists) or alias for true_main
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # GEMINI_API_KEY, SERPAPI_KEY, DATABASE_URL, JWT_SECRET_KEY
│   ├── venv/                     # Python virtual environment
│   │
│   └── app/
│       ├── __init__.py
│       ├── api/                   # FastAPI route handlers
│       │   ├── auth.py            # POST /api/auth/register, /login, GET /me, PATCH /theme
│       │   ├── stylist.py         # POST /api/stylist/chat, /stream (SSE)
│       │   ├── feed.py            # GET /api/feed (trending products, cached)
│       │   ├── deals.py           # GET /api/deals (multi-store price comparison)
│       │   ├── search.py          # GET /api/search?q= (text/voice search)
│       │   ├── visual_search.py   # POST /api/search/visual (image upload)
│       │   └── saved.py           # POST/GET/DELETE /api/saved (wishlist CRUD)
│       │
│       ├── services/              # Business logic
│       │   ├── stylist.py         # Gemini chat (streaming + non-streaming)
│       │   ├── shopping.py        # SerpApi Google Shopping wrapper
│       │   └── visual_search.py   # Gemini vision -> search query generation
│       │
│       ├── core/                  # Configuration & infrastructure
│       │   ├── config.py          # pydantic-settings (Settings class, env loading)
│       │   ├── database.py        # SQLAlchemy engine, session, Base
│       │   ├── security.py        # JWT + bcrypt helpers, get_current_user dep
│       │   └── mongo.py           # MongoDB config (legacy, unused)
│       │
│       ├── models/                # SQLAlchemy ORM models
│       │   ├── user.py            # User (email, name, hashed_password, theme_preference)
│       │   └── saved_item.py      # SavedItem (product_url, image_url, title, price, source)
│       │
│       └── schemas/               # Pydantic request/response schemas
│           ├── auth.py            # RegisterRequest, LoginRequest, TokenResponse, UserOut
│           ├── chat.py            # ChatMessage, ChatRequest, ChatResponse
│           ├── feed.py            # Feed schemas
│           └── saved_item.py      # SavedItemCreate, SavedItemOut
│
├── stylo-frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   ├── postcss.config.mjs
│   ├── public/                    # Static assets (SVGs)
│   │
│   └── src/
│       ├── app/                   # Next.js App Router pages
│       │   ├── layout.tsx         # Root layout (Geist font, Navbar, Providers, orbs)
│       │   ├── page.tsx           # Home — hero section + feature cards
│       │   ├── globals.css        # CSS variables, glassmorphism, masonry, theme
│       │   ├── feed/page.tsx      # Trending feed page
│       │   ├── deals/page.tsx     # Deals comparison page
│       │   ├── stylist/page.tsx   # AI stylist chat page
│       │   ├── saved/page.tsx     # Wishlist/saved items page
│       │   └── auth/
│       │       ├── login/page.tsx
│       │       └── signup/page.tsx
│       │
│       ├── components/            # Reusable UI components
│       │   ├── Navbar.tsx         # Fixed glass navbar (nav links, gender toggle, auth buttons)
│       │   ├── Providers.tsx      # Wraps AuthProvider > GenderProvider > ThemeProvider
│       │   ├── FeedContent.tsx    # Trending page logic (fetch, filter, sort, masonry grid)
│       │   ├── FeedCard.tsx       # Pinterest-style product card (hover overlay: Save/Buy/Like)
│       │   ├── DealsContent.tsx   # Deals page logic (fetch, filter, sort, masonry grid)
│       │   ├── DealCard.tsx       # Deal card with multi-store price comparison rows
│       │   ├── ProductDetail.tsx  # Inline product detail view (big image + info + related)
│       │   ├── ChatWindow.tsx     # AI stylist chat UI (streaming SSE, voice, visual search)
│       │   ├── MessageBubble.tsx  # Individual chat message bubble
│       │   ├── PremiumSearchBar.tsx # Unified search bar (text + voice + camera)
│       │   ├── VisualSearch.tsx   # Image upload modal (drag-drop, Gemini + SerpApi)
│       │   ├── FilterBar.tsx      # Category filter pills
│       │   ├── SearchBar.tsx      # Legacy simple search bar
│       │   └── ClientThemeToggle.tsx # Dark/light or men/women theme toggle
│       │
│       ├── context/               # React Context providers
│       │   ├── AuthContext.tsx     # JWT auth state (login, signup, logout, fetchMe)
│       │   ├── ThemeContext.tsx    # Men/Women theme preference (synced to DB)
│       │   └── GenderContext.tsx   # Gender toggle state + query prefix
│       │
│       └── data/                  # Type definitions & mock/fallback data
│           ├── feedData.ts        # FeedItem interface, FeedCategory type, mock items
│           └── dealsData.ts       # DealItem/StorePrice interfaces, DealCategory, mock deals
```

---

## Main Features

### 1. AI Fashion Stylist (`/stylist`)
- Full chat UI with streaming SSE responses from Gemini 2.5 Flash
- Fashion-only system prompt — refuses non-fashion questions
- Hinglish (Hindi-English) support
- Voice input via Web Speech API (Mic button)
- Visual search via camera button (opens VisualSearch modal)
- Suggestion chips for quick conversation starters

### 2. Trending Feed (`/feed`)
- Live product data from Google Shopping via SerpApi
- Pinterest-style masonry layout (2-6 columns, responsive)
- Category filtering (Dresses, Outerwear, Streetwear, etc.)
- Multiple sort options (trending, newest, price asc/desc, popular)
- Gender-prefixed queries (men's/women's toggle in navbar)
- Infinite scroll with IntersectionObserver
- Click-to-expand ProductDetail view with "Best Deal — Compare Prices" CTA
- Visual search: upload image to find matching products
- Bounded in-memory feed cache (OrderedDict, max 100, 1hr TTL)

### 3. Smart Deals (`/deals`)
- Real-time price comparison across 20+ Indian e-commerce platforms
- Live data from SerpApi with simulated multi-store pricing (seeded RNG for stability)
- DealCard shows: product image, rating/reviews, best price highlight, top 4 stores always visible, rest collapsible
- Store comparison rows with: price, stock status, shipping days, deal badges, buy link
- Savings percentage calculation and "Hot Deal" badges
- Category filter + sort (savings, price, rating, popular)

### 4. Visual Search
- Upload JPEG/PNG/WebP image (drag & drop or file picker)
- Backend sends image to Gemini 2.5 Flash which generates a specific e-commerce search query
- Query is then passed to SerpApi to find matching products with real prices and buy links
- Results displayed as FeedCards in modal or injected into feed

### 5. Voice Search
- Web Speech API integration (en-IN locale)
- Available in PremiumSearchBar (feed + deals pages) and ChatWindow (stylist)
- Real-time interim transcript display, auto-submit on final

### 6. Authentication & Saved Items
- JWT-based auth (register, login, 7-day token expiry)
- bcrypt password hashing
- Save/unsave products from feed cards (optimistic UI with rollback)
- Saved page (`/saved`) with masonry grid, delete support
- Theme preference (men/women) persisted to user profile in DB

### 7. Gender-Aware Shopping
- Navbar toggle switches between Men/Women
- GenderContext provides `queryPrefix` ("men's " / "women's ")
- All feed and deals API queries are automatically prefixed

---

## Important Files

| File | Purpose |
|------|---------|
| `stylo-backend/true_main.py` | FastAPI app creation, CORS, router registration, health check |
| `stylo-backend/app/core/config.py` | All settings (API keys, DB URL, JWT secret, allowed origins) |
| `stylo-backend/app/core/database.py` | SQLAlchemy engine with lazy init, SQLite/PostgreSQL auto-switch |
| `stylo-backend/app/core/security.py` | JWT encode/decode, bcrypt, `get_current_user` dependency |
| `stylo-backend/app/services/stylist.py` | Gemini chat (streaming + non-streaming), fashion-only prompt |
| `stylo-backend/app/services/shopping.py` | SerpApi Google Shopping wrapper with price extraction |
| `stylo-backend/app/services/visual_search.py` | Gemini vision: image -> e-commerce search query |
| `stylo-backend/app/api/deals.py` | Multi-store price comparison engine (20 Indian stores) |
| `stylo-frontend/src/app/layout.tsx` | Root layout — font, navbar, providers, glassmorphism orbs |
| `stylo-frontend/src/components/FeedContent.tsx` | Trending page: fetch, filter, sort, masonry, infinite scroll |
| `stylo-frontend/src/components/DealsContent.tsx` | Deals page: fetch, filter, sort, masonry grid |
| `stylo-frontend/src/components/ChatWindow.tsx` | AI stylist: streaming chat, voice, visual search |
| `stylo-frontend/src/context/AuthContext.tsx` | JWT auth state management (login/signup/logout/me) |
| `stylo-frontend/src/context/GenderContext.tsx` | Gender toggle + query prefix for gendered searches |
| `stylo-frontend/src/app/globals.css` | Theme variables, glassmorphism, masonry grid styles |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account, return JWT |
| `POST` | `/api/auth/login` | Verify credentials, return JWT |
| `GET`  | `/api/auth/me` | Get current user (JWT protected) |
| `PATCH`| `/api/auth/theme` | Update user's theme preference |
| `POST` | `/api/stylist/chat` | Full AI reply as JSON |
| `POST` | `/api/stylist/stream` | Streaming AI reply as SSE |
| `GET`  | `/api/feed` | Trending products (cached, paginated) |
| `GET`  | `/api/deals` | Live price comparison across stores |
| `GET`  | `/api/search?q=` | Text/voice product search |
| `POST` | `/api/search/visual` | Image upload -> matching products |
| `POST` | `/api/saved` | Save a product (JWT protected) |
| `GET`  | `/api/saved` | List saved products (JWT protected) |
| `DELETE`| `/api/saved/{id}` | Remove saved product (JWT protected) |
| `GET`  | `/health` | Health check (status, env, db type, version) |

---

## Setup Instructions

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+ and npm
- API keys: `GEMINI_API_KEY` (Google AI Studio) and `SERPAPI_KEY` (serpapi.com)

### Backend Setup
```bash
cd stylo-backend

# Create and activate virtual environment
python -m venv venv

# Install dependencies
venv/Scripts/pip install -r requirements.txt    # Windows
# or: venv/bin/pip install -r requirements.txt  # Linux/Mac

# Create .env file with your API keys
# Required: GEMINI_API_KEY, SERPAPI_KEY
# Optional: DATABASE_URL, JWT_SECRET_KEY

# Start the server (MUST use venv python)
venv/Scripts/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd stylo-frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

### Environment Variables (`.env` in `stylo-backend/`)
```env
GEMINI_API_KEY=your-gemini-api-key
SERPAPI_KEY=your-serpapi-key
DATABASE_URL=sqlite:///./stylo.db          # or postgresql:// for production
JWT_SECRET_KEY=your-long-random-secret     # override in production
APP_ENV=development
```

### Important Notes
- **Always use the venv Python** to start the backend — system Python won't have `pydantic_settings` installed.
- The SQLite database (`stylo.db`) is auto-created on first run.
- Frontend communicates with backend via `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:8000`).
- CORS is configured for `localhost:3000`, `localhost:8000`, and `*.vercel.app`.

---

## Notes for Future Development

- **MongoDB references** (`app/core/mongo.py`, `mongodb_url` in config) are legacy from Phase 2 planning -- not currently used. Safe to remove if not needed.
- The `data/feedData.ts` and `data/dealsData.ts` files contain **mock/fallback data** and type definitions. Live data comes from SerpApi.
- **Zustand** is installed but not actively used — React Context handles all current state. Consider migrating if state complexity grows.
- The deals API generates **simulated comparison prices** using seeded RNG. For production, integrate with actual store APIs or affiliate networks.
- **Image optimization**: FeedCard and DealCard use `<img>` tags (not Next.js `<Image>`) for external thumbnails from Google Shopping — consider adding a proxy/CDN.
- **Rate limiting**: SerpApi has usage limits. The feed cache (1hr TTL, max 100 entries) helps, but consider Redis caching for production.
- Gemini model is hardcoded to `gemini-2.5-flash` — update when newer models are available.

---

## Change Log

| Date | Change |
|------|--------|
| 2026-03-15 | Initial creation of PROJECT_CONTEXT.md — full project analysis and documentation |
