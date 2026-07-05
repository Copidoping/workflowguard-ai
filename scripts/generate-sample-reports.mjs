import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateReport } from "../packages/report-generator/dist/index.js";
import { scoreWorkflow } from "../packages/scoring-engine/dist/index.js";
import { parseWorkflowJson } from "../packages/workflow-parser/dist/index.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "..");
const samplesDir = path.join(repoRoot, "samples");
const reportsDir = path.join(samplesDir, "reports");
const generatedAt = "2026-07-05T00:00:00.000Z";

const samples = [
  "clean-simple-workflow",
  "risky-ai-workflow",
  "webhook-missing-validation"
];

await mkdir(reportsDir, { recursive: true });

for (const sampleName of samples) {
  const source = await readFile(path.join(samplesDir, `${sampleName}.json`), "utf8");
  const workflow = parseWorkflowJson(source);
  const scoreResult = scoreWorkflow(workflow);
  const report = generateReport(workflow, scoreResult);
  report.generatedAt = generatedAt;

  await writeFile(
    path.join(reportsDir, `${sampleName}.report.json`),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );
}

console.log(`Generated ${samples.length} sample report snapshots.`);