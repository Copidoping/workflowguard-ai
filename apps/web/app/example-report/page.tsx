import Link from "next/link";

const scores = [
  ["Overall", 58],
  ["Reliability", 48],
  ["Security", 45],
  ["Maintainability", 72],
  ["AI readiness", 52],
  ["Production readiness", 50]
] as const;

const criticalIssues = [
  "Possible hardcoded credential-like value detected in the OpenAI node.",
  "Webhook nodes exist without obvious authentication, signature checks, or payload validation."
];

const warnings = [
  "HTTP request nodes were found without obvious retry, timeout, or fallback indicators.",
  "AI or LLM nodes were found without clear structured output instructions.",
  "The workflow calls external systems but no logging or alerting node was detected."
];

const fixes = [
  "Move credentials into n8n credentials or environment variables and rotate exposed values.",
  "Validate webhook payloads before processing and require an authentication or signature mechanism.",
  "Configure retries, timeouts, idempotency safeguards, and fallback paths for external API calls.",
  "Use JSON schema, output parsers, or explicit structured response contracts for AI nodes."
];

const checklist = [
  ["Workflow parses as n8n JSON", true],
  ["Error handling exists", false],
  ["Webhook inputs are validated", false],
  ["External calls have retry or fallback behavior", false],
  ["AI outputs are structured", false],
  ["Workflow is documented", true]
] as const;

export default function ExampleReportPage() {
  return (
    <main className="bg-paper">
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-sm font-medium text-moss">Example data only</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-ink">
                Example production-readiness report
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-ink/70">
                This static example shows the report format WorkflowGuard AI
                generates from safe fixture data. No workflow is executed and no
                uploaded file is required.
              </p>
            </div>
            <div className="rounded-md border border-ink/10 bg-paper px-6 py-5 text-center">
              <p className="text-sm font-medium text-ink/60">Overall score</p>
              <p className="text-5xl font-semibold text-ink">58</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Score breakdown</h2>
          <div className="mt-6 space-y-4">
            {scores.map(([label, score]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="font-medium text-ink">{label}</span>
                  <span className="text-ink/65">{score}/100</span>
                </div>
                <div className="h-3 rounded-full bg-ink/10">
                  <div className="h-3 rounded-full bg-coral" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Workflow metadata</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Nodes", 7],
              ["Webhooks", 1],
              ["HTTP calls", 2],
              ["AI nodes", 1],
              ["Docs", 1],
              ["Credentials", 0],
              ["Connections", 6],
              ["Findings", 6]
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
        <ReportList title="Critical issues" items={criticalIssues} tone="critical" />
        <ReportList title="Warnings" items={warnings} tone="warning" />
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-14 lg:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Recommended fixes</h2>
          <div className="mt-5 space-y-3">
            {fixes.map((fix) => (
              <p key={fix} className="rounded-md bg-paper p-4 leading-7 text-ink/72">
                {fix}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <h2 className="text-2xl font-semibold text-ink">Production checklist</h2>
          <div className="mt-5 space-y-3">
            {checklist.map(([label, passed]) => (
              <div key={label} className="rounded-md bg-paper p-4">
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${passed ? "bg-moss text-white" : "bg-amberline text-ink"}`}>
                    {passed ? "OK" : "!"}
                  </span>
                  <p className="font-semibold text-ink">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white py-12">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-ink">Suggested next steps</h2>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Fix critical security and production-readiness findings first.",
              "Add explicit failure handling before connecting live data.",
              "Review personal data handling, masking, and retention requirements.",
              "Re-run the audit after applying recommended fixes."
            ].map((step) => (
              <li key={step} className="rounded-md border border-ink/10 bg-paper p-4 text-ink/75">
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/upload" className="rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-ink">
              Run free audit
            </Link>
            <Link href="/" className="rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ReportList({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: "critical" | "warning";
}) {
  const toneClass =
    tone === "critical"
      ? "border-coral/25 bg-coral/10 text-coral"
      : "border-amberline/35 bg-amberline/10 text-ink";

  return (
    <div className="rounded-md border border-ink/10 bg-white p-6">
      <h2 className="text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item} className={`rounded-md border p-4 ${toneClass}`}>
            <p className="font-semibold">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}