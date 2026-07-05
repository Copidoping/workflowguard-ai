# WorkflowGuard AI

Production-readiness audits for n8n and AI automation workflows.

WorkflowGuard AI is a local-first MVP that audits exported n8n workflow JSON files before production release. It parses a workflow, scores reliability, security, maintainability, AI readiness, and production readiness, then renders a structured report with issues, fixes, checklist items, and next steps.

## What is included

- Next.js web app in `apps/web`
- TypeScript parser package in `packages/workflow-parser`
- TypeScript scoring package in `packages/scoring-engine`
- TypeScript report package in `packages/report-generator`
- Sample n8n workflow JSON files in `samples`
- Product, technical, and launch-readiness docs in `docs`

## Safety boundaries

- No real API keys are required.
- Uploaded files are read in the browser and are not stored permanently.
- Uploaded workflows are parsed only; they are never executed.
- Billing and authentication are intentionally not connected yet.
- No external database, analytics service, or payment provider is required for the MVP.
- Sample credential-like values are fake fixtures used to verify detection behavior.

## Setup

Prerequisites:

- Node.js 20 or newer
- pnpm 11 or newer

```bash
pnpm install
pnpm dev
```

The web app runs at `http://localhost:3000` by default.

## Sample workflows

Use these files to verify the local MVP manually:

- `samples/clean-simple-workflow.json`
- `samples/risky-ai-workflow.json`
- `samples/webhook-missing-validation.json`

## Useful commands

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

After Playwright is installed, the browser E2E suite can be run with:

```bash
pnpm e2e
```

## MVP workflow

1. Open the app.
2. Click `Run free audit`.
3. Upload an exported n8n workflow `.json` file.
4. Review the generated production-readiness report.

## Vercel notes

The Next.js app lives in `apps/web`, but install and build commands should run from the repository root so workspace packages resolve correctly. See `docs/vercel-deployment.md` for deployment settings.

## Public Demo Assets

- Static example report route: `/example-report`
- Use-case routes under `/use-cases/*`
- Sample report snapshots in `samples/reports`
- Educational workflow templates in `templates/n8n`

Generate sample report snapshots with:

```bash
pnpm generate:sample-reports
```