# Vercel Deployment

## Project Shape

WorkflowGuard AI is a pnpm monorepo. The deployable Next.js app lives in `apps/web`, while shared audit logic lives in workspace packages under `packages/*`.

## Recommended Vercel Settings

- Framework preset: Next.js
- Project root / root directory: `apps/web`
- Install command: `cd ../.. && pnpm install --frozen-lockfile`
- Build command: `cd ../.. && pnpm --filter @workflowguard/web build`
- Development command: `cd ../.. && pnpm --filter @workflowguard/web dev`
- Output directory: leave as Vercel default for Next.js
- Node.js version: 20 or newer

## Environment Variables

None are required for the MVP.

Do not add API keys, analytics keys, auth secrets, payment keys, or persistence credentials until the product scope explicitly includes those systems.

## Monorepo Notes

Vercel should install from the repository root so workspace dependencies resolve correctly. The app root can still be `apps/web` as long as install and build commands step back to the monorepo root.

## Common Deployment Problems

- Workspace packages cannot resolve: confirm install and build commands run from the repository root.
- Build uses an old Node runtime: set Node.js 20 or newer in Vercel project settings.
- Lockfile install fails: confirm the repository includes `pnpm-lock.yaml` and Vercel uses pnpm.
- Browser-only upload assumptions break: the MVP reads files with the browser `File` API and does not require a server upload endpoint.
- ESLint plugin warning appears during `next build`: current local builds pass with a non-blocking Next plugin-detection warning. Workspace `pnpm lint` passes.

## Tomorrow After GitHub Push

1. Create or push the public repository named `workflowguard-ai`.
2. Import the GitHub repository into Vercel.
3. Use the settings above.
4. Deploy without adding environment variables.
5. Smoke test the deployed landing, upload, and report flow with the sample workflows.
6. Add a deployment note with the final public URL.