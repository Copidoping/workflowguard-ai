#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const queuePath = path.join(repoRoot, "launchops/queue/launch-queue.json");
const channelExamplePath = path.join(repoRoot, "launchops/config/channels.example.json");
const channelLocalPath = path.join(repoRoot, "launchops/config/channels.local.json");
const publishedPath = path.join(repoRoot, "launchops/published/published-posts.local.json");

if (process.argv.includes("--help")) {
  console.log("Usage: pnpm launch:assist [--id <queue-id>] [--open]");
  console.log("Shows the next human-approved launch draft, optionally opens the target URL, and records a published URL locally.");
  process.exit(0);
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizePublished(data) {
  if (Array.isArray(data)) return { updated_at: null, posts: data };
  return { updated_at: data?.updated_at ?? null, posts: Array.isArray(data?.posts) ? data.posts : [] };
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function mergeChannels() {
  const example = readJson(channelExamplePath, { channels: [] });
  const local = readJson(channelLocalPath, { channels: [] });
  const byId = new Map();
  for (const channel of example.channels ?? []) byId.set(channel.id, channel);
  for (const channel of local.channels ?? []) byId.set(channel.id, { ...(byId.get(channel.id) ?? {}), ...channel });
  return byId;
}

function copyToClipboard(content) {
  const attempts = [];
  if (process.platform === "win32") {
    attempts.push(["clip.exe", []]);
  } else if (process.platform === "darwin") {
    attempts.push(["pbcopy", []]);
  } else {
    attempts.push(["wl-copy", []], ["xclip", ["-selection", "clipboard"]], ["xsel", ["--clipboard", "--input"]]);
  }

  for (const [command, args] of attempts) {
    const result = spawnSync(command, args, { input: content, encoding: "utf8", stdio: ["pipe", "ignore", "ignore"] });
    if (result.status === 0) return true;
  }
  return false;
}

function openUrl(url) {
  if (!url) return false;
  const command = process.platform === "win32" ? "cmd" : process.platform === "darwin" ? "open" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const result = spawnSync(command, args, { stdio: "ignore", shell: false });
  return result.status === 0;
}

function pickQueueItem(queue, publishedPosts) {
  const requestedId = getArgValue("--id");
  const publishedIds = new Set(publishedPosts.filter((post) => post.status === "published").map((post) => post.queue_id));
  const sorted = [...queue].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  if (requestedId) return sorted.find((item) => item.id === requestedId) ?? null;
  return sorted.find((item) => item.status === "draft_ready" && !publishedIds.has(item.id)) ?? null;
}

function draftClipboardText(item, draft) {
  return [
    `Queue item: ${item.id}`,
    `Channel: ${item.channel}`,
    "",
    draft.trim()
  ].join("\n");
}

async function main() {
  const queue = readJson(queuePath, []);
  const published = normalizePublished(readJson(publishedPath, { posts: [] }));
  const item = pickQueueItem(queue, published.posts);
  const channels = mergeChannels();

  if (!item) {
    console.log("No draft-ready LaunchOps queue item found.");
    return;
  }

  const channel = channels.get(item.channel) ?? { id: item.channel };
  const postPath = path.join(repoRoot, item.post_file);
  if (!existsSync(postPath)) throw new Error(`Post file missing: ${item.post_file}`);

  const draft = readFileSync(postPath, "utf8");
  const copied = copyToClipboard(draftClipboardText(item, draft));

  console.log("\n=== LaunchOps publication assist ===\n");
  console.log(`Queue item: ${item.id}`);
  console.log(`Channel: ${item.channel}`);
  console.log(`Platform: ${channel.platform ?? "unknown"}`);
  console.log(`Target URL: ${channel.target_url ?? "not configured"}`);
  console.log(`Requires human submit: ${item.requires_human_submit ? "yes" : "no"}`);
  console.log(`Clipboard: ${copied ? "draft copied" : "unavailable; copy manually from below"}`);
  console.log("\nInstructions:");
  console.log("1. Review the draft and the target community rules.");
  console.log("2. Edit for fit and submit manually only if appropriate.");
  console.log("3. Paste the published URL back here when finished.");
  console.log("\n--- Draft ---\n");
  console.log(draft.trim());
  console.log("\n--- End draft ---\n");

  if (process.argv.includes("--open") && channel.target_url) {
    console.log(openUrl(channel.target_url) ? "Opened target URL." : "Could not open target URL automatically.");
  }

  if (!process.stdin.isTTY) {
    console.log("Non-interactive mode detected. No local published URL recorded.");
    return;
  }

  const rl = readline.createInterface({ input, output });
  const publishedUrl = (await rl.question("Paste published URL, or press Enter to skip: ")).trim();
  await rl.close();

  if (!publishedUrl) {
    console.log("Skipped local published URL recording.");
    return;
  }

  await mkdir(path.dirname(publishedPath), { recursive: true });
  const nextPosts = published.posts.filter((post) => post.queue_id !== item.id);
  nextPosts.push({
    queue_id: item.id,
    channel: item.channel,
    status: "published",
    published_url: publishedUrl,
    published_at: new Date().toISOString(),
    notes: "Recorded locally by launch-assist."
  });
  writeJson(publishedPath, { updated_at: new Date().toISOString(), posts: nextPosts });
  console.log(`Recorded locally: ${path.relative(repoRoot, publishedPath)}`);
}

main().catch((error) => {
  console.error(`Launch assist failed: ${error.message}`);
  process.exit(1);
});
