# nextjs-better-auth-sample

A reference implementation of authentication and authorization in a **Next.js 16** application using [better-auth](https://www.better-auth.com/), integrated with an external Spring Boot **auth-service** for RBAC (roles, permissions, business memberships).

The project demonstrates a **four-layer frontend authorization model** and is designed with a clear migration path to **AWS Cognito**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | better-auth (email/password, JWT, email verification) |
| Database | PostgreSQL (sessions, credentials) |
| Email | Resend (verification, password reset) |
| Styling | Tailwind CSS 4 + DaisyUI 5 |
| Language | TypeScript 5 |
| Runtime | React 19, Node.js |
| Package Manager | pnpm |

---

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── api/auth/[...all]/route.ts    # Catch-all → toNextJsHandler(auth)
│   ├── dashboard/page.tsx             # Protected page with auth debug UI
│   ├── layout.tsx                     # Root layout with AuthProvider
│   └── page.tsx                       # Landing page
├── components/
│   ├── auth/
│   │   ├── HasPermission.tsx          # Layer 2 — declarative permission guard
│   │   └── HasRole.tsx                # Layer 2 — declarative role guard
│   ├── layout/                        # Navbar, Footer
│   └── ui/                            # Shared UI components
├── lib/
│   ├── auth.ts                        # better-auth server config (hooks, JWT, session)
│   ├── auth-client.ts                 # better-auth React client
│   └── auth-provider.tsx              # Layer 1 — AuthProvider (React Context)
├── services/
│   ├── auth-service.ts                # HTTP client for Spring auth-service
│   ├── auth-service-mock.ts           # In-memory mock for local dev
│   └── index.ts                       # Mock/real switcher via AUTH_SERVICE_MOCK
├── types/
│   ├── auth.ts                        # EnrichedSession, ParsedSessionFields
│   └── business.ts                    # BusinessContext, UserProfile
├── middleware.ts                       # Layer 3 — session cookie check
├── .docker/
│   └── docker-compose.yml             # PostgreSQL for local dev
└── .docs/
    └── features/
        └── frontend-auth-design.md    # Full architecture design document
```

---

## Architecture Overview

```
Browser (React)  ──▶  Next.js Server  ──▶  better-auth  ──▶  PostgreSQL
                                              │
                                              ▼
                                      auth-service (Spring Boot)
                                      (users, roles, permissions, businesses)
```

- **better-auth** owns credential storage, sessions, and JWT issuance.
- **auth-service** (external Spring Boot) owns the authorization domain model — users, roles, permissions, and business memberships.
- On sign-in/sign-up/email-verification, the session is enriched with platform roles, permissions, and business contexts fetched from the auth-service.

---

## Four-Layer Authorization Model

| # | Layer | Where | Purpose |
|---|---|---|---|
| 1 | **AuthProvider** | Browser (React Context) | Parses session, aggregates platform + active business claims, exposes `hasPermission`/`hasRole` |
| 2 | **HasPermission / HasRole** | Browser (components) | Declarative UI guards — show/hide elements based on permissions or roles |
| 3 | **Middleware** | Edge (Next.js) | Redirects unauthenticated users away from `/dashboard/*` |
| 4 | **auth-service** `POST /api/auth/check` | Server (Spring Boot) | **Real security boundary** — evaluates permissions against the database |

Layers 1–3 are UX-only (fast feedback, can be bypassed). Layer 4 is the only trusted enforcement point.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- pnpm
- Docker (for PostgreSQL)

### 1. Start PostgreSQL

```bash
cd .docker
docker compose up -d
```

This starts PostgreSQL on port **54321** (mapped from container port 5432).

### 2. Configure Environment

Copy and adjust `.env.local`:

```env
APP_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:54321/postgres?currentSchema=better-auth
BETTER_AUTH_SECRET=<generate-a-random-256-bit-hex>
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=App <onboarding@yourdomain.com>

# Auth-service RBAC integration
AUTH_SERVICE_URL=http://localhost:8080/auth-service
AUTH_SERVICE_API_VERSION=application/vnd.auth-service.v1
AUTH_SERVICE_MOCK=false
```

Set `AUTH_SERVICE_MOCK=true` to use the in-memory mock (no external auth-service required).

### 3. Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Database Schema

better-auth auto-creates its tables (`user`, `session`, `account`, `verification`) on first run. The `session` table includes four custom columns:

| Column | Type | Description |
|---|---|---|
| `roles` | text | JSON array of platform-only role names |
| `permissions` | text | JSON array of platform-only permission strings |
| `businesses` | text | JSON array of `BusinessContext` objects |
| `activeBusiness` | text | UUID of the currently selected business |

---

## Auth Flows

### Sign-Up

1. User submits name, email, password → `POST /api/auth/sign-up/email`
2. better-auth creates user in PostgreSQL (`crypto.randomUUID()` as ID)
3. `databaseHooks.user.create.after` → provisions user on auth-service (`POST /api/users`, idempotent)
4. Verification email sent via Resend
5. User clicks link → `GET /api/auth/verify-email?token=...`
6. `hooks.after` → fetches profile from auth-service (`GET /api/users/me`), enriches session
7. Redirect to `/dashboard`

### Sign-In

1. User submits email, password → `POST /api/auth/sign-in/email`
2. Credentials verified, session created
3. `hooks.after` → fetches fresh profile from auth-service, enriches session with roles/permissions/businesses
4. Session cookie set, redirect to `/dashboard`

### Session Enrichment

Runs inside `hooks.after` on `/sign-in/email`, `/sign-up/email`, and `/verify-email`:

- Fetches `UserProfile` from auth-service
- Stores **platform-only** roles/permissions in session (no aggregation)
- Stores all business memberships in `businesses` field
- Sets `activeBusiness` to the first business membership
- Aggregation (platform + active business) is a runtime concern handled by the AuthProvider

---

## JWT Claims

The JWT plugin produces tokens with 1-hour expiration:

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "custom:roles": ["PLATFORM_ADMIN"],
  "custom:permissions": ["user:read", "user:write"],
  "custom:businesses": [
    {
      "business_id": "b1a2c3d4-...",
      "member_id": "m5e6f7a8-...",
      "roles": ["CLINIC_OWNER"],
      "permissions": ["appointments:read", "appointments:write"]
    }
  ]
}
```

The `custom:` prefix mirrors AWS Cognito's naming convention for a smoother migration path.

---

## Auth-Service Integration

The external Spring Boot auth-service exposes three endpoints consumed by this project:

| Endpoint | Purpose | Called by |
|---|---|---|
| `POST /api/users` | User provisioning (idempotent, 409 ignored) | `databaseHooks.user.create.after` |
| `GET /api/users/me?user_id={id}` | Profile enrichment (roles, permissions, businesses) | `hooks.after` middleware |
| `POST /api/auth/check` | Permission evaluation (Layer 4 — real security) | Next.js API routes (server-side) |

Set `AUTH_SERVICE_MOCK=true` in `.env.local` to use the built-in in-memory mock instead.

---

## Dashboard

The `/dashboard` page serves as a debug/demo UI showing:

- User profile
- Aggregated auth context (roles, permissions after platform + business merge)
- Business context switcher (re-aggregates claims without a new token)
- Layer 2 examples (`HasPermission`, `HasRole` components in action)
- JWT token viewer with decoded payload
- Raw session details

---

## Cognito Migration Path

The architecture is designed for a future migration to AWS Cognito with minimal changes:

| What changes | What stays the same |
|---|---|
| `lib/auth.ts` → deleted | `services/auth-service.ts` |
| `lib/auth-client.ts` → Amplify client | `types/business.ts`, `types/auth.ts` |
| `middleware.ts` → Cognito token check | `lib/auth-provider.tsx` (AuthProvider) |
| `app/api/auth/[...all]/route.ts` → deleted | `components/auth/HasPermission.tsx`, `HasRole.tsx` |
| + Post Confirmation Lambda | `POST /api/auth/check` (Layer 4) |
| + Pre Token Generation Lambda | All Spring auth-service code |

See [`.docs/features/frontend-auth-design.md`](.docs/features/frontend-auth-design.md) for the full migration checklist, adapter pattern proposal, and risk assessment.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## License

[MIT](LICENSE) © cjrequena
