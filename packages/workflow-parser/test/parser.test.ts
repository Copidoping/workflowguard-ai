import { describe, expect, it } from "vitest";
import {
  WorkflowParseError,
  parseWorkflow,
  parseWorkflowJson,
  validateN8nWorkflowShape
} from "../src/index";

describe("workflow parser", () => {
  it("extracts n8n workflow signals", () => {
    const parsed = parseWorkflow({
      name: "Lead Intake",
      nodes: [
        {
          id: "1",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          parameters: { path: "lead" }
        },
        {
          id: "2",
          name: "Validate Payload",
          type: "n8n-nodes-base.if",
          parameters: { conditions: { string: [] } }
        },
        {
          id: "3",
          name: "Call CRM",
          type: "n8n-nodes-base.httpRequest",
          credentials: {
            httpHeaderAuth: {
              id: "cred_123",
              name: "CRM header"
            }
          }
        },
        {
          id: "4",
          name: "Implementation Notes",
          type: "n8n-nodes-base.stickyNote",
          parameters: { content: "Validates webhook requests before CRM calls." }
        }
      ],
      connections: {
        "Webhook Trigger": {
          main: [[{ node: "Validate Payload", type: "main", index: 0 }]]
        }
      }
    });

    expect(parsed.workflowName).toBe("Lead Intake");
    expect(parsed.webhookNodes).toHaveLength(1);
    expect(parsed.httpRequestNodes).toHaveLength(1);
    expect(parsed.documentationNodes).toHaveLength(1);
    expect(parsed.credentialsReferences).toEqual([
      {
        nodeName: "Call CRM",
        credentialType: "httpHeaderAuth",
        credentialId: "cred_123",
        credentialName: "CRM header"
      }
    ]);
    expect(parsed.connections).toEqual([
      {
        source: "Webhook Trigger",
        target: "Validate Payload",
        type: "main",
        index: 0
      }
    ]);
  });

  it("returns friendly validation errors for implausible workflows", () => {
    const result = validateN8nWorkflowShape({ nodes: [{ type: "x" }] });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Node 1 is missing a name.");
  });

  it("throws a parse error for invalid JSON", () => {
    expect(() => parseWorkflowJson("{not-json")).toThrow(WorkflowParseError);
  });

  it("does not classify ordinary nodes containing the letters ai as AI nodes", () => {
    const parsed = parseWorkflow({
      name: "Non AI workflow",
      nodes: [
        {
          name: "Wait For Batch",
          type: "n8n-nodes-base.wait"
        },
        {
          name: "Send Gmail",
          type: "n8n-nodes-base.gmail"
        },
        {
          name: "OpenAI Summary",
          type: "@n8n/n8n-nodes-langchain.openAi"
        }
      ],
      connections: {}
    });

    expect(parsed.aiNodes.map((node) => node.name)).toEqual(["OpenAI Summary"]);
  });
});
