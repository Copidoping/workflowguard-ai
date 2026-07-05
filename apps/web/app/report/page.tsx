"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WorkflowReport } from "@workflowguard/report-generator";
import { REPORT_STORAGE_KEY } from "../../lib/audit";
import { parseStoredReport } from "../../lib/report-storage";

const scoreLabels: Array<[keyof WorkflowReport["scoreBreakdown"], string]> = [
  ["overall_score", "Overall"],
  ["reliability_score", "Reliability"],
  ["security_score", "Security"],
  ["maintainability_score", "Maintainability"],
  ["ai_readiness_score", "AI readiness"],
  ["production_readiness_score", "Production readiness"]
];

export default function ReportPage() {
  const [report, setReport] = useState<WorkflowReport | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const storedReport = parseStoredReport(
      sessionStorage.getItem(REPORT_STORAGE_KEY)
    );

    if (!storedReport) {
      setLoadError(true);
      return;
    }

    setReport(storedReport);
  }, []);

  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-paper">
        <section className="mx-auto max-w-3xl px-5 py-16">
          <div className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
            <h1 className="text-3xl font-semibold text-ink">No report found</h1>
            <p className="mt-3 leading-7 text-ink/70">
              Run an audit first to generate a production-readiness report in
              this browser session.
            </p>
            <Link
              href="/upload"
              className="mt-6 inline-flex rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-ink"
            >
              Run free audit
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-[calc(100vh-73px)] bg-paper px-5 py-16">
        <p className="mx-auto max-w-6xl text-ink/70">Loading report...</p>
      </main>
    );
  }

  return (
    <main className="bg-paper">
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-sm font-medium text-moss">Production readiness report</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-ink">
                {report.workflowName}
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-ink/70">
                {report.summary}
              </p>
            </div>
            <div className="rounded-md border border-ink/10 bg-paper px-6 py-5 text-center">
              <p className="text-sm font-medium text-ink/60">Overall score</p>
              <p className="text-5xl font-semibold text-ink">
                {report.scoreBreakdown.overall_score}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Score breakdown</h2>
          <div className="mt-6 space-y-4">
            {scoreLabels.map(([key, label]) => (
              <ScoreBar
                key={key}
                label={label}
                score={report.scoreBreakdown[key]}
              />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Workflow metadata</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Nodes", report.metadata.nodeCount],
              ["Triggers", report.metadata.triggerNodeCount],
              ["Webhooks", report.metadata.webhookNodeCount],
              ["HTTP calls", report.metadata.httpRequestNodeCount],
              ["AI nodes", report.metadata.aiNodeCount],
              ["Docs", report.metadata.documentationNodeCount],
              ["Credentials", report.metadata.credentialReferenceCount],
              ["Connections", report.metadata.connectionCount]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-paper p-4">
                <p className="text-sm text-ink/60">{label}</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-10 lg:grid-cols-2">
        <IssueList
          title="Critical issues"
          emptyText="No critical issues detected."
          issues={report.criticalIssues}
          tone="critical"
        />
        <IssueList
          title="Warnings"
          emptyText="No warnings detected."
          issues={report.warnings}
          tone="warning"
        />
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-14 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Recommended fixes</h2>
          <div className="mt-5 space-y-4">
            {report.recommendedFixes.map((fix) => (
              <div key={fix.title} className="rounded-md bg-paper p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-ink">{fix.title}</h3>
                  <span className="rounded-md bg-moss/10 px-2 py-1 text-xs font-semibold uppercase text-moss">
                    {fix.impact}
                  </span>
                </div>
                <p className="mt-2 leading-6 text-ink/70">{fix.action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Production checklist</h2>
          <div className="mt-5 space-y-3">
            {report.productionChecklist.map((item) => (
              <div key={item.label} className="rounded-md bg-paper p-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      item.passed
                        ? "bg-moss text-white"
                        : "bg-amberline text-ink"
                    }`}
                  >
                    {item.passed ? "OK" : "!"}
                  </span>
                  <h3 className="font-semibold text-ink">{item.label}</h3>
                </div>
                <p className="mt-2 leading-6 text-ink/70">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white py-12">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-ink">Suggested next steps</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {report.suggestedNextSteps.map((step) => (
              <li key={step} className="rounded-md border border-ink/10 bg-paper p-4 text-ink/75">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const tone =
    score >= 85 ? "bg-moss" : score >= 70 ? "bg-amberline" : "bg-coral";

  return (
    <div>
      <div className="mb-2 flex justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-ink/65">{score}/100</span>
      </div>
      <div className="h-3 rounded-full bg-ink/10">
        <div className={`h-3 rounded-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function IssueList({
  title,
  emptyText,
  issues,
  tone
}: {
  title: string;
  emptyText: string;
  issues: WorkflowReport["criticalIssues"];
  tone: "critical" | "warning";
}) {
  const toneClass =
    tone === "critical"
      ? "border-coral/25 bg-coral/10 text-coral"
      : "border-amberline/35 bg-amberline/10 text-ink";

  return (
    <div className="rounded-md border border-ink/10 bg-white p-6">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      {issues.length === 0 ? (
        <p className="mt-5 rounded-md bg-paper p-4 text-ink/70">{emptyText}</p>
      ) : (
        <div className="mt-5 space-y-4">
          {issues.map((issue) => (
            <div
              key={`${issue.code}-${issue.nodeName ?? issue.message}`}
              className={`rounded-md border p-4 ${toneClass}`}
            >
              <p className="font-semibold">{issue.message}</p>
              <p className="mt-2 leading-6 text-ink/70">
                {issue.recommendation}
              </p>
              {issue.nodeName ? (
                <p className="mt-2 text-sm text-ink/60">Node: {issue.nodeName}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
