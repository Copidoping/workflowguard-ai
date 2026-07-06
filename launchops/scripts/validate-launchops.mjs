#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const launchopsRoot = path.join(repoRoot, "launchops");
const queuePath = path.join(launchopsRoot, "queue/launch-queue.json");
const scripts = [
  "launch-assist.mjs",
  "feedback-fetch.mjs",
  "feedback-classify.mjs",
  "feedback-digest.mjs",
  "feedback-to-issues.mjs"
];

if (process.argv.includes("--help")) {
  console.log("Usage: pnpm launchops:validate");
  console.log("Validates LaunchOps config, posts, ignored local state, and credential hygiene.");
  process.exit(0);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function listFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".next", "dist", "coverage", "test-results", "playwright-report"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, files);
    else files.push(full);
  }
  return files;
}

function fail(message) {
  throw new Error(message);
}

function validateQueue() {
  const queue = readJson(queuePath);
  if (!Array.isArray(queue)) fail("launch queue must be a JSON array");
  const ids = new Set();
  for (const item of queue) {
    if (!item.id || ids.has(item.id)) fail(`invalid or duplicate queue id: ${item.id}`);
    ids.add(item.id);
    if (!item.channel) fail(`queue item missing channel: ${item.id}`);
    if (!item.post_file) fail(`queue item missing post_file: ${item.id}`);
    const postPath = path.join(repoRoot, item.post_file);
    if (!existsSync(postPath)) fail(`queue post file missing for ${item.id}: ${item.post_file}`);
    if (item.requires_human_submit !== true) fail(`queue item must require human submit: ${item.id}`);
  }
}

function validateGitignore() {
  const gitignore = readFileSync(path.join(repoRoot, ".gitignore"), "utf8");
  const required = [
    "launchops/**/*.local.json",
    "launchops/**/.env",
    "launchops/**/.env.*"
  ];
  for (const pattern of required) {
    if (!gitignore.includes(pattern)) fail(`.gitignore missing LaunchOps pattern: ${pattern}`);
  }
}

function validateTrackedLocalState() {
  const result = spawnSync("git", ["ls-files"], { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) fail("git ls-files failed");
  const tracked = result.stdout.split(/\r?\n/).filter(Boolean);
  const bad = tracked.filter((file) =>
    file.startsWith("launchops/") &&
    (/\.local\.json$/i.test(file) || /(^|\/)\.env(\.|$)/i.test(file))
  );
  if (bad.length > 0) fail(`local LaunchOps state is tracked: ${bad.join(", ")}`);
}

function validateNoBannedStrings() {
  const banned = [
    ["Da", "vid"].join(""),
    ["Can", "ga"].join(""),
    ["pro", "ton"].join(""),
    ["d", ".", "koi09"].join(""),
    ["Da", "vid Money Lab"].join(""),
    ["For", "ge", "Flow"].join(""),
    ["C:", "Users"].join("\\")
  ];
  const files = listFiles(repoRoot);
  const offenders = [];
  for (const file of files) {
    const relative = path.relative(repoRoot, file).replaceAll("\\", "/");
    if (relative.startsWith("node_modules/")) continue;
    const content = readFileSync(file, "utf8");
    for (const value of banned) {
      if (content.toLowerCase().includes(value.toLowerCase())) offenders.push(`${relative}: banned identity/reference fragment`);
    }
  }
  if (offenders.length > 0) fail(offenders.slice(0, 20).join("\n"));
}

function validateNoSecretValues() {
  const secretValuePatterns = [
    /sk-[a-z0-9_-]{12,}/i,
    /ghp_[a-z0-9_]{20,}/i,
    /xox[baprs]-[a-z0-9-]{10,}/i,
    /akia[0-9a-z]{16}/i,
    /AIza[0-9A-Za-z_-]{20,}/,
    /bearer\s+[a-z0-9._-]{16,}/i
  ];
  const files = listFiles(repoRoot);
  const offenders = [];
  for (const file of files) {
    const relative = path.relative(repoRoot, file).replaceAll("\\", "/");
    const content = readFileSync(file, "utf8");
    for (const pattern of secretValuePatterns) {
      if (pattern.test(content)) offenders.push(`${relative}: possible committed secret value`);
    }
  }
  if (offenders.length > 0) fail(offenders.slice(0, 20).join("\n"));
}

function validateScriptsHelp() {
  for (const script of scripts) {
    const scriptPath = path.join(launchopsRoot, "scripts", script);
    const result = spawnSync(process.execPath, [scriptPath, "--help"], { cwd: repoRoot, encoding: "utf8" });
    if (result.status !== 0) fail(`${script} --help failed: ${result.stderr || result.stdout}`);
  }
}

function main() {
  validateQueue();
  validateGitignore();
  validateTrackedLocalState();
  validateNoBannedStrings();
  validateNoSecretValues();
  validateScriptsHelp();
  console.log("LaunchOps validation passed.");
}

try {
  main();
} catch (error) {
  console.error(`LaunchOps validation failed: ${error.message}`);
  process.exit(1);
}
