# WorkflowGuard AI

Production-readiness audits for n8n and AI automation workflows.

WorkflowGuard AI is a local-first MVP that audits exported n8n workflow JSON files before production release. It parses a workflow, scores reliability, security, maintainability, AI readiness, and production readiness, then renders a structured report with issues, fixes, checklist items, and next steps.

- Production app: https://workflowguard-ai.vercel.app
- Feedback and bug reports: https://github.com/Copidoping/workflowguard-ai/issues/new/choose

## What is included

- Next.js web app in `apps/web`
- TypeScript parser package in `packages/workflow-parser`
- TypeScript scoring package in `packages/scoring-engine`
- TypeScript report package in `packages/report-generator`
- Sample n8n workflow JSON files in `samples`
- Product, technical, and launch-readiness docs in `docs`
- GitHub issue templates for privacy-safe feedback and bug reports

## Current MVP scope

- Upload an exported n8n workflow `.json` file.
- Parse workflow metadata and node structure.
- Score reliability, security, maintainability, AI readiness, production readiness, and overall readiness.
- Show a structured report with critical issues, warnings, recommended fixes, a checklist, and next steps.
- Provide an example report and use-case pages.
- Route feedback through GitHub Issues instead of collecting email or workflow data.

## Safety boundaries

- No real API keys are required.
- Uploaded files are read in the browser and are not stored permanently.
- Uploaded workflows are parsed only; they are never executed.
- Billing and authentication are intentionally not connected yet.
- No external database, analytics service, email collection backend, or payment provider is required for the MVP.
- Sample credential-like values are fake fixtures used to verify detection behavior.
- Do not upload secrets, credentials, or private workflow data when giving feedback.

## Setup

Prerequisites:

- Node.js 24 recommended for parity with the Vercel deployment runtime
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
pnpm e2e
```

Generate sample report snapshots with:

```bash
pnpm generate:sample-reports
```

## MVP workflow

1. Open the app.
2. Click `Run free audit`.
3. Upload an exported n8n workflow `.json` file.
4. Review the generated production-readiness report.
5. Use the feedback link to share what the report missed.

## Public demo assets

- Static example report route: `/example-report`
- Waitlist preparation page: `/waitlist`
- Use-case routes under `/use-cases/*`
- Sample report snapshots in `samples/reports`
- Educational workflow templates in `templates/n8n`

## Roadmap

- PDF and HTML report export
- Shareable audit reports
- Optional workflow history after privacy and storage policy work
- Template store
- Make and Zapier support exploration
- Team-ready audits

## Feedback

Feedback is handled through GitHub Issues for now:

https://github.com/Copidoping/workflowguard-ai/issues/new/choose

Please keep reports public-safe. Do not paste secrets, credentials, private workflow data, or customer data.

## Vercel notes

The Next.js app lives in `apps/web`, but install and build commands should run from the repository root so workspace packages resolve correctly. See `docs/vercel-deployment.md` for deployment settings.