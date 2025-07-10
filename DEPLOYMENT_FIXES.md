# Deployment Fixes for **CommandCore SaaS Forge**  
_Summary of all changes applied to achieve a green Vercel build on branch `init-scaffold` (commit 873bb05)._

---

## 1. High-Level Timeline

| Stage | Error Observed (Vercel log) | Root Cause | Fix Commit(s) |
|-------|-----------------------------|------------|---------------|
| ① Scaffold Build | Tailwind v4 plugin not found & PostCSS ESM import failure | Tailwind 4 needs `@tailwindcss/postcss` and CommonJS config | `d75eaa6` |
| ② Compilation | `serverActions` unknown option | Option was removed in Next 14 | `d75eaa6` |
| ③ CSS Generation | Missing gray palette / deprecated utilities | Tailwind 4 requires `@theme` directive | `d75eaa6` |
| ④ Type Checking | Numerous strict TS errors (Stripe, fetch body etc.) | Un-guarded optionals & outdated SDK types | `d75eaa6` |
| ⑤ Prisma | `Cannot find module '../../../../generated/prisma'` during build | Prisma client generated to custom output, import paths mis-calculated | `d75eaa6`, `d75eaa6` refactor |
| ⑥ Runtime (build-time) | Stripe & NextAuth env vars undefined at build | Eager SDK initialisation | Lazy initialisation + placeholder envs (`d75eaa6`) |
| ⑦ Static Export | `critters` module not found when prerendering `/404` & `/500` | Enabled experimental `optimizeCss` which pulls in critters but it’s pruned by pnpm script block | Removed flag (`873bb05`) |
| ⑧ Static Export | `Cannot destructure property 'data' … useSession undefined` on `/dashboard` | Auth hook evaluated during SSG | Added `export const dynamic = 'force-dynamic'` and safe guards (`873bb05`) |
| ⑨ Static Export | `useSearchParams() should be wrapped in a suspense boundary` on `/stripe-success` | Hook not within `<Suspense>` which de-opts page | Wrapped component in `Suspense` (`873bb05`) |
| ⑩ Final ✅ | Build and export succeed, deployment green | — | `873bb05` |

---

## 2. Detailed Change Log

### Tailwind / PostCSS
* Added `@tailwindcss/postcss` dev-dependency.  
* Converted `apps/web/postcss.config.js` from ESM to CJS to satisfy Next build.  
* Migrated `globals.css` to Tailwind v4 `@theme` syntax and recreated `gray` palette.

### Next.js Configuration
* Removed deprecated `serverActions` flag.  
* Disabled experimental `optimizeCss` to eliminate `critters` runtime dependency.  
* Kept `typedRoutes` and other safe experiments.

### TypeScript
* Updated `tsconfig.json`: `importsNotUsedAsValues` → `verbatimModuleSyntax`.  
* Fixed strict-mode errors across API routes and components.

### Prisma
* Ensured `prisma/schema.prisma` outputs client to `../generated/prisma`.  
* Standardised import paths:  
  * `apps/web/lib/auth.ts` → `../../../generated/prisma`  
  * `api/subscription` route → `../../../../../generated/prisma`  
  * Stripe webhook route → `../../../../../../generated/prisma`  
* Added `prisma generate` to web build script.

### Stripe Integration
* Bumped SDK to `18.3.0`, API version `2025-06-30.basil`.  
* Implemented **lazy** client initialisation inside each route to avoid env access at build-time.  
* Fixed optional `customer_email` type.

### Authentication (NextAuth)
* Centralised config in `apps/web/lib/auth.ts`.  
* Provided fallback env values for build step.  
* All route handlers now import from this central module.

### Dashboard Page
* Marked page as dynamic (`export const dynamic = 'force-dynamic'`).  
* Replaced direct destructuring with guarded access (`sessionCtx?.data`).  
* Loading and unauthenticated states handled gracefully.

### Stripe-Success Page
* Split hook logic into child component `StripeSuccessContent`.  
* Wrapped with `<Suspense>` fallback to satisfy `useSearchParams` requirement.

### Miscellaneous
* Fixed broken links (`/signup` → `/dashboard`).  
* Removed unused imports to silence ESLint.  
* Updated `pnpm-lock.yaml` after dependency additions.  

---

## 3. Lessons Learned

1. **Static Generation ≠ Client Hooks** — any page using `useSession`, `useSearchParams`, etc. must either:
   * Guard against undefined during prerender, or
   * Opt-out via `dynamic = 'force-dynamic'`, or
   * Wrap in `<Suspense>` when mandated by Next rules.

2. **Custom Prisma Output** — always calculate relative import paths from the **source file**, not the project root.

3. **Experimental Flags** — verify that enabling an experiment (e.g., `optimizeCss`) does not pull in packages removed by pnpm’s `ignore-scripts`.

4. **SDK Initialisation** — shift secret-dependent SDKs (Stripe, Auth) to _runtime_ to avoid build-time crashes in serverless pipelines.

---

## 4. Verification Checklist

- [x] `pnpm i && pnpm turbo run build` succeeds locally.  
- [x] `vercel build` completes without warnings/errors.  
- [x] Vercel preview deploy produces healthy `/404`, `/500`, `/dashboard`, `/stripe-success`.  
- [x] Auth flow & subscription webhooks verified in staging.  
- [x] Docs updated (`README.md` + this file).  

---

Deployment issues are now fully resolved. Future regressions can be caught by integrating these steps into CI.  
