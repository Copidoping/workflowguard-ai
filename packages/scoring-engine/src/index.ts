export type ScoreCategory =
  | "reliability_score"
  | "security_score"
  | "maintainability_score"
  | "ai_readiness_score"
  | "production_readiness_score";

export interface ScoreBreakdown {
  reliability_score: number;
  security_score: number;
  maintainability_score: number;
  ai_readiness_score: number;
  production_readiness_score: number;
  overall_score: number;
}

export type IssueSeverity = "critical" | "warning" | "info";

export interface ScoreIssue {
  code: string;
  severity: IssueSeverity;
  category: ScoreCategory;
  message: string;
  recommendation: string;
  nodeName?: string;
}

export interface ScoringNode {
  name: string;
  type: string;
  parameters?: Record<string, unknown>;
  searchableText?: string;
  continueOnFail?: boolean;
  hasCredentials?: boolean;
}

export interface ScoringWorkflow {
  workflowName: string;
  nodes: ScoringNode[];
  webhookNodes: ScoringNode[];
  httpRequestNodes: ScoringNode[];
  aiNodes: ScoringNode[];
  documentationNodes: ScoringNode[];
  credentialsReferences: unknown[];
  stats: {
    nodeCount: number;
    connectionCount: number;
    credentialReferenceCount: number;
  };
}

export interface ScoringSignals {
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
}

export interface WorkflowScoreResult {
  scores: ScoreBreakdown;
  issues: ScoreIssue[];
  signals: ScoringSignals;
}

const INITIAL_SCORE = 100;
const MANY_NODES_THRESHOLD = 10;

const GENERIC_NODE_NAMES = new Set([
  "node",
  "new node",
  "http request",
  "webhook",
  "if",
  "set",
  "code",
  "openai",
  "agent",
  "manual trigger"
]);

const SECRET_KEY_PATTERN =
  /(api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|authorization|bearer|client[_-]?secret)/i;
const SECRET_VALUE_PATTERN =
  /(sk-[a-z0-9_-]{12,}|xox[baprs]-[a-z0-9-]{10,}|ghp_[a-z0-9]{20,}|akia[0-9a-z]{16}|bearer\s+[a-z0-9._-]{16,}|api[_-]?key\s*[:=]\s*["']?[a-z0-9._-]{12,}|password\s*[:=]\s*["']?[^"',\s]{6,})/i;
const PERSONAL_DATA_PATTERN =
  /(email|e-mail|phone|mobile|ssn|social security|address|passport|date of birth|dob|credit card|card number|iban|tax id)/i;

export function scoreWorkflow(workflow: ScoringWorkflow): WorkflowScoreResult {
  const deductions: Record<ScoreCategory, number> = {
    reliability_score: 0,
    security_score: 0,
    maintainability_score: 0,
    ai_readiness_score: 0,
    production_readiness_score: 0
  };
  const issues: ScoreIssue[] = [];

  const signals: ScoringSignals = {
    hasErrorHandling: hasErrorHandling(workflow),
    hasWebhookValidation: hasWebhookValidation(workflow),
    hasHttpValidationOrAuthentication: hasHttpValidationOrAuthentication(workflow),
    hasHttpRetryOrFallback: hasHttpRetryOrFallback(workflow),
    hasStructuredAiOutput: hasStructuredAiOutput(workflow),
    hasDocumentation: workflow.documentationNodes.length > 0,
    hasLoggingOrAlerting: hasLoggingOrAlerting(workflow),
    possibleSecretCount: findPossibleSecrets(workflow).length,
    possiblePersonalDataCount: findPossiblePersonalData(workflow).length,
    genericNodeNameCount: countGenericNodeNames(workflow.nodes)
  };

  if (!signals.hasErrorHandling) {
    deduct(deductions, issues, {
      code: "NO_ERROR_HANDLING",
      severity: "warning",
      category: "reliability_score",
      points: 20,
      message: "No obvious error handling or failure branch was detected.",
      recommendation:
        "Add an Error Trigger workflow, continue-on-fail branches, or explicit failure handling for critical nodes."
    });
    deductOnly(deductions, "production_readiness_score", 15);
  }

  if (workflow.webhookNodes.length > 0 && !signals.hasWebhookValidation) {
    deduct(deductions, issues, {
      code: "WEBHOOK_WITHOUT_VALIDATION",
      severity: "critical",
      category: "security_score",
      points: 22,
      message:
        "Webhook nodes exist without obvious authentication, signature checks, or payload validation.",
      recommendation:
        "Validate webhook payloads before processing and require an authentication or signature mechanism."
    });
    deductOnly(deductions, "production_readiness_score", 18);
  }

  if (workflow.httpRequestNodes.length > 0 && !signals.hasHttpRetryOrFallback) {
    const points = Math.min(25, workflow.httpRequestNodes.length * 10);
    deduct(deductions, issues, {
      code: "HTTP_WITHOUT_RETRY",
      severity: "warning",
      category: "reliability_score",
      points,
      message:
        "HTTP request nodes were found without obvious retry, timeout, or fallback indicators.",
      recommendation:
        "Configure retries, timeouts, idempotency safeguards, and fallback paths for external API calls."
    });
    deductOnly(deductions, "production_readiness_score", 12);
  }

  if (
    workflow.httpRequestNodes.length > 0 &&
    !signals.hasHttpValidationOrAuthentication
  ) {
    deduct(deductions, issues, {
      code: "HTTP_WITHOUT_VALIDATION_OR_AUTH",
      severity: "warning",
      category: "security_score",
      points: Math.min(20, workflow.httpRequestNodes.length * 10),
      message:
        "HTTP request nodes were found without obvious validation or authentication indicators.",
      recommendation:
        "Use n8n credentials, authenticated request settings, signed headers, or upstream validation before sending data to external APIs."
    });
    deductOnly(deductions, "production_readiness_score", 8);
  }

  if (workflow.aiNodes.length > 0 && !signals.hasStructuredAiOutput) {
    deduct(deductions, issues, {
      code: "AI_WITHOUT_STRUCTURED_OUTPUT",
      severity: "warning",
      category: "ai_readiness_score",
      points: Math.min(35, workflow.aiNodes.length * 15),
      message:
        "AI or LLM nodes were found without clear structured output instructions.",
      recommendation:
        "Use JSON schema, output parsers, or explicit structured response contracts before downstream automation steps."
    });
    deductOnly(deductions, "maintainability_score", 8);
    deductOnly(deductions, "production_readiness_score", 10);
  }

  if (signals.genericNodeNameCount > 0) {
    const genericRatio = signals.genericNodeNameCount / workflow.nodes.length;
    const points = genericRatio >= 0.3 ? 18 : 10;
    deduct(deductions, issues, {
      code: "GENERIC_NODE_NAMES",
      severity: "warning",
      category: "maintainability_score",
      points,
      message: `${signals.genericNodeNameCount} node name(s) are too generic to explain intent.`,
      recommendation:
        "Rename nodes to describe the business action, expected data, and destination system."
    });
  }

  if (workflow.stats.nodeCount > MANY_NODES_THRESHOLD && !signals.hasDocumentation) {
    deduct(deductions, issues, {
      code: "LARGE_WORKFLOW_WITHOUT_NOTES",
      severity: "warning",
      category: "maintainability_score",
      points: 15,
      message:
        "This workflow has many nodes but no sticky notes or documentation nodes.",
      recommendation:
        "Add sticky notes that explain the workflow purpose, assumptions, failure handling, and ownership."
    });
    deductOnly(deductions, "production_readiness_score", 10);
  }

  const possibleSecrets = findPossibleSecrets(workflow);
  if (possibleSecrets.length > 0) {
    for (const finding of possibleSecrets.slice(0, 3)) {
      deduct(deductions, issues, {
        code: "POSSIBLE_HARDCODED_SECRET",
        severity: "critical",
        category: "security_score",
        points: 10,
        message: `Possible hardcoded secret detected in ${finding.nodeName}.`,
        recommendation:
          "Move secrets into n8n credentials or environment variables and rotate any value that was committed or shared.",
        nodeName: finding.nodeName
      });
    }
    deductOnly(deductions, "production_readiness_score", 20);
  }

  const possiblePersonalData = findPossiblePersonalData(workflow);
  if (possiblePersonalData.length > 0) {
    deduct(deductions, issues, {
      code: "POSSIBLE_PERSONAL_DATA",
      severity: "warning",
      category: "security_score",
      points: Math.min(18, possiblePersonalData.length * 6),
      message:
        "Possible personal data fields were detected in node parameters or prompts.",
      recommendation:
        "Confirm data minimization, masking, retention rules, and consent requirements before production use."
    });
  }

  const hasExternalCalls =
    workflow.webhookNodes.length > 0 ||
    workflow.httpRequestNodes.length > 0 ||
    workflow.aiNodes.length > 0;

  if (hasExternalCalls && !signals.hasLoggingOrAlerting) {
    deduct(deductions, issues, {
      code: "EXTERNAL_CALLS_WITHOUT_ALERTING",
      severity: "warning",
      category: "production_readiness_score",
      points: 15,
      message:
        "The workflow calls external systems but no logging, alerting, or incident notification node was detected.",
      recommendation:
        "Add logging or alerting for failed external calls, slow responses, and unexpected empty responses."
    });
    deductOnly(deductions, "reliability_score", 10);
  }

  const scores = finalizeScores(deductions);

  return {
    scores,
    issues: mergeDuplicateIssues(issues),
    signals
  };
}

interface DeductInput {
  code: string;
  severity: IssueSeverity;
  category: ScoreCategory;
  points: number;
  message: string;
  recommendation: string;
  nodeName?: string;
}

function deduct(
  deductions: Record<ScoreCategory, number>,
  issues: ScoreIssue[],
  input: DeductInput
): void {
  deductOnly(deductions, input.category, input.points);
  const issue: ScoreIssue = {
    code: input.code,
    severity: input.severity,
    category: input.category,
    message: input.message,
    recommendation: input.recommendation
  };

  if (input.nodeName) {
    issue.nodeName = input.nodeName;
  }

  issues.push(issue);
}

function deductOnly(
  deductions: Record<ScoreCategory, number>,
  category: ScoreCategory,
  points: number
): void {
  deductions[category] += points;
}

function finalizeScores(
  deductions: Record<ScoreCategory, number>
): ScoreBreakdown {
  const reliability_score = clampScore(
    INITIAL_SCORE - deductions.reliability_score
  );
  const security_score = clampScore(INITIAL_SCORE - deductions.security_score);
  const maintainability_score = clampScore(
    INITIAL_SCORE - deductions.maintainability_score
  );
  const ai_readiness_score = clampScore(
    INITIAL_SCORE - deductions.ai_readiness_score
  );
  const production_readiness_score = clampScore(
    INITIAL_SCORE - deductions.production_readiness_score
  );
  const overall_score = Math.round(
    (reliability_score +
      security_score +
      maintainability_score +
      ai_readiness_score +
      production_readiness_score) /
      5
  );

  return {
    reliability_score,
    security_score,
    maintainability_score,
    ai_readiness_score,
    production_readiness_score,
    overall_score
  };
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasErrorHandling(workflow: ScoringWorkflow): boolean {
  return workflow.nodes.some((node) => {
    const text = nodeText(node);

    return (
      node.continueOnFail === true ||
      text.includes("errortrigger") ||
      text.includes("error trigger") ||
      text.includes("catch") ||
      text.includes("fallback") ||
      text.includes("failure") ||
      text.includes("on error")
    );
  });
}

function hasWebhookValidation(workflow: ScoringWorkflow): boolean {
  const validationHints =
    /(authentication|headerauth|basicauth|jwt|hmac|signature|validate|validation|schema|zod|joi|if|switch|code|function)/i;

  return workflow.nodes.some((node) => validationHints.test(nodeText(node)));
}

function hasHttpValidationOrAuthentication(workflow: ScoringWorkflow): boolean {
  const authOrValidationHints =
    /(authentication|auth|credential|headerauth|basicauth|oauth|jwt|hmac|signature|signed|authorization|bearer|x-api-key|api key|validate|validation|schema|guard|allowlist|denylist)/i;

  return workflow.httpRequestNodes.every(
    (node) =>
      node.hasCredentials === true || authOrValidationHints.test(nodeText(node))
  );
}

function hasHttpRetryOrFallback(workflow: ScoringWorkflow): boolean {
  const retryHints =
    /(retry|maxtries|max tries|retryonfail|backoff|timeout|fallback|circuit breaker|idempotency)/i;

  return workflow.httpRequestNodes.every((node) => retryHints.test(nodeText(node)));
}

function hasStructuredAiOutput(workflow: ScoringWorkflow): boolean {
  const structuredHints =
    /(structured output|json schema|response_format|output parser|format as json|return json|valid json|schema)/i;

  return workflow.aiNodes.every((node) => structuredHints.test(nodeText(node)));
}

function hasLoggingOrAlerting(workflow: ScoringWorkflow): boolean {
  const loggingHints =
    /(log|logging|alert|slack|email|telegram|discord|pagerduty|opsgenie|incident|sentry|datadog|monitor)/i;

  return workflow.nodes.some((node) => loggingHints.test(nodeText(node)));
}

function countGenericNodeNames(nodes: ScoringNode[]): number {
  return nodes.filter((node) => {
    const normalized = node.name.trim().toLowerCase();

    return (
      normalized.length < 4 ||
      GENERIC_NODE_NAMES.has(normalized) ||
      /^node\s*\d+$/i.test(normalized)
    );
  }).length;
}

interface TextFinding {
  nodeName: string;
  path: string;
}

function findPossibleSecrets(workflow: ScoringWorkflow): TextFinding[] {
  return workflow.nodes.flatMap((node) =>
    flattenNodeValues(node).filter((entry) => {
      const keyLooksSecret = SECRET_KEY_PATTERN.test(entry.path);
      const valueLooksSecret =
        typeof entry.value === "string" && SECRET_VALUE_PATTERN.test(entry.value);
      const isExpression =
        typeof entry.value === "string" && entry.value.includes("{{");

      return (keyLooksSecret || valueLooksSecret) && !isExpression;
    })
  );
}

function findPossiblePersonalData(workflow: ScoringWorkflow): TextFinding[] {
  return workflow.nodes.flatMap((node) =>
    flattenNodeValues(node).filter((entry) => {
      const value = String(entry.value);

      return (
        PERSONAL_DATA_PATTERN.test(entry.path) ||
        PERSONAL_DATA_PATTERN.test(value) ||
        /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(value)
      );
    })
  );
}

function flattenNodeValues(node: ScoringNode): Array<TextFinding & { value: unknown }> {
  const values: Array<TextFinding & { value: unknown }> = [];

  walkValue(node.parameters ?? {}, "parameters", node.name, values);
  values.push({
    nodeName: node.name,
    path: "node.searchableText",
    value: node.searchableText ?? ""
  });

  return values;
}

function walkValue(
  value: unknown,
  path: string,
  nodeName: string,
  values: Array<TextFinding & { value: unknown }>
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkValue(item, `${path}[${index}]`, nodeName, values);
    });
    return;
  }

  if (typeof value === "object" && value !== null) {
    for (const [key, nestedValue] of Object.entries(value)) {
      walkValue(nestedValue, `${path}.${key}`, nodeName, values);
    }
    return;
  }

  values.push({ nodeName, path, value });
}

function nodeText(node: ScoringNode): string {
  return `${node.name} ${node.type} ${node.searchableText ?? ""}`.toLowerCase();
}

function mergeDuplicateIssues(issues: ScoreIssue[]): ScoreIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.code}:${issue.nodeName ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
