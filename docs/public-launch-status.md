# Public Launch Status

Date: 2026-07-05

## Public URLs

- GitHub: https://github.com/Copidoping/workflowguard-ai
- Production app: https://workflowguard-ai.vercel.app
- Sprint 04 production deployment: https://workflowguard-qy5ac1hxk-copidoping1.vercel.app
- GitHub feedback chooser: https://github.com/Copidoping/workflowguard-ai/issues/new/choose

## Sprint 04 Status

- Deployment status: Sprint 04 is deployed to production.
- Feedback CTA: live on the landing page, generated report page, example report page, footer, and issue-template flow.
- Waitlist page: live at `/waitlist` as an informational page only.
- Waitlist collection status: no email form, no email input, no submission endpoint, and no storage.
- GitHub issue templates: feedback and bug report templates are present.
- Soft-launch package: launch goals, channels, message rules, metrics, and drafts are documented.

## Git

- Branch: main
- Sprint 04 app release commit: d26f5b469b4a7efd07960332c8a021a481f85908
- Public author name: OpsForge Labs
- Public author email domain: users.noreply.github.com
- Public history status: clean public release history with brand-only author metadata

## Privacy And Security

- Personal identity scan: passed
- Personal email provider scan: passed
- Legacy project reference scan: passed
- Secret scan: passed with expected detector, documentation, and test-fixture references only
- `.env` files: none present
- Credentials: none added
- Environment variables required for MVP: none
- Authentication, payments, database persistence, analytics, and permanent upload storage: not added
- Uploaded workflow execution: not added

## Validation Results

- `pnpm typecheck`: passed
- `pnpm test`: passed, 13 unit tests
- `pnpm lint`: passed
- `pnpm build`: passed with the known non-blocking Next.js ESLint plugin warning
- `pnpm e2e`: passed, 8 Playwright tests

## Production Smoke Test

Production smoke test passed for:

- Homepage loads with feedback CTA
- Feedback links point to the GitHub issue chooser
- Waitlist page loads without collecting data
- Example report loads with feedback CTA
- Use-case pages load
- `Run free audit` opens the upload flow
- `samples/clean-simple-workflow.json` upload creates a report

## Remaining Risks

- The app has no custom domain yet.
- Feedback currently depends on GitHub Issues, so users need a GitHub account to submit structured feedback.
- The waitlist is intentionally not active until privacy copy, provider choice, retention policy, and unsubscribe handling are ready.
- Report export, shareable reports, and workflow history are not implemented yet.
- Vercel build output still shows the known Next.js ESLint plugin warning, while explicit lint passes locally.

## Next Highest-Value Task

Publish the first n8n community soft-launch post, route feedback into GitHub Issues, and use the first responses to prioritize either PDF export, sharper scoring, or safer template assets.
