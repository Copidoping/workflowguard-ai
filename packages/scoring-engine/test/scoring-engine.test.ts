import { describe, expect, it } from "vitest";
import { scoreWorkflow, type ScoringWorkflow } from "../src/index";

const baseWorkflow: ScoringWorkflow = {
  workflowName: "Base",
  nodes: [],
  webhookNodes: [],
  httpRequestNodes: [],
  aiNodes: [],
  documentationNodes: [],
  credentialsReferences: [],
  stats: {
    nodeCount: 0,
    connectionCount: 0,
    credentialReferenceCount: 0
  }
};

describe("scoring engine", () => {
  it("penalizes workflows without error handling", () => {
    const result = scoreWorkflow({
      ...baseWorkflow,
      nodes: [{ name: "Manual Trigger", type: "n8n-nodes-base.manualTrigger" }],
      stats: { ...baseWorkflow.stats, nodeCount: 1 }
    });

    expect(result.scores.reliability_score).toBeLessThan(100);
    expect(result.issues.some((issue) => issue.code === "NO_ERROR_HANDLING")).toBe(
      true
    );
  });

  it("flags risky webhook and hardcoded secret patterns", () => {
    const webhookNode = {
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      parameters: {
        path: "lead",
        apiKey: "fake-demo-credential-do-not-use",
        email: "customer@example.com"
      },
      searchableText:
        "webhook apiKey fake-demo-credential-do-not-use customer@example.com"
    };

    const result = scoreWorkflow({
      ...baseWorkflow,
      nodes: [webhookNode],
      webhookNodes: [webhookNode],
      stats: { ...baseWorkflow.stats, nodeCount: 1 }
    });

    expect(result.scores.security_score).toBeLessThan(70);
    expect(
      result.issues.some(
        (issue) => issue.code === "WEBHOOK_WITHOUT_VALIDATION"
      )
    ).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "POSSIBLE_HARDCODED_SECRET")
    ).toBe(true);
  });

  it("penalizes HTTP request nodes without validation or authentication indicators", () => {
    const httpNode = {
      name: "Send Lead",
      type: "n8n-nodes-base.httpRequest",
      parameters: {
        url: "https://api.example.test/leads",
        options: { retryOnFail: true, maxTries: 3, timeout: 10000 }
      },
      searchableText: "retryOnFail maxTries timeout"
    };

    const result = scoreWorkflow({
      ...baseWorkflow,
      nodes: [httpNode],
      httpRequestNodes: [httpNode],
      stats: { ...baseWorkflow.stats, nodeCount: 1 }
    });

    expect(result.signals.hasHttpValidationOrAuthentication).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === "HTTP_WITHOUT_VALIDATION_OR_AUTH"
      )
    ).toBe(true);
  });

  it("keeps a documented workflow with retries and alerting comparatively high", () => {
    const httpNode = {
      name: "Call CRM with Retry",
      type: "n8n-nodes-base.httpRequest",
      parameters: { options: { retryOnFail: true, maxTries: 3, timeout: 10000 } },
      searchableText: "retryOnFail maxTries timeout httpHeaderAuth credential",
      hasCredentials: true
    };
    const errorNode = {
      name: "Error Trigger",
      type: "n8n-nodes-base.errorTrigger",
      searchableText: "error trigger"
    };
    const slackNode = {
      name: "Alert Operations",
      type: "n8n-nodes-base.slack",
      searchableText: "alert slack operations"
    };
    const noteNode = {
      name: "Workflow Notes",
      type: "n8n-nodes-base.stickyNote",
      searchableText: "documentation"
    };

    const result = scoreWorkflow({
      ...baseWorkflow,
      nodes: [httpNode, errorNode, slackNode, noteNode],
      httpRequestNodes: [httpNode],
      documentationNodes: [noteNode],
      stats: { ...baseWorkflow.stats, nodeCount: 4 }
    });

    expect(result.scores.overall_score).toBeGreaterThanOrEqual(90);
    expect(result.issues).toHaveLength(0);
  });
});

