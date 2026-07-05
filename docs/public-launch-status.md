# Public Launch Status

Date: 2026-07-05

## Public URLs

- GitHub: https://github.com/Copidoping/workflowguard-ai
- Production app: https://workflowguard-ai.vercel.app
- Vercel deployment: https://workflowguard-j6w584mux-copidoping1.vercel.app

## Git

- Branch: main
- Deployed release commit: c7369ed8ca542473cf1ce3f32f49de21832fff1f
- Public author name: OpsForge Labs
- Public author email domain: users.noreply.github.com
- Public history status: collapsed into one clean release commit before first push

## Privacy And Security

- Personal identity scan: passed
- Proton scan: passed
- Legacy-project reference scan: passed
- Secret scan: passed with expected detector/docs/test-fixture hits only
- `.env` files: none present in the project after deployment linking cleanup
- Credentials: none added
- Environment variables required for MVP: none
- Authentication, payments, Supabase, PostHog, analytics, and permanent upload storage: not added

## Validation Results

- `pnpm typecheck`: passed
- `pnpm test`: passed, 13 tests
- `pnpm lint`: passed
- `pnpm build`: passed with the known non-blocking Next.js ESLint plugin warning
- `pnpm e2e`: passed, 6 tests

## Vercel Deployment

- Status: deployed to production
- Framework: Next.js
- Root directory: `apps/web`
- Install command: `cd ../.. && pnpm install --frozen-lockfile`
- Build command: `cd ../.. && pnpm --filter @workflowguard/web build`
- Node.js version: 24.x
- Environment variables: none

Node.js was set to 24.x because Vercel warned that Node 20.x is deprecated for future deployments and `pnpm@11.7.0` requires a newer Node runtime than the Node 20 build image provides.

## Smoke Test

Production smoke test passed for:

- Landing page loads
- Example report loads
- Use-case pages load
- `Run free audit` opens upload flow
- `samples/clean-simple-workflow.json` upload creates a report

## Remaining Risks

- The app has no custom domain yet.
- The upload/report flow is local-first and browser/session based; no account history exists yet by design.
- Vercel build output still shows the known Next.js ESLint plugin warning, while explicit lint passes locally.
- No waitlist or feedback capture exists yet.

## Next Highest-Value Task

Add a privacy-safe waitlist or lightweight feedback capture, then prepare the first soft launch post for the n8n community.
