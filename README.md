# CommandCore SaaS Forge

> The all-in-one AI-powered monorepo that scaffolds, builds, tests and deploys SaaS products **faster** than humanly possible.

| Stack | Details |
|-------|---------|
| Front-end | **Next.js 14** • TypeScript • Tailwind CSS v4 |
| Back-end | **FastAPI** (Python 3.12) |
| Agents  | **LangGraph** workflows (`packages/agents`) |
| Database | PostgreSQL (via Supabase) • Prisma |
| Tooling | pnpm workspaces • GitHub Actions • Vercel • Railway |

---

## Architecture

```mermaid
graph TD
  subgraph Monorepo
    direction LR
    Root["`commandcore/`"] --> Web["`apps/web`"]
    Root --> API["`apps/api`"]
    Root --> Agents["`packages/agents`"]
    Root --> Prisma["`prisma/`"]
    Agents <-->|Shared types & logic| Web
    Agents <-->|Shared types & logic| API
  end

  classDef box fill:#0ea5e9,stroke:#0369a1,color:#fff
  class Web,API,Agents,Prisma box

  subgraph Infra & CI/CD
    CI[GitHub Actions] -->|ci.yml| Check[lint ➜ test ➜ build]
    CI -->|deploy.yml| Vercel[Vercel (Next.js)] & Railway[Railway (FastAPI)]
  end
```

---

## Getting Started

### 1 — Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | ≥ 8 |
| Python | 3.12 |
| PostgreSQL | 15 + (or Supabase) |

Optional: Docker for local Postgres.

### 2 — Clone & Install

```bash
git clone https://github.com/your-org/commandcore.git
cd commandcore

# install JavaScript/TypeScript workspaces
pnpm install
```

### 3 — Environment Variables

1. Copy template  
   `cp .env.example .env`
2. Fill in values for database, OpenAI, Stripe, Vercel, Railway, etc.

### 4 — Database Setup

Create a local Postgres db (or use Supabase) and export `DATABASE_URL`.

```bash
# run migrations & generate client
pnpm exec prisma migrate dev --name init
```

### 5 — Run the Monorepo

| Service | Command | URL |
|---------|---------|-----|
| Web (Next.js) | `pnpm dev:web` | http://localhost:3000 |
| API (FastAPI) | `cd apps/api && uvicorn app.main:app --reload` | http://localhost:8000 |
| Agents (watch build) | `pnpm --filter @commandcore/agents dev` | — |

> Tip: run `pnpm -r dev` to start all watch tasks concurrently.

---

## Scripts (Top-Level)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Recursively start all `dev` scripts |
| `pnpm build` | Build every workspace |
| `pnpm lint` | ESLint (`web`, `agents`) + Ruff (`api`) |
| `pnpm test` | Jest + PyTest |

---

## Continuous Integration

`/.github/workflows/ci.yml`

1. **lint** – ESLint & Ruff  
2. **test** – Jest & PyTest  
3. **build** – TypeScript build + FastAPI import check  

---

## Continuous Deployment

`/.github/workflows/deploy.yml`

| Target | Platform | Trigger |
|--------|----------|---------|
| Web | Vercel | After push to `main` |
| API | Railway | After push to `main` |
| DB  | Prisma migrations | Post-deploy |

Secrets required: `VERCEL_TOKEN`, `RAILWAY_TOKEN`, `DATABASE_URL`, etc.

---

## Strict Type Safety

* Global `tsconfig.json` enables **`"strict": true`** plus advanced compiler flags.  
* Python code is typed and checked with **`mypy --strict`**.

---

## LangGraph Agents

Reusable AI workflows live in `packages/agents` and can be imported by **both** the Next.js frontend and the FastAPI backend:

```ts
import { createIdeaAgent } from '@commandcore/agents'
```

---

## Contributing

1. Create a feature branch  
2. Follow workspace linting rules (`pnpm lint`)  
3. Commit with conventional commits  
4. Open a PR—initial scaffold PR name is **`init-scaffold`**

---

## License

MIT © CommandCore Team
