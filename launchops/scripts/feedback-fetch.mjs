#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const publishedPath = path.join(repoRoot, "launchops/published/published-posts.local.json");
const inboxPath = path.join(repoRoot, "launchops/feedback/feedback-inbox.local.json");
const repo = "Copidoping/workflowguard-ai";
const githubApiBase = `https://api.github.com/repos/${repo}`;

if (process.argv.includes("--help")) {
  console.log("Usage: pnpm feedback:fetch");
  console.log("Fetches public GitHub Issues and best-effort public feedback from locally recorded published URLs.");
  process.exit(0);
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function redactSensitive(text) {
  if (!text) return "";
  return String(text)
    .replace(/sk-[a-z0-9_-]{12,}/gi, "[redacted-secret-like-value]")
    .replace(/ghp_[a-z0-9_]{20,}/gi, "[redacted-secret-like-value]")
    .replace(/xox[baprs]-[a-z0-9-]{10,}/gi, "[redacted-secret-like-value]")
    .replace(/akia[0-9a-z]{16}/gi, "[redacted-secret-like-value]")
    .replace(/bearer\s+[a-z0-9._-]{16,}/gi, "bearer [redacted-secret-like-value]")
    .slice(0, 700);
}

function excerpt(parts) {
  return redactSensitive(parts.filter(Boolean).join("\n\n").replace(/\s+/g, " ").trim());
}

function headers() {
  const value = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "WorkflowGuard-AI-LaunchOps"
  };
  if (process.env.GITHUB_TOKEN) {
    value.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return value;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } });
  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after");
    const message = retryAfter
      ? `${response.status} ${response.statusText}; retry after ${retryAfter}s`
      : `${response.status} ${response.statusText}`;
    throw new Error(message);
  }
  return response.json();
}

function baseFeedbackItem(overrides) {
  return {
    source: overrides.source,
    source_url: overrides.source_url,
    author_public_handle: overrides.author_public_handle ?? null,
    date: overrides.date ?? new Date().toISOString(),
    text_excerpt: overrides.text_excerpt ?? "",
    raw_url: overrides.raw_url ?? overrides.source_url,
    category_guess: overrides.category_guess ?? "unclear_other",
    status: overrides.status ?? "available",
    privacy_note: overrides.privacy_note ?? "Public feedback only. Secret-like values are redacted on a best-effort basis."
  };
}

async function fetchGitHubIssues() {
  const items = [];
  try {
    const issues = await fetchJson(`${githubApiBase}/issues?state=all&per_page=50`);
    for (const issue of issues) {
      if (issue.pull_request) continue;
      items.push(baseFeedbackItem({
        source: "github_issues",
        source_url: issue.html_url,
        author_public_handle: issue.user?.login ?? null,
        date: issue.created_at,
        text_excerpt: excerpt([issue.title, issue.body]),
        raw_url: issue.html_url,
        category_guess: "unclear_other",
        status: "available"
      }));

      try {
        const comments = await fetchJson(issue.comments_url);
        for (const comment of comments) {
          items.push(baseFeedbackItem({
            source: "github_issue_comment",
            source_url: issue.html_url,
            author_public_handle: comment.user?.login ?? null,
            date: comment.created_at,
            text_excerpt: excerpt([comment.body]),
            raw_url: comment.html_url,
            category_guess: "unclear_other",
            status: "available"
          }));
        }
      } catch (error) {
        items.push(baseFeedbackItem({
          source: "github_issue_comments",
          source_url: issue.html_url,
          text_excerpt: `Comments unavailable: ${error.message}`,
          raw_url: issue.html_url,
          status: "unavailable"
        }));
      }
    }
  } catch (error) {
    items.push(baseFeedbackItem({
      source: "github_issues",
      source_url: `https://github.com/${repo}/issues`,
      text_excerpt: `GitHub Issues unavailable: ${error.message}`,
      raw_url: `https://github.com/${repo}/issues`,
      status: "unavailable"
    }));
  }
  return items;
}

function normalizePublished(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.posts) ? data.posts : [];
}

function redditJsonUrl(url) {
  const parsed = new URL(url);
  parsed.search = "";
  parsed.hash = "";
  const clean = parsed.toString().replace(/\/$/, "");
  return clean.endsWith(".json") ? clean : `${clean}.json`;
}

function discourseJsonUrl(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  const clean = parsed.toString().replace(/\/$/, "");
  return clean.endsWith(".json") ? clean : `${clean}.json`;
}

async function fetchPublishedUrl(post) {
  const url = post.published_url;
  if (!url) return [];
  const lower = url.toLowerCase();

  if (lower.includes("github.com/copidoping/workflowguard-ai/issues/")) {
    const issueNumber = lower.match(/issues\/(\d+)/)?.[1];
    if (!issueNumber) return [];
    try {
      const issue = await fetchJson(`${githubApiBase}/issues/${issueNumber}`);
      return [baseFeedbackItem({
        source: post.channel ?? "published_url",
        source_url: issue.html_url,
        author_public_handle: issue.user?.login ?? null,
        date: issue.created_at,
        text_excerpt: excerpt([issue.title, issue.body]),
        raw_url: issue.html_url,
        status: "available"
      })];
    } catch (error) {
      return [baseFeedbackItem({ source: post.channel ?? "published_url", source_url: url, raw_url: url, status: "unavailable", text_excerpt: `GitHub issue unavailable: ${error.message}` })];
    }
  }

  if (lower.includes("reddit.com")) {
    try {
      const data = await fetchJson(redditJsonUrl(url), { headers: { "User-Agent": "WorkflowGuard-AI-LaunchOps/1.0" } });
      const postData = data?.[0]?.data?.children?.[0]?.data;
      const comments = data?.[1]?.data?.children ?? [];
      const items = [];
      if (postData) {
        items.push(baseFeedbackItem({
          source: post.channel ?? "reddit",
          source_url: url,
          author_public_handle: postData.author ?? null,
          date: postData.created_utc ? new Date(postData.created_utc * 1000).toISOString() : null,
          text_excerpt: excerpt([postData.title, postData.selftext]),
          raw_url: url,
          status: "available"
        }));
      }
      for (const child of comments.slice(0, 25)) {
        const comment = child?.data;
        if (!comment?.body) continue;
        items.push(baseFeedbackItem({
          source: `${post.channel ?? "reddit"}_comment`,
          source_url: url,
          author_public_handle: comment.author ?? null,
          date: comment.created_utc ? new Date(comment.created_utc * 1000).toISOString() : null,
          text_excerpt: excerpt([comment.body]),
          raw_url: comment.permalink ? `https://www.reddit.com${comment.permalink}` : url,
          status: "available"
        }));
      }
      return items.length > 0 ? items : [baseFeedbackItem({ source: post.channel ?? "reddit", source_url: url, raw_url: url, status: "unavailable", text_excerpt: "Reddit URL returned no public post/comment data." })];
    } catch (error) {
      return [baseFeedbackItem({ source: post.channel ?? "reddit", source_url: url, raw_url: url, status: "unavailable", text_excerpt: `Reddit public JSON unavailable: ${error.message}` })];
    }
  }

  if (lower.includes("community") || lower.includes("discourse")) {
    try {
      const data = await fetchJson(discourseJsonUrl(url));
      const posts = data?.post_stream?.posts ?? [];
      return posts.slice(0, 25).map((entry) => baseFeedbackItem({
        source: post.channel ?? "discourse",
        source_url: url,
        author_public_handle: entry.username ?? null,
        date: entry.created_at ?? null,
        text_excerpt: excerpt([entry.cooked?.replace(/<[^>]+>/g, " ")]),
        raw_url: entry.post_number ? `${url}/${entry.post_number}` : url,
        status: "available"
      }));
    } catch (error) {
      return [baseFeedbackItem({ source: post.channel ?? "discourse", source_url: url, raw_url: url, status: "unavailable", text_excerpt: `Public forum JSON unavailable: ${error.message}` })];
    }
  }

  return [baseFeedbackItem({
    source: post.channel ?? "published_url",
    source_url: url,
    raw_url: url,
    status: "unavailable",
    text_excerpt: "No public fetch adapter is available for this URL."
  })];
}

async function main() {
  const items = await fetchGitHubIssues();
  const published = normalizePublished(readJson(publishedPath, { posts: [] }));
  for (const post of published) {
    const fetched = await fetchPublishedUrl(post);
    items.push(...fetched);
  }

  await mkdir(path.dirname(inboxPath), { recursive: true });
  writeJson(inboxPath, { generated_at: new Date().toISOString(), items });
  console.log(`Wrote ${items.length} feedback item(s) to ${path.relative(repoRoot, inboxPath)}`);
}

main().catch((error) => {
  console.error(`Feedback fetch failed: ${error.message}`);
  process.exit(1);
});
