import { expect, test, type Page } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../../..");
const feedbackUrl = "https://github.com/Copidoping/workflowguard-ai/issues/new/choose";

function samplePath(fileName: string): string {
  return path.join(repoRoot, "samples", fileName);
}

async function runAudit(page: Page, fileName: string) {
  await page.goto("/upload");
  await page.getByLabel("n8n workflow JSON").setInputFiles(samplePath(fileName));
  await expect(page.getByText(`Selected: ${fileName}`)).toBeVisible();
  await page.getByRole("button", { name: "Run free audit" }).click();
  await expect(page).toHaveURL(/\/report$/);
  await expect(page.getByRole("heading", { name: "Score breakdown" })).toBeVisible();
  await expect(page.getByText("Overall score", { exact: true })).toBeVisible();
}

test("landing page loads and CTA opens upload flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Audit your n8n workflow before it breaks in production"
    })
  ).toBeVisible();
  await expect(page.getByText("Production-readiness audits for n8n and AI automation workflows.")).toBeVisible();

  await page.getByRole("main").getByRole("link", { name: "Run free audit" }).first().click();
  await expect(page).toHaveURL(/\/upload$/);
  await expect(page.getByRole("heading", { name: "Run a production-readiness audit" })).toBeVisible();
});

test("clean sample uploads and shows a healthy report posture", async ({ page }) => {
  await runAudit(page, "clean-simple-workflow.json");

  await expect(page.getByRole("heading", { name: "Clean Simple Workflow" })).toBeVisible();
  await expect(page.getByText(/looks close to production-ready/i)).toBeVisible();
  await expect(page.getByText("No critical issues detected.")).toBeVisible();
  await expect(page.getByText("Keep release checklist current")).toBeVisible();
});

test("risky AI sample surfaces critical issues and AI readiness warnings", async ({ page }) => {
  await runAudit(page, "risky-ai-workflow.json");

  await expect(page.getByRole("heading", { name: "Risky AI Workflow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Critical issues" })).toBeVisible();
  await expect(page.getByText(/Possible hardcoded secret detected in OpenAI/i)).toBeVisible();
  await expect(page.getByText(/AI or LLM nodes were found without clear structured output instructions/i)).toBeVisible();
});

test("webhook sample surfaces webhook validation warnings", async ({ page }) => {
  await runAudit(page, "webhook-missing-validation.json");

  await expect(page.getByRole("heading", { name: "Webhook Missing Validation" })).toBeVisible();
  await expect(
    page.getByText(/Webhook nodes exist without obvious authentication, signature checks, or payload validation/i)
  ).toBeVisible();
  await expect(page.getByText("Webhook inputs are validated")).toBeVisible();
});

test("landing links to the public example report", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("main").getByRole("link", { name: "View example report" }).first().click();
  await expect(page).toHaveURL(/\/example-report$/);
  await expect(page.getByRole("heading", { name: "Example production-readiness report" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Critical issues" })).toBeVisible();
});

test("use-case pages load with audit CTA", async ({ page }) => {
  for (const route of [
    "/use-cases/n8n-production-readiness",
    "/use-cases/n8n-webhook-security",
    "/use-cases/ai-workflow-reliability"
  ]) {
    await page.goto(route);
    await expect(page.getByText("WorkflowGuard AI use case")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Run free audit" })).toBeVisible();
  }
});

test("feedback links point to the GitHub issue chooser", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Help shape WorkflowGuard AI" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Give feedback" })).toHaveAttribute(
    "href",
    feedbackUrl
  );
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Feedback" })).toHaveAttribute(
    "href",
    feedbackUrl
  );
});

test("waitlist page is informational and does not collect email", async ({ page }) => {
  await page.goto("/waitlist");

  await expect(page.getByRole("heading", { name: "WorkflowGuard AI pro features are being shaped in public" })).toBeVisible();
  await expect(page.getByText(/email waitlist is not active yet/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Try free audit" })).toHaveAttribute("href", "/upload");
  await expect(page.getByRole("link", { name: "Follow on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/Copidoping/workflowguard-ai"
  );
  await expect(page.getByRole("link", { name: "Give feedback" })).toHaveAttribute("href", feedbackUrl);
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
});
