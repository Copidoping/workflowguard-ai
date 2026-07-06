# Building a micro-SaaS for production-readiness audits of n8n workflows

Target platform: Indie Hackers
Recommended category/flair: Build in public / Feedback / Product
Public URL: https://workflowguard-ai.vercel.app
GitHub URL: https://github.com/Copidoping/workflowguard-ai

## Body

WorkflowGuard AI is a small self-service product for auditing n8n and AI automation workflows before they go into production.

The MVP is deliberately narrow: upload workflow JSON, parse it, score it, and return a report with issues and recommended fixes. It is local-first right now: no accounts, no payments, no workflow execution, and no permanent upload storage.

The first market to validate is automation consultants and teams that need a client handoff or release-readiness report.

Feedback on the wedge would be useful: would a production-readiness report help you trust, sell, or maintain automation work?

Try it: https://workflowguard-ai.vercel.app
GitHub / feedback: https://github.com/Copidoping/workflowguard-ai

## Safety note

Please do not upload workflows containing secrets, credentials, client data, or private workflow data.

## Feedback questions

1. Is the report useful?
2. What checks are missing?
3. Is the score too strict or too generic?
4. Would you rather have PDF export, auto-fix suggestions, template validation, or workflow history?
