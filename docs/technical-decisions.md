# Technical Decisions

## Monorepo

The project uses a pnpm workspace with separate packages for parsing, scoring, and report generation. This keeps the core audit logic testable outside the web app.

## Local-Only Uploads

The upload page reads files with the browser `File` API. The JSON is parsed in memory, converted into a report, and stored only in `sessionStorage` for the report page.

## No Workflow Execution

The app never calls n8n, never follows workflow connections as executable steps, and never sends node data to external services.

## Persistence-Ready, Not Persistence-Required

The audit logic returns plain structured objects. A later persistence layer can store reports without changing parser, scorer, or report APIs.

## Vercel-Ready, Local-First

The web app is a standard Next.js app inside `apps/web`. Vercel should be configured as a monorepo project with `apps/web` as the app root and commands that install and build from the repository root:

- Install: `cd ../.. && pnpm install --frozen-lockfile`
- Build: `cd ../.. && pnpm --filter @workflowguard/web build`

## Heuristic Scoring

Scoring is rule-based for the MVP. Each rule produces explicit issues and score deductions so tests can cover the behavior and users can understand why a score changed.

HTTP request checks are split into security and reliability signals: authentication or validation indicators affect security, while retry, timeout, and fallback indicators affect reliability.

## Analytics

Analytics are intentionally not configured in this MVP. No browser tracking, external analytics service, or analytics API key is required for local development.
