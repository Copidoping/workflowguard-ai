# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| False confidence from heuristic scoring | High | Label findings as heuristic, expose checklist details, and add tests for every rule. |
| Uploaded workflow contains secrets | High | Keep MVP local-only, do not persist uploads, and flag possible hardcoded secrets. |
| Users expect workflow execution | Medium | State clearly that the MVP parses only and never executes workflows. |
| n8n node schemas change | Medium | Keep parser tolerant and add sample fixtures for new node families. |
| Scoring feels too generic | Medium | Add industry and workflow-type-specific check packs over time. |
| Real billing or auth added too early | Medium | Keep MVP self-service and local until core audit loop is validated. |
| Analytics setup leaks real keys | High | Do not configure analytics without explicit environment variable handling and secret review. |
