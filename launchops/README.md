# LaunchOps

LaunchOps is a local operating layer for WorkflowGuard AI soft-launch work. It prepares launch posts, queues them by channel, assists manual publication, records published URLs locally, fetches public feedback, classifies feedback, creates digests, and prepares issue drafts.

It is not a spam bot. It does not auto-post to communities. It does not bypass platform rules. It does not store personal credentials or require private account access.

## Safety Model

- Human approval is required before publishing anything externally.
- Drafts are copied or printed for review; the scripts never submit posts.
- Local state files ending in `.local.json` are ignored by git.
- No credentials are committed.
- Public feedback is fetched only from public pages or public APIs.
- Private pages, login-protected pages, and blocked requests are marked unavailable and skipped.
- Issue creation is dry-run by default.

## Assisted Posting

Run:

```bash
pnpm launch:assist
```

The assistant reads `launchops/queue/launch-queue.json`, selects the next draft-ready post, prints the draft, and tries to copy it to the clipboard. Use `--open` to open a configured target URL when available:

```bash
pnpm launch:assist --open
```

After manually posting, paste the public URL when prompted. It is saved to:

```text
launchops/published/published-posts.local.json
```

That file is local-only and ignored by git.

## Adding Published URLs Manually

Copy the example file:

```text
launchops/published/published-posts.local.json.example
```

Create:

```text
launchops/published/published-posts.local.json
```

Then add public post URLs under `posts`. Do not add private URLs, account data, or credentials.

## Fetching Feedback

Run:

```bash
pnpm feedback:fetch
```

The fetcher reads public GitHub Issues for `Copidoping/workflowguard-ai` and any public URLs recorded in local published-post state. It writes:

```text
launchops/feedback/feedback-inbox.local.json
```

If a source requires login, blocks public requests, or rate limits access, the item is recorded as unavailable and the script continues.

## Classification

Run:

```bash
pnpm feedback:classify
```

The classifier is deterministic and local. It uses keyword rules, not an external model. Categories include bugs, unclear UX, missing checks, false positives, false negatives, feature requests, trust/privacy concerns, pricing signal, template store signal, workflow fixer signal, Make/Zapier signal, positive validation, and unclear other.

## Digest Reports

Run:

```bash
pnpm feedback:digest
```

The digest generator writes a dated markdown report to `launchops/digests/`. It summarizes top signals, bugs, missing checks, trust/privacy concerns, feature requests, workflow fixer demand, template store demand, recommended next action, and a raw feedback index.

Generated digests are local working artifacts. Review them before sharing.

## Issue Drafts

Run:

```bash
pnpm feedback:issues
```

By default this writes issue drafts to:

```text
launchops/digests/issue-drafts.md
```

No GitHub issues are created in default mode.

Future issue creation is available only when both of these environment switches are set intentionally:

```text
GITHUB_TOKEN=<scoped runtime value>
ALLOW_CREATE_ISSUES=true
```

Do not commit those values.

## One-Command Feedback Pipeline

Run:

```bash
pnpm feedback:run
```

This runs fetch, classify, digest, and issue-draft generation.

## Validation

Run:

```bash
pnpm launchops:validate
```

The validator checks queue JSON, post file existence, ignored local state, credential hygiene, identity safety, and script help commands.

## Why Auto-Posting Is Disabled

External communities have their own rules and norms. LaunchOps is designed to help prepare and track posts, not to flood platforms or bypass moderation. A human should read each draft, adapt it to the community, and choose whether it belongs there.

## Future Safe API Adapters

Future adapters can be added only after:

- The platform explicitly allows the use case.
- Official authorization is configured outside source control.
- Rate limits and community rules are documented.
- A dry-run mode remains the default.
- Manual approval remains available before publishing.
