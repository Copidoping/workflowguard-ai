export interface ReportWorkflow {
  workflowName: string;
  nodes: unknown[];
  triggerNodes: unknown[];
  webhookNodes: unknown[];
  httpRequestNodes: unknown[];
  aiNodes: unknown[];
  documentationNodes: unknown[];
  credentialsReferences: unknown[];
  stats: {
    nodeCount: number;
    connectionCount: number;
    credentialReferenceCount: number;
  };
}

export interface ReportScores {
  reliability_score: number;
  security_score: number;
  maintainability_score: number;
  ai_readiness_score: number;
  production_readiness_score: number;
  overall_score: number;
}

export interface ReportIssue {
  code: string;
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
  recommendation: string;
  nodeName?: string;
}

export interface ReportScoreResult {
  scores: ReportScores;
  issues: ReportIssue[];
  signals: {
    hasErrorHandling: boolean;
    hasWebhookValidation: boolean;
    hasHttpValidationOrAuthentication: boolean;
    hasHttpRetryOrFallback: boolean;
    hasStructuredAiOutput: boolean;
    hasDocumentation: boolean;
    hasLoggingOrAlerting: boolean;
    possibleSecretCount: number;
    possiblePersonalDataCount: number;
    genericNodeNameCount: number;
  };
}

export interface RecommendedFix {
  title: string;
  impact: "high" | "medium" | "low";
  action: string;
}

export interface ChecklistItem {
  label: string;
  passed: boolean;
  detail: string;
}

export interface WorkflowReport {
  summary: string;
  workflowName: string;
  generatedAt: string;
  scoreBreakdown: ReportScores;
  criticalIssues: ReportIssue[];
  warnings: ReportIssue[];
  recommendedFixes: RecommendedFix[];
  productionChecklist: ChecklistItem[];
  suggestedNextSteps: string[];
  metadata: {
    nodeCount: number;
    triggerNodeCount: number;
    webhookNodeCount: number;
    httpRequestNodeCount: number;
    aiNodeCount: number;
    documentationNodeCount: number;
    credentialReferenceCount: number;
    connectionCount: number;
  };
}

export function generateReport(
  workflow: ReportWorkflow,
  scoreResult: ReportScoreResult
): WorkflowReport {
  const criticalIssues = scoreResult.issues.filter(
    (issue) => issue.severity === "critical"
  );
  const warnings = scoreResult.issues.filter(
    (issue) => issue.severity === "warning"
  );

  return {
    summary: buildSummary(workflow, scoreResult, criticalIssues.length),
    workflowName: workflow.workflowName,
    generatedAt: new Date().toISOString(),
    scoreBreakdown: scoreResult.scores,
    criticalIssues,
    warnings,
    recommendedFixes: buildRecommendedFixes(scoreResult.issues),
    productionChecklist: buildProductionChecklist(workflow, scoreResult),
    suggestedNextSteps: buildSuggestedNextSteps(scoreResult),
    metadata: {
      nodeCount: workflow.stats.nodeCount,
      triggerNodeCount: workflow.triggerNodes.length,
      webhookNodeCount: workflow.webhookNodes.length,
      httpRequestNodeCount: workflow.httpRequestNodes.length,
      aiNodeCount: workflow.aiNodes.length,
      documentationNodeCount: workflow.documentationNodes.length,
      credentialReferenceCount: workflow.stats.credentialReferenceCount,
      connectionCount: workflow.stats.connectionCount
    }
  };
}

export const generateProductionReadinessReport = generateReport;

function buildSummary(
  workflow: ReportWorkflow,
  scoreResult: ReportScoreResult,
  criticalIssueCount: number
): string {
  const score = scoreResult.scores.overall_score;
  const posture =
    score >= 85
      ? "looks close to production-ready"
      : score >= 70
        ? "needs a focused hardening pass"
        : "has material production-readiness gaps";

  return `${workflow.workflowName} ${posture} with an overall score of ${score}/100. The audit found ${criticalIssueCount} critical issue(s), ${scoreResult.issues.length} total finding(s), and ${workflow.stats.nodeCount} node(s).`;
}

function buildRecommendedFixes(issues: ReportIssue[]): RecommendedFix[] {
  const fixes = new Map<string, RecommendedFix>();

  for (const issue of issues) {
    const impact = issue.severity === "critical" ? "high" : "medium";

    fixes.set(issue.code, {
      title: titleFromCode(issue.code),
      impact,
      action: issue.recommendation
    });
  }

  if (fixes.size === 0) {
    fixes.set("KEEP_RELEASE_CHECKLIST", {
      title: "Keep release checklist current",
      impact: "low",
      action:
        "Re-run this audit after meaningful workflow changes and before production releases."
    });
  }

  return [...fixes.values()];
}

function buildProductionChecklist(
  workflow: ReportWorkflow,
  scoreResult: ReportScoreResult
): ChecklistItem[] {
  const signals = scoreResult.signals;

  return [
    {
      label: "Workflow parses as n8n JSON",
      passed: true,
      detail: "The uploaded JSON has a plausible n8n nodes and connections shape."
    },
    {
      label: "Error handling exists",
      passed: signals.hasErrorHandling,
      detail:
        "Production workflows should have an Error Trigger, failure branch, or continue-on-fail strategy."
    },
    {
      label: "Webhook inputs are validated",
      passed: workflow.webhookNodes.length === 0 || signals.hasWebhookValidation,
      detail:
        "Webhook workflows should authenticate requests and validate payload shape before side effects."
    },
    {
      label: "HTTP calls use validation or authentication indicators",
      passed:
        workflow.httpRequestNodes.length === 0 ||
        signals.hasHttpValidationOrAuthentication,
      detail:
        "External HTTP calls should use n8n credentials, authenticated request settings, signed headers, or validated payloads."
    },
    {
      label: "External calls have retry or fallback behavior",
      passed:
        workflow.httpRequestNodes.length === 0 || signals.hasHttpRetryOrFallback,
      detail:
        "HTTP calls should define retries, timeouts, fallback paths, or idempotent recovery."
    },
    {
      label: "AI outputs are structured",
      passed: workflow.aiNodes.length === 0 || signals.hasStructuredAiOutput,
      detail:
        "LLM steps should return predictable schemas before downstream automation consumes the result."
    },
    {
      label: "Secrets are not hardcoded",
      passed: signals.possibleSecretCount === 0,
      detail:
        "Credentials should live in n8n credentials or environment variables, not node parameters."
    },
    {
      label: "Workflow is documented",
      passed: workflow.stats.nodeCount <= 10 || signals.hasDocumentation,
      detail:
        "Complex workflows need sticky notes or documentation that explain ownership and assumptions."
    },
    {
      label: "Alerting or logging exists for external dependencies",
      passed:
        workflow.webhookNodes.length +
          workflow.httpRequestNodes.length +
          workflow.aiNodes.length ===
          0 || signals.hasLoggingOrAlerting,
      detail:
        "External calls should emit useful logs or notify owners when production behavior degrades."
    }
  ];
}

function buildSuggestedNextSteps(scoreResult: ReportScoreResult): string[] {
  const steps: string[] = [];

  if (scoreResult.issues.some((issue) => issue.severity === "critical")) {
    steps.push("Fix critical security and production-readiness findings first.");
  }

  if (!scoreResult.signals.hasErrorHandling) {
    steps.push("Add and test explicit failure handling before connecting live data.");
  }

  if (scoreResult.signals.possiblePersonalDataCount > 0) {
    steps.push("Review personal data handling, retention, and masking requirements.");
  }

  if (scoreResult.scores.overall_score >= 85) {
    steps.push("Run a staging dry run with representative payloads and monitor logs.");
  } else {
    steps.push("Re-run the audit after applying the recommended fixes.");
  }

  return [...new Set(steps)].slice(0, 5);
}

function titleFromCode(code: string): string {
  return code
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
