#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const classifiedPath = path.join(repoRoot, "launchops/feedback/feedback-classified.local.json");
const issueDraftPath = path.join(repoRoot, "launchops/digests/issue-drafts.md");
const repo = "Copidoping/workflowguard-ai";
const apiUrl = `https://api.github.com/repos/${repo}/issues`;

if (process.argv.includes("--help")) {
  console.log("Usage: pnpm feedback:issues");
  console.log("Writes local GitHub issue drafts. Creates real issues only if GITHUB_TOKEN and ALLOW_CREATE_ISSUES=true are set.");
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

function summarize(text) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > 260 ? `${clean.slice(0, 257)}...` : clean || "No summary available.";
}

function titleFor(item) {
  const category = item.category_guess ?? "feedback";
  if (category === "bug") return "Investigate launch feedback bug report";
  if (category === "missing_check") return "Evaluate requested audit check";
  if (category === "trust_privacy_concern") return "Clarify privacy and upload safety copy";
  if (category === "workflow_fixer_signal") return "Explore workflow fixer demand";
  if (category === "template_store_signal") return "Evaluate template store signal";
  if (category === "feature_request") return "Evaluate feature request from launch feedback";
  return "Review launch feedback signal";
}

function labelFor(category) {
  const map = {
    bug: "bug",
    unclear_ux: "ux",
    missing_check: "scoring",
    false_positive: "scoring",
    false_negative: "scoring",
    feature_request: "enhancement",
    trust_privacy_concern: "privacy",
    pricing_signal: "business",
    template_store_signal: "templates",
    workflow_fixer_signal: "workflow-fixer",
    make_zapier_signal: "integrations",
    positive_validation: "validation",
    unclear_other: "feedback"
  };
  return map[category] ?? "feedback";
}

function priorityFor(category) {
  if (["bug", "trust_privacy_concern"].includes(category)) return "high";
  if (["missing_check", "false_negative", "workflow_fixer_signal"].includes(category)) return "medium";
  return "low";
}

function draftFor(item, index) {
  const category = item.category_guess ?? "unclear_other";
  return {
    title: titleFor(item),
    label: labelFor(category),
    priority: priorityFor(category),
    body: [
      `Source URL: ${item.raw_url || item.source_url || "unknown"}`,
      `Category: ${category}`,
      `Priority suggestion: ${priorityFor(category)}`,
      "",
      "Summary:",
      summarize(item.text_excerpt),
      "",
      "Acceptance criteria:",
      "- Confirm whether this feedback represents a real product gap.",
      "- Decide whether the change belongs in scoring, UX copy, docs, or future roadmap.",
      "- Add or update tests if product behavior changes.",
      "- Keep privacy boundaries intact: no workflow execution, no permanent upload storage, and no credentials required.",
      "",
      `LaunchOps draft index: ${index + 1}`
    ].join("\n")
  };
}

async function createIssue(draft) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "WorkflowGuard-AI-LaunchOps"
    },
    body: JSON.stringify({ title: draft.title, body: draft.body, labels: [draft.label] })
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function main() {
  const classified = readJson(classifiedPath, { items: [] });
  const items = normalizeItems(classified).filter((item) => item.status !== "unavailable");
  const actionable = items.filter((item) => !["positive_validation", "unclear_other"].includes(item.category_guess ?? "unclear_other"));
  const drafts = actionable.map(draftFor);

  const markdown = drafts.length === 0
    ? "# LaunchOps Issue Drafts\n\nNo actionable feedback issue drafts yet.\n"
    : `# LaunchOps Issue Drafts\n\nGenerated locally. Review before creating issues.\n\n${drafts.map((draft, index) => `## ${index + 1}. ${draft.title}\n\n- Category label suggestion: ${draft.label}\n- Priority suggestion: ${draft.priority}\n\n${draft.body}`).join("\n\n---\n\n")}\n`;

  await mkdir(path.dirname(issueDraftPath), { recursive: true });
  writeFileSync(issueDraftPath, markdown, "utf8");
  console.log(`Wrote issue drafts to ${path.relative(repoRoot, issueDraftPath)}`);

  if (process.env.ALLOW_CREATE_ISSUES === "true" && process.env.GITHUB_TOKEN) {
    for (const draft of drafts) {
      const issue = await createIssue(draft);
      console.log(`Created issue: ${issue.html_url}`);
    }
  } else {
    console.log("Dry run only. No GitHub issues were created.");
  }
}

main().catch((error) => {
  console.error(`Feedback issue drafting failed: ${error.message}`);
  process.exit(1);
});
