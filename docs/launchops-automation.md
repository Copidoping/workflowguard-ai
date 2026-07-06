# LaunchOps Automation

LaunchOps is the local launch and feedback operations layer for WorkflowGuard AI. It turns soft-launch work into repeatable steps without turning the product into a spam machine.

## Architecture

- `launchops/config/` stores safe example channel configuration.
- `launchops/posts/` stores final human-reviewed post drafts.
- `launchops/queue/` defines the order and status of launch targets.
- `launchops/published/` stores examples plus ignored local published-post state.
- `launchops/feedback/` stores examples plus ignored local feedback inbox and classification state.
- `launchops/digests/` stores digest documentation and generated local summaries.
- `launchops/scripts/` contains the local automation commands.

## Privacy Boundaries

- LaunchOps does not collect emails.
- LaunchOps does not store private workflow files.
- LaunchOps does not execute workflows.
- LaunchOps does not require credentials for default commands.
- LaunchOps does not scrape private or login-protected pages.
- LaunchOps stores only public feedback excerpts from public sources.
- Secret-like values in fetched text are redacted on a best-effort basis.

## Supported Channels

Initial channel support is intentionally conservative:

- n8n community: manual-assist mode.
- Reddit r/n8n: manual-assist mode.
- Reddit r/nocode: manual-assist mode.
- Indie Hackers: manual-assist mode.
- Product Hunt teaser: manual-assist mode for later launch preparation.
- GitHub Issues: public feedback sink.

## Manual-Assist Mode

Manual-assist mode means the tool can:

- Select the next queued draft.
- Print the target platform and instructions.
- Copy draft text to the clipboard when available.
- Optionally open the target URL.
- Record the published URL locally after a human posts.

Manual-assist mode does not submit posts or comments.

## Feedback Pipeline

The local pipeline is:

```bash
pnpm feedback:fetch
pnpm feedback:classify
pnpm feedback:digest
pnpm feedback:issues
```

Or:

```bash
pnpm feedback:run
```

Default outputs are local files that should be reviewed before sharing or turning into product work.

## Future API Adapters

Future adapters may support official platform APIs, but only with explicit authorization and clear rules:

- Dry run remains the default.
- Human approval remains possible before publishing.
- Runtime credentials stay outside source control.
- Rate limits and platform rules are respected.
- Failed or blocked sources are skipped instead of bypassed.

## Reddit And Forum Caveats

Reddit and forum communities can reject promotional posts, block automated requests, or require specific categories. LaunchOps should be used to prepare careful posts and track public feedback, not to mass-post or scrape around access controls.

## No-Spam Policy

WorkflowGuard AI launch operations should be useful, transparent, and low-volume:

- Post only where the product is relevant.
- Ask for feedback instead of claiming broad proof.
- Avoid repeated reposting.
- Do not use fake social proof.
- Respect moderator feedback.
- Stop posting to channels where the product is not welcome.

## Next Upgrades

- Add a review checklist before each post is marked publishable.
- Add source-specific parsers only where public access is stable.
- Add duplicate detection across feedback sources.
- Add a lightweight priority score for issue drafts.
- Add optional screenshots for posts after a design pass.
