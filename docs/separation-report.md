# Separation Report

## Result

WorkflowGuard AI has been separated into a clean local project folder named `workflowguard-ai`.

## Source Review

The original Desktop source folder contained a mixture of WorkflowGuard AI files and unrelated mobility, fitness, 3D, rendering, and legacy project artifacts. The unrelated files were intentionally not copied into the clean WorkflowGuard AI project.

## Copied Into The Clean Project

- `apps/web`
- `packages/workflow-parser`
- `packages/scoring-engine`
- `packages/report-generator`
- `samples`
- Product and technical docs related to WorkflowGuard AI
- Root project files: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `eslint.config.mjs`, `.gitignore`, and `README.md`

## Intentionally Not Copied

- Mobility and fitness app source files
- 3D, Blender, rendering, and animation assets
- Legacy visual iteration reports unrelated to WorkflowGuard AI
- Generated dependency folders and build artifacts
- Local Git history from the mixed source folder

## Confirmation

The old mobility project remains separate. WorkflowGuard AI should now be developed from the clean `workflowguard-ai` project folder only.
