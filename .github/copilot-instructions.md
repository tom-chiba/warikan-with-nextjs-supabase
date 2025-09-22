# Copilot Instructions for AI Coding Agents

## Overview
This project is a Next.js + Supabase starter kit for building web applications with authentication, data management, and modern UI. It uses the App Router, Tailwind CSS, and integrates Supabase for backend services.

## Architecture & Key Patterns
- **App Directory Structure**: Uses Next.js App Router (`/app`). Pages are organized by feature (e.g., `/authenticated/member`, `/authenticated/purchase/[id]/edit`).
- **Component Organization**: UI and logic are separated into `components/` (shared UI), `app/(authenticated)/_components/` (feature-specific), and `app/(authenticated)/_hooks/` (custom hooks).
- **Supabase Integration**: All backend data and authentication flows use Supabase. See `utils/supabase/` for client/server logic.
- **Testing**: Uses Playwright for E2E tests (`tests/playwright/`) and Vitest for component/unit tests (`*.comp.test.tsx`).
- **Styling**: Tailwind CSS is configured via `tailwind.config.js` and used throughout components.

## Developer Workflows
- **Start Dev Server**: `npm run dev` (Next.js local server)
- **Run All Tests**: `npm run test:comp` (component/unit tests), `npm run test:e2e` (E2E tests)
- **Playwright Setup**: E2E tests require Playwright; see `tests/playwright/` for setup.
- **Supabase Setup**: Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Project-Specific Conventions
- **File Naming**: Client/server components are explicitly named (`ClientXxx.tsx`, `ServerXxx.tsx`).
- **Hooks**: Custom hooks are in `app/(authenticated)/_hooks/` and prefixed with `use`.
- **Test Files**: Component tests are colocated and suffixed with `.comp.test.tsx`.
- **Error Handling**: Global error handling via `app/global-error.tsx`.
- **Auth Flow**: Auth logic is in `app/auth/callback/route.ts` and `app/(unauthenticated)/login/`.

## Integration Points
- **Supabase**: All data and auth via Supabase (`utils/supabase/`).
- **Middleware**: See `middleware.ts` for request/response logic.
- **UI Components**: Shared UI in `components/ui/`, feature UI in `app/(authenticated)/_components/`.

## Examples
- To add a new authenticated page: create a folder in `app/(authenticated)/` and add `page.tsx`.
- To add a new table UI: add a component in `app/(authenticated)/_components/` and test in `*.comp.test.tsx`.

## References
- See `README.md` for setup, demo, and deployment instructions.
- See `db_design_document.md` for database schema and design notes.

---

**Update this file if you introduce new conventions or workflows.**
