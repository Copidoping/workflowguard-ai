# MVP for auditing no-code automations before production

Target platform: Reddit r/nocode
Recommended category/flair: Feedback, Tool, or Discussion if available
Public URL: https://workflowguard-ai.vercel.app
GitHub URL: https://github.com/Copidoping/workflowguard-ai

## Body

WorkflowGuard AI is a local-first MVP for reviewing n8n workflow JSON before production use.

The idea is simple: upload an exported workflow file and get a report covering reliability, security, maintainability, AI readiness, and production readiness.

It does not execute the workflow, does not require credentials, and does not permanently store uploaded files. The goal is to make no-code automation handoff and production review more concrete, especially when workflows include webhooks, external HTTP calls, or AI nodes.

Feedback is welcome from builders and operators who have had automations fail in production.

Try it: https://workflowguard-ai.vercel.app
GitHub / feedback: https://github.com/Copidoping/workflowguard-ai

## Safety note

Please do not upload workflows containing secrets, credentials, client data, or private workflow data.

## Feedback questions

1. Is the report useful?
2. What checks are missing?
3. Is the score too strict or too generic?
4. Would you rather have PDF export, auto-fix suggestions, template validation, or workflow history?
