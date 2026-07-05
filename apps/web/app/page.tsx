import Link from "next/link";
import { FeedbackCta } from "./components/FeedbackCta";

const trustItems = [
  "Local-first MVP",
  "No workflow execution",
  "No credentials required",
  "No permanent upload storage"
];

const problemItems = [
  "Webhook automations often ship without payload validation or authentication checks.",
  "AI nodes can pass unpredictable free-text output into downstream automations.",
  "HTTP calls frequently miss retry, timeout, fallback, and alerting behavior.",
  "Production failures are expensive because workflow context is hard to reconstruct after the fact."
];

const checkItems = [
  ["Reliability", "Error handling, retry behavior, fallback paths, and alerting signals."],
  ["Security", "Webhook validation, credential references, and hardcoded secret indicators."],
  ["Maintainability", "Node naming, documentation notes, workflow size, and handoff clarity."],
  ["AI readiness", "Structured output instructions and safer LLM handoff patterns."],
  ["Production readiness", "A release-focused view across failure, privacy, monitoring, and ownership." ]
];

const audienceItems = [
  "n8n builders",
  "automation consultants",
  "no-code operators",
  "AI agent builders",
  "small SaaS teams",
  "internal ops teams"
];

const roadmapItems = [
  "PDF and HTML report export",
  "Shareable reports",
  "Workflow template store",
  "Make and Zapier support exploration",
  "Team-ready audits later"
];

const useCases = [
  {
    label: "n8n production readiness",
    href: "/use-cases/n8n-production-readiness"
  },
  {
    label: "Webhook security",
    href: "/use-cases/n8n-webhook-security"
  },
  {
    label: "AI workflow reliability",
    href: "/use-cases/ai-workflow-reliability"
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div>
            <p className="mb-5 inline-flex rounded-md border border-moss/25 bg-moss/10 px-3 py-1 text-sm font-medium text-moss">
              Production-readiness audits for n8n and AI automation workflows.
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Audit your n8n workflow before it breaks in production
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/72">
              Upload a workflow JSON and get a reliability, security,
              maintainability, AI-readiness, and production-readiness report in
              seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="rounded-md bg-coral px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-ink"
              >
                Run free audit
              </Link>
              <Link
                href="/example-report"
                className="rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss"
              >
                View example report
              </Link>
            </div>
            <div className="mt-8 grid gap-2 sm:grid-cols-2">
              {trustItems.map((item) => (
                <div key={item} className="rounded-md border border-ink/10 bg-paper px-4 py-3 text-sm font-medium text-ink/75">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-ink/10 bg-paper p-5 shadow-soft">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <p className="text-sm font-medium text-ink/60">Audit preview</p>
                <h2 className="text-xl font-semibold text-ink">
                  Production score 68/100
                </h2>
              </div>
              <span className="rounded-md bg-amberline/20 px-3 py-1 text-sm font-semibold text-ink">
                Needs hardening
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["Reliability", "62"],
                ["Security", "55"],
                ["Maintainability", "78"],
                ["AI readiness", "64"],
                ["Production readiness", "60"]
              ].map(([label, score]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{label}</span>
                    <span className="text-ink/65">{score}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div
                      className="h-2 rounded-full bg-moss"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-md border border-coral/25 bg-coral/10 p-4">
              <p className="text-sm font-semibold text-coral">Critical issue</p>
              <p className="mt-1 text-sm leading-6 text-ink/75">
                Webhook nodes exist without obvious authentication, signature
                checks, or payload validation.
              </p>
            </div>
            <div className="mt-3 rounded-md border border-amberline/35 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Recommended fix</p>
              <p className="mt-1 text-sm leading-6 text-ink/70">
                Add validation, retry behavior, structured AI output, and owner
                notes before production release.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-paper py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Why workflows break</h2>
            <p className="mt-4 leading-7 text-ink/70">
              n8n and AI workflows often start as fast internal automations.
              They become production-critical before anyone adds release checks,
              owner notes, validation, or fallback behavior.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {problemItems.map((item) => (
              <div key={item} className="rounded-md border border-ink/10 bg-white p-5">
                <p className="leading-7 text-ink/72">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-semibold text-ink">What it checks</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {checkItems.map(([title, body]) => (
              <div key={title} className="rounded-md border border-ink/10 bg-paper p-5">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-paper py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Who it is for</h2>
            <p className="mt-4 leading-7 text-ink/70">
              WorkflowGuard AI is for builders and operators who need a fast,
              repeatable review before automation touches customers, revenue,
              or sensitive business processes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {audienceItems.map((item) => (
              <div key={item} className="rounded-md border border-ink/10 bg-white p-5">
                <p className="font-medium capitalize text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="example-report" className="border-b border-ink/10 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-ink">Example report preview</h2>
              <p className="mt-3 max-w-2xl leading-7 text-ink/70">
                See the shape of a production-readiness report without uploading
                a file. The example uses safe fixture data only.
              </p>
            </div>
            <Link href="/example-report" className="rounded-md border border-ink/15 bg-paper px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss">
              Open full example
            </Link>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {[
              ["Critical issues", "Possible hardcoded credential-like value detected in an AI node."],
              ["Warnings", "HTTP request nodes lack retry, timeout, or fallback indicators."],
              ["Production checklist", "Add failure handling, structured output, alerting, and owner notes."]
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-ink/10 bg-paper p-5">
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-ink/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-b border-ink/10 bg-paper py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-semibold text-ink">Pricing placeholder</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Free audit now", "Local JSON audit and instant report."],
              ["Paid exports later", "Client-ready PDF or HTML reports."],
              ["Pro history later", "Opt-in saved reports and team review."],
              ["Template store later", "Safer workflow patterns and handoff packs."]
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-ink/10 bg-white p-5">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-semibold text-ink">Roadmap</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {roadmapItems.map((item) => (
              <div key={item} className="rounded-md border border-ink/10 bg-paper p-5">
                <p className="font-medium text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeedbackCta />

      <section className="bg-paper py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-semibold text-ink">Use cases</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {useCases.map((useCase) => (
              <Link key={useCase.href} href={useCase.href} className="rounded-md border border-ink/10 bg-white p-5 font-semibold text-ink transition hover:border-moss hover:text-moss">
                {useCase.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}