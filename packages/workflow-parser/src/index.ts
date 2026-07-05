export interface N8nCredentialReference {
  id?: string;
  name?: string;
}

export interface N8nNode {
  id?: string;
  name?: string;
  type?: string;
  typeVersion?: number;
  position?: [number, number];
  disabled?: boolean;
  continueOnFail?: boolean;
  parameters?: Record<string, unknown>;
  credentials?: Record<string, N8nCredentialReference | string | unknown>;
  notes?: string;
  [key: string]: unknown;
}

export interface N8nWorkflow {
  name?: string;
  nodes: N8nNode[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  tags?: unknown[];
  [key: string]: unknown;
}

export interface ParsedNode {
  id?: string;
  name: string;
  type: string;
  typeVersion?: number;
  disabled: boolean;
  continueOnFail: boolean;
  parameters: Record<string, unknown>;
  credentialTypes: string[];
  hasCredentials: boolean;
  searchableText: string;
}

export interface ParsedConnection {
  source: string;
  target: string;
  type?: string;
  index?: number;
}

export interface CredentialReference {
  nodeName: string;
  credentialType: string;
  credentialId?: string;
  credentialName?: string;
}

export interface ParsedWorkflow {
  workflowName: string;
  nodes: ParsedNode[];
  nodeNames: string[];
  nodeTypes: string[];
  triggerNodes: ParsedNode[];
  webhookNodes: ParsedNode[];
  httpRequestNodes: ParsedNode[];
  aiNodes: ParsedNode[];
  credentialsReferences: CredentialReference[];
  connections: ParsedConnection[];
  documentationNodes: ParsedNode[];
  stats: {
    nodeCount: number;
    connectionCount: number;
    credentialReferenceCount: number;
  };
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
}

export class WorkflowParseError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super(message);
    this.name = "WorkflowParseError";
    this.issues = issues;
  }
}

const TRIGGER_HINTS = [
  "trigger",
  "manualtrigger",
  "schedule",
  "cron",
  "interval"
];

const WEBHOOK_HINTS = ["webhook"];
const HTTP_HINTS = ["httprequest", "http request", "http"];
const AI_HINTS = [
  "openai",
  "anthropic",
  "gemini",
  "langchain",
  "llm",
  "chatmodel",
  "chat model",
  "agent",
  "embeddings",
  "vectorstore",
  "aitransform",
  "aiagent",
  "basicllmchain"
];

const DOCUMENTATION_HINTS = [
  "stickynote",
  "sticky note",
  "documentation",
  "readme",
  "comment",
  "note"
];

export function parseWorkflowJson(source: string): ParsedWorkflow {
  let parsed: unknown;

  try {
    parsed = JSON.parse(source);
  } catch {
    throw new WorkflowParseError(
      "The uploaded file is not valid JSON.",
      ["Check that the file is an exported n8n workflow JSON file."]
    );
  }

  return parseWorkflow(parsed);
}

export function parseWorkflow(input: unknown): ParsedWorkflow {
  const validation = validateN8nWorkflowShape(input);

  if (!validation.valid) {
    throw new WorkflowParseError(
      "This does not look like an exported n8n workflow JSON file.",
      validation.errors
    );
  }

  const workflow = input as N8nWorkflow;
  const nodes = workflow.nodes.map(parseNode);
  const connections = flattenConnections(workflow.connections);
  const credentialsReferences = extractCredentials(workflow.nodes);

  return {
    workflowName: normalizeWorkflowName(workflow.name),
    nodes,
    nodeNames: nodes.map((node) => node.name),
    nodeTypes: [...new Set(nodes.map((node) => node.type))],
    triggerNodes: nodes.filter(isTriggerNode),
    webhookNodes: nodes.filter(isWebhookNode),
    httpRequestNodes: nodes.filter(isHttpRequestNode),
    aiNodes: nodes.filter(isAiNode),
    credentialsReferences,
    connections,
    documentationNodes: nodes.filter(isDocumentationNode),
    stats: {
      nodeCount: nodes.length,
      connectionCount: connections.length,
      credentialReferenceCount: credentialsReferences.length
    }
  };
}

export function validateN8nWorkflowShape(
  input: unknown
): WorkflowValidationResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: ["The JSON root must be an object."]
    };
  }

  if (!Array.isArray(input.nodes)) {
    errors.push("The workflow must include a nodes array.");
  } else if (input.nodes.length === 0) {
    errors.push("The workflow must include at least one node.");
  } else {
    input.nodes.forEach((node, index) => {
      if (!isRecord(node)) {
        errors.push(`Node ${index + 1} must be an object.`);
        return;
      }

      if (typeof node.name !== "string" || node.name.trim().length === 0) {
        errors.push(`Node ${index + 1} is missing a name.`);
      }

      if (typeof node.type !== "string" || node.type.trim().length === 0) {
        errors.push(`Node ${index + 1} is missing an n8n node type.`);
      }
    });
  }

  if (
    "connections" in input &&
    input.connections !== undefined &&
    !isRecord(input.connections)
  ) {
    errors.push("The connections field must be an object when present.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function parseNode(node: N8nNode): ParsedNode {
  const parameters = isRecord(node.parameters) ? node.parameters : {};
  const credentialTypes = isRecord(node.credentials)
    ? Object.keys(node.credentials)
    : [];

  const parsed: ParsedNode = {
    name: node.name?.trim() || "Unnamed node",
    type: node.type?.trim() || "unknown",
    disabled: node.disabled === true,
    continueOnFail: node.continueOnFail === true,
    parameters,
    credentialTypes,
    hasCredentials: credentialTypes.length > 0,
    searchableText: ""
  };

  if (node.id) {
    parsed.id = node.id;
  }

  if (typeof node.typeVersion === "number") {
    parsed.typeVersion = node.typeVersion;
  }

  parsed.searchableText = stringifySearchable({
    name: parsed.name,
    type: parsed.type,
    notes: node.notes,
    continueOnFail: parsed.continueOnFail,
    parameters
  });

  return parsed;
}

function normalizeWorkflowName(name: unknown): string {
  return typeof name === "string" && name.trim().length > 0
    ? name.trim()
    : "Untitled n8n workflow";
}

function extractCredentials(nodes: N8nNode[]): CredentialReference[] {
  return nodes.flatMap((node) => {
    if (!isRecord(node.credentials)) {
      return [];
    }

    return Object.entries(node.credentials).map(([credentialType, value]) => {
      const reference: CredentialReference = {
        nodeName: node.name?.trim() || "Unnamed node",
        credentialType
      };

      if (isRecord(value)) {
        if (typeof value.id === "string") {
          reference.credentialId = value.id;
        }

        if (typeof value.name === "string") {
          reference.credentialName = value.name;
        }
      } else if (typeof value === "string") {
        reference.credentialName = value;
      }

      return reference;
    });
  });
}

function flattenConnections(
  connections: Record<string, unknown> | undefined
): ParsedConnection[] {
  if (!isRecord(connections)) {
    return [];
  }

  const flattened: ParsedConnection[] = [];

  for (const [source, connectionGroups] of Object.entries(connections)) {
    if (!isRecord(connectionGroups)) {
      continue;
    }

    for (const [type, lanes] of Object.entries(connectionGroups)) {
      if (!Array.isArray(lanes)) {
        continue;
      }

      lanes.forEach((lane) => {
        if (!Array.isArray(lane)) {
          return;
        }

        lane.forEach((connection) => {
          if (!isRecord(connection) || typeof connection.node !== "string") {
            return;
          }

          const parsedConnection: ParsedConnection = {
            source,
            target: connection.node,
            type
          };

          if (typeof connection.index === "number") {
            parsedConnection.index = connection.index;
          }

          flattened.push(parsedConnection);
        });
      });
    }
  }

  return flattened;
}

function isTriggerNode(node: ParsedNode): boolean {
  return hasAnyHint(node, TRIGGER_HINTS);
}

function isWebhookNode(node: ParsedNode): boolean {
  return hasAnyHint(node, WEBHOOK_HINTS);
}

function isHttpRequestNode(node: ParsedNode): boolean {
  const normalizedType = normalize(node.type);

  return (
    normalizedType.includes("httprequest") ||
    hasAnyHint(node, HTTP_HINTS.filter((hint) => hint !== "http"))
  );
}

function isAiNode(node: ParsedNode): boolean {
  return hasAnyHint(node, AI_HINTS);
}

function isDocumentationNode(node: ParsedNode): boolean {
  return hasAnyHint(node, DOCUMENTATION_HINTS, true);
}

function hasAnyHint(
  node: ParsedNode,
  hints: string[],
  includeSearchableText = false
): boolean {
  const haystack = includeSearchableText
    ? `${node.name} ${node.type} ${node.searchableText}`
    : `${node.name} ${node.type}`;
  const normalizedHaystack = normalize(haystack);

  return hints.some((hint) => normalizedHaystack.includes(normalize(hint)));
}

function stringifySearchable(value: unknown): string {
  const seen = new WeakSet<object>();

  return JSON.stringify(
    value,
    (_key, nestedValue) => {
      if (typeof nestedValue === "object" && nestedValue !== null) {
        if (seen.has(nestedValue)) {
          return "[Circular]";
        }

        seen.add(nestedValue);
      }

      return nestedValue;
    },
    2
  ).toLowerCase();
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
