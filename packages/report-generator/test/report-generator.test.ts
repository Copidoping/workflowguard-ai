import { describe, expect, it } from "vitest";
import { generateReport, type ReportScoreResult } from "../src/index";

describe("report generator", () => {
  it("creates a structured report with critical issues and checklist", () => {
    const scoreResult: ReportScoreResult = {
      scores: {
        reliability_score: 70,
        security_score: 55,
        maintainability_score: 80,
        ai_readiness_score: 100,
        production_readiness_score: 60,
        overall_score: 73
      },
      issues: [
        {
          code: "WEBHOOK_WITHOUT_VALIDATION",
          severity: "critical",
          category: "security_score",
          message: "Webhook validation is missing.",
          recommendation: "Validate and authenticate incoming webhook payloads."
        }
      ],
      signals: {
        hasErrorHandling: false,
        hasWebhookValidation: false,
        hasHttpValidationOrAuthentication: true,
        hasHttpRetryOrFallback: true,
        hasStructuredAiOutput: true,
        hasDocumentation: false,
        hasLoggingOrAlerting: false,
        possibleSecretCount: 0,
        possiblePersonalDataCount: 0,
        genericNodeNameCount: 1
      }
    };

    const report = generateReport(
      {
        workflowName: "Webhook Intake",
        nodes: [{}],
        triggerNodes: [{}],
        webhookNodes: [{}],
        httpRequestNodes: [],
        aiNodes: [],
        documentationNodes: [],
        credentialsReferences: [],
        stats: {
          nodeCount: 1,
          connectionCount: 0,
          credentialReferenceCount: 0
        }
      },
      scoreResult
    );

    expect(report.summary).toContain("Webhook Intake");
    expect(report.criticalIssues).toHaveLength(1);
    expect(report.recommendedFixes[0]?.impact).toBe("high");
    expect(report.productionChecklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Webhook inputs are validated",
          passed: false
        })
      ])
    );
  });
});
