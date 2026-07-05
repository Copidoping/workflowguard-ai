# Privacy And Security Policy Draft

This draft is public-safe language for the local MVP. It is not a final legal policy.

## MVP Upload Handling

WorkflowGuard AI reads uploaded n8n workflow JSON files in the browser. The MVP parses the file locally and generates a report for the current browser session.

## No Permanent Workflow Storage

The MVP does not permanently store uploaded workflow files. Reports are kept only in browser session storage so the report page can render after the audit runs.

## No Workflow Execution

WorkflowGuard AI does not execute uploaded workflows. It does not call n8n, follow workflow connections as live steps, or trigger external services.

## No Credentials Required

No real credentials are required to use the MVP. Users should not upload workflow exports that contain real secrets, personal data, or sensitive production configuration unless a future privacy policy and retention model explicitly supports it.

## No Analytics Yet

The MVP does not include analytics tracking. Analytics should only be added after privacy review, environment variable handling, and consent expectations are documented.

## Future Considerations

If accounts, payments, saved reports, team workspaces, or external persistence are added later, the product will need:

- Clear data retention rules.
- Explicit consent for storing workflow data.
- Account deletion and report deletion flows.
- Access controls for team reports.
- Payment processor privacy disclosures.
- Incident response process.
- Data processing and subprocessor documentation.