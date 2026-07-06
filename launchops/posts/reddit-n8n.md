# Local-first n8n workflow production-readiness audit MVP

Target platform: Reddit r/n8n
Recommended category/flair: Feedback, Tool, or Discussion if available
Public URL: https://workflowguard-ai.vercel.app
GitHub URL: https://github.com/Copidoping/workflowguard-ai

## Body

WorkflowGuard AI is a small MVP that audits exported n8n workflow JSON files and turns them into a production-readiness report.

It looks for review signals that often matter before a workflow goes live: missing error handling, webhook validation gaps, HTTP calls without retry/fallback indicators, AI nodes without structured output instructions, weak node naming, missing documentation notes, and possible credential-like values in node parameters.

It is intentionally local-first for now: no workflow execution, no credentials required, and no permanent upload storage.

Feedback from people who ship n8n workflows for teams or clients would be useful. What would you want this audit to catch before a production handoff?

Try it: https://workflowguard-ai.vercel.app
GitHub / feedback: https://github.com/Copidoping/workflowguard-ai

## Safety note

Please do not upload workflows containing secrets, credentials, client data, or private workflow data.

## Feedback questions

1. Is the report useful?
2. What checks are missing?
3. Is the score too strict or too generic?
4. Would you rather have PDF export, auto-fix suggestions, template validation, or workflow history?
