# Local-first production-readiness audit for n8n workflow JSON

Target platform: n8n community
Recommended category/flair: Share / Community / Workflows, depending on current forum options
Public URL: https://workflowguard-ai.vercel.app
GitHub URL: https://github.com/Copidoping/workflowguard-ai

## Body

WorkflowGuard AI is a local-first MVP that audits exported n8n workflow JSON and returns a production-readiness report.

It checks practical signals like error handling, webhook validation, retry/fallback behavior, structured AI output instructions, documentation notes, credential references, generic node names, and possible hardcoded credential-like values.

The MVP does not execute workflows, does not require credentials, and does not permanently store uploaded workflow files. The goal is to help builders review workflows before handing them to clients or moving them into production.

I would appreciate feedback from n8n builders: what checks would make this more valuable for real handoff or production review?

Try it: https://workflowguard-ai.vercel.app
GitHub / feedback: https://github.com/Copidoping/workflowguard-ai

## Safety note

Please do not upload workflows containing secrets, credentials, client data, or private workflow data.

## Feedback questions

1. Is the report useful?
2. What checks are missing?
3. Is the score too strict or too generic?
4. Would you rather have PDF export, auto-fix suggestions, template validation, or workflow history?
