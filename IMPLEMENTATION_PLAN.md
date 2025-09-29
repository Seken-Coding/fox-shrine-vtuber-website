# Full Integration Blueprint

## Scope Overview
- **Task Types:** Code enhancement, refactoring, testing expansion, documentation, operational hardening.
- **Primary Goals:**
  - Align frontend structure, navigation, and animations with React 19 and React Router 7 guidance from Context7 (`/reactjs/react.dev`, `/remix-run/react-router`).
  - Modularize and secure the Express 4 API following Express Router organization best practices from Context7 (`/expressjs/express`) and trust proxy requirements from express-rate-limit guidance (`/express-rate-limit/express-rate-limit`).
  - Expand automated testing across frontend (Jest + RTL) and backend (Jest + Supertest) while adding CI and linting automation.
  - Improve operational readiness with structured logging, readiness endpoints, and updated documentation.

## Execution Phases

### 1. Frontend Architecture
- **Routing & Layout:**
  - Extract a dedicated `NotFoundPage` component and wrap `Routes` with `Suspense` to support lazy-loaded pages (Context7 React routing guidance on leveraging routers for parallel code/data fetching).
  - Normalize layout composition so `ErrorBoundary` wraps the router but resides within `<main>` for consistent semantics.
- **Navigation:**
  - Drive desktop and mobile nav links from a shared configuration array to avoid duplication.
  - Apply React Router 7 `viewTransition` props where feasible for smoother navigations, referencing Context7 view transition docs.
- **Accessibility & UX:**
  - Add `aria-expanded` / `aria-controls` to the mobile menu button and ensure high-contrast Tailwind styles.
  - Provide alt text for placeholders and ensure focus trapping in modals.
- **Performance Enhancements:**
  - Lazy-load animation-heavy components (e.g., `SakuraPetals`, `AnimationComponents`) via `React.lazy` and guard with `prefers-reduced-motion` checks.
  - Memoize expensive providers to reduce rerenders.

### 2. Backend Modularization & Security
- **Router Extraction:**
  - Split authentication, configuration, content, and utility endpoints into dedicated router modules per Context7 Express modular routing patterns.
  - Centralize middleware (logging, rate limiting, audit trail) in `/api/middleware/`.
- **Environment Validation:**
  - Introduce startup validation for required env vars (JWT secret, database credentials, rate limits) with fail-fast behavior in all environments.
- **CORS & Rate Limiting:**
  - Normalize allowlist checks and return explicit 403 responses for disallowed origins, logging via structured logger (e.g., `pino`).
  - Confirm `trust proxy` alignment with express-rate-limit recommendations and configure validation flags appropriately.
- **Observability:**
  - Add readiness endpoint verifying DB connectivity and env integrity.
  - Integrate structured logging pipeline (JSON output) with per-request correlation IDs.

### 3. Testing & Tooling
- **Backend Testing:**
  - Add Jest + Supertest configuration under `/api` with fixtures/mocks for MSSQL (use connection pool mocks).
  - Cover health checks, auth login, and configuration read/write flows (including category fetch, bulk update success/validation failure, delete success/404, and permission rejection paths) to validate modular routers end-to-end.
  - Cover auth flows, CORS rejection, and configuration CRUD.
- **Frontend Testing:**
  - Extend RTL coverage for `Navbar`, `ProtectedRoute`, `AuthModal`, and lazy-loading flows.
  - Ensure new behavior (view transitions toggle, reduced motion) have targeted tests.
- **Linting & Formatting:**
  - Introduce shared ESLint config with React, Testing Library, and Jest plugins; add Prettier config.
  - Wire npm scripts (`lint`, `format`, `lint:fix`) at root and per package as needed.
- **CI Pipeline:**
  - Configure GitHub Actions workflow covering dependency install, lint, frontend tests, backend tests, and coverage upload.

### 4. Operational Enhancements & Docs
- **Health Monitoring:**
  - Separate `/api/health` (liveness) and `/api/ready` (readiness) endpoints.
  - Provide optional `/api/metrics` stub for future instrumentation (e.g., Prometheus).
- **Documentation Updates:**
  - Update `README.md`, `DATABASE_SETUP.md`, and new `IMPLEMENTATION_PLAN.md` with steps, env vars, and testing instructions.
  - Document seeding scripts and new CI commands.

## Dependencies & Sequencing
1. Complete frontend structural work before adding tests to avoid churn.
2. Modularize backend prior to adding Supertest coverage to maintain stable import paths.
3. Establish linting/tooling before CI to ensure workflows reference finalized scripts.
4. Perform full test/coverage run after all code changes, followed by documentation refresh.

## Validation Matrix
- **Build:** `npm run build` in `fox-shrine-vtuber` and `npm install && npm test` in `/api`.
- **Lint:** `npm run lint` (root and packages).
- **Frontend Tests:** `npm run test -- --runInBand` plus targeted watch runs.
- **Backend Tests:** `npm test` under `/api` (Jest + Supertest).
- **Smoke:** Manual API health check via `curl` against `/api/health` and `/api/ready`.

## Rollback Considerations
- Maintain modular commits per milestone for easier reversion.
- Preserve existing SQL scripts and configuration defaults; no destructive schema migrations included.

---
*Context7 references: React Router view transitions (docs/how-to/view-transitions.md), React routing modernization (react.dev blog on sunsetting CRA), Express router modularization examples (express examples README), express-rate-limit proxy configuration guidance (docs/reference/configuration.mdx).*