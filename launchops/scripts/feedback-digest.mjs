#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const classifiedPath = path.join(repoRoot, "launchops/feedback/feedback-classified.local.json");
const inboxPath = path.join(repoRoot, "launchops/feedback/feedback-inbox.local.json");
const digestDir = path.join(repoRoot, "launchops/digests");
const today = new Date().toISOString().slice(0, 10);
const digestPath = path.join(digestDir, `${today}-feedback-digest.md`);

if (process.argv.includes("--help")) {
  console.log("Usage: pnpm feedback:digest");
  console.log("Generates a local markdown feedback digest from classified feedback.");
  process.exit(0);
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function normalizeItems(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

function countByCategory(items) {
  const counts = new Map();
  for (const item of items) {
    const category = item.category_guess ?? "unclear_other";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function sectionFor(items, categories) {
  const selected = items.filter((item) => categories.includes(item.category_guess));
  if (selected.length === 0) return "- None yet.";
  return selected.slice(0, 10).map((item) => {
    const source = item.raw_url || item.source_url || "unknown source";
    const text = (item.text_excerpt || "No excerpt").replace(/\s+/g, " ").trim();
    return `- ${text} (${source})`;
  }).join("\n");
}

function recommend(items) {
  const categories = countByCategory(items).map(([category]) => category);
  if (categories.includes("bug")) return "Triage bugs first and turn the clearest report into a GitHub issue draft.";
  if (categories.includes("trust_privacy_concern")) return "Clarify safety copy around local upload behavior before adding new product features.";
  if (categories.includes("missing_check")) return "Prioritize one high-signal scoring rule requested by builders.";
  if (categories.includes("workflow_fixer_signal")) return "Explore scoped auto-fix suggestions as a future paid/report feature.";
  if (categories.includes("template_store_signal")) return "Package the strongest safer-workflow patterns into public templates.";
  if (items.length === 0) return "Publish the first soft-launch post and fetch feedback after the public URL has comments.";
  return "Review the raw feedback index and choose the most repeated pain point.";
}

async function main() {
  const source = existsSync(classifiedPath) ? classifiedPath : inboxPath;
  const data = readJson(source, { items: [] });
  const items = normalizeItems(data).filter((item) => item.status !== "unavailable");
  const categoryCounts = countByCategory(items);
  const topSignals = categoryCounts.length === 0
    ? "- No feedback signals yet."
    : categoryCounts.map(([category, count]) => `- ${category}: ${count}`).join("\n");
  const rawIndex = items.length === 0
    ? "- No feedback items yet."
    : items.map((item, index) => `- ${index + 1}. ${item.category_guess ?? "unclear_other"} - ${item.raw_url || item.source_url || "unknown source"}`).join("\n");

  const markdown = `# WorkflowGuard AI Feedback Digest - ${today}

## Summary

- Feedback items reviewed: ${items.length}
- Source file: ${path.relative(repoRoot, source)}
- Generated locally by LaunchOps. Review before sharing.

## Top Signals

${topSignals}

## Bugs

${sectionFor(items, ["bug"])}

## Missing Checks

${sectionFor(items, ["missing_check", "false_negative"])}

## Trust / Privacy Concerns

${sectionFor(items, ["trust_privacy_concern"])}

## Feature Requests

${sectionFor(items, ["feature_request", "unclear_ux", "false_positive"])}

## Workflow Fixer Demand

${sectionFor(items, ["workflow_fixer_signal"])}

## Template Store Demand

${sectionFor(items, ["template_store_signal"])}

## Recommended Next Action

${recommend(items)}

## Raw Feedback Index

${rawIndex}
`;

  await mkdir(digestDir, { recursive: true });
  writeFileSync(digestPath, markdown, "utf8");
  console.log(`Wrote digest to ${path.relative(repoRoot, digestPath)}`);
}

main().catch((error) => {
  console.error(`Feedback digest failed: ${error.message}`);
  process.exit(1);
});
