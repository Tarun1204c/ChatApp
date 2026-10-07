# Convo — AI Chat Application

Real-time AI chat with streaming responses, guest access, authentication, and image input.

**Live:** https://chatapp-3tlo.onrender.com

**Stack:** React (Vite) · Redux Toolkit · Node.js/Express · Socket.IO · MongoDB · LangChain · Google Gemini

---

## What it does

- Chat with an AI model using token-by-token streaming over Server-Sent Events.
- Offer a guest trial with two free messages before login is required.
- Support registration, login, and cookie-based session authentication.
- Attach PNG, JPEG, or WebP images up to 4 MB with a message.
- Connect to the backend in real time through Socket.IO.

## Architecture

### Frontend

The SPA lives in `Frontend/` and is built with Vite.hip rate limit link https://chatapp-3tlo.onrender.com/

- React 19 and React Router
- Redux Toolkit for authentication and chat state
- Axios with `withCredentials` for API requests
- Socket.IO client for real-time connections
- A custom SSE reader for streamed AI responses

### Backend

The Express application lives in `Backend/` and also serves the built frontend.

API routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/get-me`
- `GET /api/auth/verify-email`
- `GET /api/chats`
- `GET /api/chats/:chatId/messages`
- `POST /api/chats/message` — streams AI output as SSE
- `DELETE /api/chats/delete/:chatId`

Authentication uses an HttpOnly cookie. The frontend and API share the same origin in production, so no authentication token is stored in browser storage.

## Streaming design

Server-Sent Events are used for AI responses because the stream is one-directional: the server sends tokens to the client.

The server emits:

- `event: token` with a text chunk
- `event: done` when generation finishes
- `event: error` when generation fails

The client appends tokens to the active message and restores the input state on an error.

## Security and abuse hardening

All limits are enforced server-side.

- `trust proxy` reads the real client IP from `X-Forwarded-For` behind Render's proxy.
- Global API rate limiting protects `/api`.
- A stricter limiter protects `/api/chats/message`, which is the expensive LLM route.
- The chat limiter runs before the 8 MB chat body parser, so rejected requests do not consume parse resources.
- Helmet provides security headers, including an explicit CSP for data-URL images and WebSocket/SSE connections.
- Auth requests use the default small JSON body limit; chat requests may use up to 8 MB JSON.
- The central error handler returns JSON responses and avoids rewriting headers after the SSE stream has started.

## Known tradeoffs

- **Cold start:** the free Render instance can sleep after inactivity. A production deployment should use an always-on instance or keep-warm scheduling.
- **In-memory rate limits:** limits reset on restart and are not shared across multiple service instances. Redis would be appropriate for horizontal scaling.
- **Guest quota:** the guest counter is stored client-side. Clearing cookies or using incognito mode resets it. This is acceptable for a demo trial but should be moved server-side.

## Roadmap

- [ ] Move guest quota tracking server-side with a signed HttpOnly cookie or server-side counter.
- [ ] Replace the current provider-specific implementation behind a single `streamCompletion()` abstraction.
- [ ] Add Redis-backed rate limiting and quota storage for multi-instance deployments.

## Local setup

### 1. Backend

```bash
cd Backend
npm install
```

Create a local environment file:

```bash
cat > .env <<'EOF'
PORT=3000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
GOOGLE_API_KEY=your-google-gemini-key
MISTRAL_API_KEY=your-mistral-key
API_RATE_LIMIT_MAX=60
CHAT_RATE_LIMIT_MAX=10
EOF
```

Start the backend:

```bash
npm run dev
```

The backend runs on port `3000` by default.

### 2. Frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The Vite frontend runs on the default port `5173` unless configured otherwise.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend port; defaults to `3000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens and email verification tokens |
| `GOOGLE_API_KEY` | Google Gemini API key used for chat generation |
| `MISTRAL_API_KEY` | Mistral API key used for chat-title generation |
| `API_RATE_LIMIT_MAX` | Global `/api` requests per minute per IP |
| `CHAT_RATE_LIMIT_MAX` | `/api/chats/message` requests per minute per IP |
| `VITE_API_URL` | Optional frontend API base URL; defaults to `http://localhost:3000` in development |

The current backend configuration reads `MONGO_URI`, not `MONGODB_URI`.

## Local verification

```bash
# Backend tests
cd Backend
node --test test/rate-limit.test.js

# Frontend build
cd ../Frontend
npm run build
```

The frontend build output is generated in `Frontend/dist/`. The backend serves this directory after building.

## Deployment

The backend is configured to serve the frontend build from `Backend/public/dist/`.

For Render:

1. Set the backend working directory to `Backend`.
2. Set the Node start command to `node server.js`.
3. Configure the environment variables above.
4. Add `VITE_API_URL` only if the deployed frontend must point to a non-default API origin.
5. Build and deploy from a repository root that includes both the `Backend` and `Frontend` directories.
