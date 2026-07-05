import { generateReport, type WorkflowReport } from "@workflowguard/report-generator";
import { scoreWorkflow, type WorkflowScoreResult } from "@workflowguard/scoring-engine";
import {
  WorkflowParseError,
  parseWorkflowJson,
  type ParsedWorkflow
} from "@workflowguard/workflow-parser";

export const REPORT_STORAGE_KEY = "workflowguard:lastReport";

export type AuditResult =
  | {
      ok: true;
      parsedWorkflow: ParsedWorkflow;
      scoreResult: WorkflowScoreResult;
      report: WorkflowReport;
    }
  | {
      ok: false;
      message: string;
      details: string[];
    };

export function auditWorkflowJson(source: string): AuditResult {
  if (source.trim().length === 0) {
    return {
      ok: false,
      message: "The selected file is empty.",
      details: ["Choose an exported n8n workflow JSON file and try again."]
    };
  }

  try {
    const parsedWorkflow = parseWorkflowJson(source);
    const scoreResult = scoreWorkflow(parsedWorkflow);
    const report = generateReport(parsedWorkflow, scoreResult);

    return {
      ok: true,
      parsedWorkflow,
      scoreResult,
      report
    };
  } catch (error) {
    if (error instanceof WorkflowParseError) {
      return {
        ok: false,
        message: error.message,
        details: error.issues
      };
    }

    return {
      ok: false,
      message: "The workflow could not be audited.",
      details: ["Check the JSON export and try again."]
    };
  }
}
