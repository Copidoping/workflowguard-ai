import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { auditWorkflowJson } from "../lib/audit";
import { parseStoredReport, serializeReport } from "../lib/report-storage";

describe("local audit helper", () => {
  it("returns a report for plausible n8n JSON", () => {
    const result = auditWorkflowJson(
      JSON.stringify({
        name: "Smoke Test",
        nodes: [
          {
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger"
          },
          {
            name: "Error Trigger",
            type: "n8n-nodes-base.errorTrigger"
          }
        ],
        connections: {}
      })
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.report.workflowName).toBe("Smoke Test");
    }
  });

  it("returns friendly failures for invalid JSON", () => {
    const result = auditWorkflowJson("{nope");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("The uploaded file is not valid JSON.");
    }
  });

  it("audits the sample workflows with useful score separation", () => {
    const clean = auditWorkflowJson(readSample("clean-simple-workflow.json"));
    const risky = auditWorkflowJson(readSample("risky-ai-workflow.json"));
    const webhook = auditWorkflowJson(
      readSample("webhook-missing-validation.json")
    );

    expect(clean.ok).toBe(true);
    expect(risky.ok).toBe(true);
    expect(webhook.ok).toBe(true);

    if (clean.ok && risky.ok && webhook.ok) {
      expect(clean.report.scoreBreakdown.overall_score).toBeGreaterThan(
        risky.report.scoreBreakdown.overall_score
      );
      expect(
        webhook.report.criticalIssues.some(
          (issue) => issue.code === "WEBHOOK_WITHOUT_VALIDATION"
        )
      ).toBe(true);
    }
  });

  it("rejects malformed report data from browser storage", () => {
    const validAudit = auditWorkflowJson(
      JSON.stringify({
        name: "Stored Report",
        nodes: [
          {
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger"
          }
        ],
        connections: {}
      })
    );

    expect(parseStoredReport("{not-json")).toBeNull();
    expect(parseStoredReport(JSON.stringify({ workflowName: "Incomplete" }))).toBeNull();
    expect(
      parseStoredReport(
        JSON.stringify({
          summary: "Looks valid until metadata",
          workflowName: "Bad Metadata",
          generatedAt: "2026-07-04T00:00:00.000Z",
          scoreBreakdown: {
            reliability_score: 100,
            security_score: 100,
            maintainability_score: 100,
            ai_readiness_score: 100,
            production_readiness_score: 100,
            overall_score: 100
          },
          criticalIssues: [],
          warnings: [],
          recommendedFixes: [],
          productionChecklist: [],
          suggestedNextSteps: [],
          metadata: {}
        })
      )
    ).toBeNull();

    if (validAudit.ok) {
      expect(parseStoredReport(serializeReport(validAudit.report))?.workflowName).toBe(
        "Stored Report"
      );
    }
  });
});

function readSample(fileName: string): string {
  return readFileSync(resolve(process.cwd(), "../../samples", fileName), "utf8");
}
