# Security Review Sprint 03

## Upload Flow

The upload page reads the selected workflow JSON through the browser `File` API. The file is parsed by local TypeScript code in the app bundle. The MVP does not create a server upload endpoint.

## Session Storage

After a successful audit, the generated report is serialized into `sessionStorage` so the report page can render inside the same browser session. This is temporary browser storage, not permanent server-side persistence.

## No External Processing

WorkflowGuard AI does not send workflow JSON to external APIs in the MVP. The current app has no analytics scripts, no telemetry setup, no payment provider, and no external persistence connection.

## No Credentials Required

Users do not need credentials to run the MVP. Sample data and templates use placeholders only. Users should avoid uploading production exports containing sensitive values until future privacy, retention, and account controls exist.

## No Workflow Execution

The app parses workflow JSON and evaluates static heuristics. It does not call n8n, trigger workflows, follow workflow connections as live steps, or call third-party systems from uploaded workflow data.

## Future Risks

If accounts, saved reports, payments, analytics, or external persistence are added later, the project will need:

- A public privacy policy.
- Data retention rules.
- Deletion flows.
- Access controls.
- Incident response process.
- Provider review.
- Clear separation between audit metadata and uploaded workflow content.