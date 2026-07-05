# CI Notes

The GitHub Actions workflow is prepared locally and will run after the repository is pushed to GitHub.

## What CI Runs

- `pnpm install --frozen-lockfile`
- `pnpm typecheck`
- `pnpm test`
- `pnpm lint`
- `pnpm build`

## Secrets

No secrets are required for CI. Do not add credentials, analytics keys, payment keys, or deployment tokens to this MVP workflow.

## E2E

Playwright E2E remains local for now. It can be added to CI later with browser installation and a longer timeout budget.

## Monorepo Notes

The workflow installs dependencies from the repository root so workspace packages resolve for the Next.js app in `apps/web`.