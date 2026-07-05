# Tomorrow Operator Checklist

GitHub and deployment work is intentionally deferred until user approval, browser login, and CLI access are available.

## Required User Approvals And Actions

1. Install or approve GitHub CLI if it is still missing.
2. Complete GitHub browser login.
3. Resolve GitHub username and numeric user ID.
4. Construct GitHub noreply email from the authenticated account.
5. Replace the temporary local Git email with GitHub noreply.
6. Rewrite commits before first public push if needed.
7. Create the public GitHub repository named `workflowguard-ai`.
8. Push branch `main`.
9. Import the repository into Vercel.
10. Deploy with the documented monorepo settings.
11. Smoke test the deployed app with all sample workflows.
12. Optionally add a custom domain later.
13. Only after deployment works, consider a public waitlist or analytics plan through a separate privacy review.

## Do Not Do Tomorrow Unless Explicitly Requested

- Do not add authentication.
- Do not add payments.
- Do not add external persistence.
- Do not add analytics keys.
- Do not upload real workflow secrets.
- Do not push any personal author identity.