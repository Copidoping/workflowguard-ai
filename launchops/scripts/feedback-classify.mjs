#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const inboxPath = path.join(repoRoot, "launchops/feedback/feedback-inbox.local.json");
const classifiedPath = path.join(repoRoot, "launchops/feedback/feedback-classified.local.json");

const categories = [
  "bug",
  "unclear_ux",
  "missing_check",
  "false_positive",
  "false_negative",
  "feature_request",
  "trust_privacy_concern",
  "pricing_signal",
  "template_store_signal",
  "workflow_fixer_signal",
  "make_zapier_signal",
  "positive_validation",
  "unclear_other"
];

if (process.argv.includes("--help")) {
  console.log("Usage: pnpm feedback:classify");
  console.log(`Classifies local feedback into: ${categories.join(", ")}`);
  process.exit(0);
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeItems(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.items) ? data.items : [];
}

const rules = [
  { category: "bug", priority: 100, patterns: [/\bbug\b/i, /broken/i, /crash/i, /error/i, /does not work/i, /failed/i, /timeout/i] },
  { category: "trust_privacy_concern", priority: 95, patterns: [/privacy/i, /trust/i, /store/i, /stored/i, /upload/i, /sensitive/i, /private/i, /credential/i, /secret/i, /client data/i] },
  { category: "false_positive", priority: 90, patterns: [/false positive/i, /flagged.*wrong/i, /too strict/i, /not actually risky/i] },
  { category: "false_negative", priority: 90, patterns: [/false negative/i, /missed/i, /did not catch/i, /should have flagged/i] },
  { category: "missing_check", priority: 80, patterns: [/missing check/i, /should check/i, /also check/i, /validate/i, /schema/i, /webhook/i, /retry/i, /fallback/i, /logging/i, /alert/i] },
  { category: "workflow_fixer_signal", priority: 75, patterns: [/auto.?fix/i, /fix suggestion/i, /generate fix/i, /patch/i, /repair/i, /rewrite workflow/i] },
  { category: "template_store_signal", priority: 70, patterns: [/template/i, /pattern/i, /starter/i, /bundle/i, /store/i, /marketplace/i] },
  { category: "make_zapier_signal", priority: 65, patterns: [/\bmake\b/i, /integromat/i, /zapier/i] },
  { category: "pricing_signal", priority: 60, patterns: [/price/i, /pricing/i, /paid/i, /subscription/i, /pay/i, /cost/i, /invoice/i] },
  { category: "feature_request", priority: 55, patterns: [/feature/i, /would like/i, /could you/i, /export/i, /pdf/i, /history/i, /share/i, /team/i, /integration/i] },
  { category: "unclear_ux", priority: 50, patterns: [/confusing/i, /unclear/i, /hard to understand/i, /where do i/i, /what does.*mean/i, /ux/i, /ui/i] },
  { category: "positive_validation", priority: 40, patterns: [/useful/i, /helpful/i, /nice/i, /great/i, /works/i, /love/i, /valuable/i, /would use/i] }
];

function classify(text) {
  const matches = [];
  for (const rule of rules) {
    const hitCount = rule.patterns.filter((pattern) => pattern.test(text)).length;
    if (hitCount > 0) matches.push({ category: rule.category, score: rule.priority + hitCount });
  }
  matches.sort((a, b) => b.score - a.score);
  return {
    category: matches[0]?.category ?? "unclear_other",
    matched_categories: matches.map((match) => match.category),
    confidence: matches.length === 0 ? "low" : matches.length >= 2 ? "medium" : "low"
  };
}

async function main() {
  const inbox = readJson(inboxPath, { generated_at: null, items: [] });
  const items = normalizeItems(inbox).map((item) => {
    const text = [item.text_excerpt, item.source, item.source_url].filter(Boolean).join(" ");
    const result = classify(text);
    return {
      ...item,
      category_guess: result.category,
      matched_categories: result.matched_categories,
      classification_confidence: result.confidence,
      classified_at: new Date().toISOString()
    };
  });

  await mkdir(path.dirname(classifiedPath), { recursive: true });
  writeJson(classifiedPath, {
    generated_at: new Date().toISOString(),
    source_file: path.relative(repoRoot, inboxPath),
    categories,
    items
  });
  console.log(`Classified ${items.length} feedback item(s) into ${path.relative(repoRoot, classifiedPath)}`);
}

main().catch((error) => {
  console.error(`Feedback classify failed: ${error.message}`);
  process.exit(1);
});
