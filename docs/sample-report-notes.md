# Sample Report Notes

The JSON files in `samples/reports` are static sample report snapshots generated from the public sample workflows.

They contain no real workflow data, no real credentials, and no customer information. They are useful for:

- QA comparisons.
- Demo screenshots.
- Public documentation examples.
- Future marketing assets.
- Verifying report shape before export features exist.

Regenerate them with:

```bash
pnpm generate:sample-reports
```

The generator builds the parser, scoring engine, and report generator packages, then writes deterministic sample report JSON with a fixed example timestamp.