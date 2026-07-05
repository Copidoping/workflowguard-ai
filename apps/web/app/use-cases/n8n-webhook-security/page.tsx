import Link from "next/link";

const checks = [
  "Authentication or signature indicators",
  "Payload validation before side effects",
  "Personal data handling notes",
  "Alerting when webhook processing fails"
];

export default function UseCasePage() {
  return (
    <main className="bg-paper">
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-sm font-medium text-moss">WorkflowGuard AI use case</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink">
            n8n webhook security checks
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/72">
            Webhook workflows can expose automation entry points without enough request validation, authentication hints, or payload-shape checks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/upload" className="rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-ink">
              Run free audit
            </Link>
            <Link href="/example-report" className="rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss">
              View example report
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h2 className="text-3xl font-semibold text-ink">What to review</h2>
          <p className="mt-4 leading-7 text-ink/70">
            WorkflowGuard AI turns an exported n8n workflow JSON file into a
            practical audit report. The MVP is heuristic, transparent, and built
            to support review before production release.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {checks.map((check) => (
            <div key={check} className="rounded-md border border-ink/10 bg-white p-5">
              <p className="font-medium text-ink">{check}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white py-12">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-ink">Why it matters</h2>
          <p className="mt-4 max-w-3xl leading-7 text-ink/70">
            Production automation needs boring reliability: clear inputs,
            explicit recovery paths, observable failures, and enough context for
            another operator to maintain the workflow later.
          </p>
        </div>
      </section>
    </main>
  );
}