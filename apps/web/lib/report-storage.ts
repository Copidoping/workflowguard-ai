import type { WorkflowReport } from "@workflowguard/report-generator";

export function serializeReport(report: WorkflowReport): string {
  return JSON.stringify(report);
}

export function parseStoredReport(value: string | null): WorkflowReport | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    return isWorkflowReport(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isWorkflowReport(value: unknown): value is WorkflowReport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.summary === "string" &&
    typeof value.workflowName === "string" &&
    typeof value.generatedAt === "string" &&
    isScoreBreakdown(value.scoreBreakdown) &&
    Array.isArray(value.criticalIssues) &&
    value.criticalIssues.every(isReportIssue) &&
    Array.isArray(value.warnings) &&
    value.warnings.every(isReportIssue) &&
    Array.isArray(value.recommendedFixes) &&
    value.recommendedFixes.every(isRecommendedFix) &&
    Array.isArray(value.productionChecklist) &&
    value.productionChecklist.every(isChecklistItem) &&
    Array.isArray(value.suggestedNextSteps) &&
    value.suggestedNextSteps.every((step) => typeof step === "string") &&
    isReportMetadata(value.metadata)
  );
}

function isScoreBreakdown(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return [
    "reliability_score",
    "security_score",
    "maintainability_score",
    "ai_readiness_score",
    "production_readiness_score",
    "overall_score"
  ].every((key) => typeof value[key] === "number");
}

function isReportIssue(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.code === "string" &&
    ["critical", "warning", "info"].includes(String(value.severity)) &&
    typeof value.category === "string" &&
    typeof value.message === "string" &&
    typeof value.recommendation === "string" &&
    (value.nodeName === undefined || typeof value.nodeName === "string")
  );
}

function isRecommendedFix(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    ["high", "medium", "low"].includes(String(value.impact)) &&
    typeof value.action === "string"
  );
}

function isChecklistItem(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.label === "string" &&
    typeof value.passed === "boolean" &&
    typeof value.detail === "string"
  );
}

function isReportMetadata(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return [
    "nodeCount",
    "triggerNodeCount",
    "webhookNodeCount",
    "httpRequestNodeCount",
    "aiNodeCount",
    "documentationNodeCount",
    "credentialReferenceCount",
    "connectionCount"
  ].every((key) => typeof value[key] === "number");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
