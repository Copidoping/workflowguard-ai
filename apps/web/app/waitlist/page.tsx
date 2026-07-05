import Link from "next/link";

const feedbackUrl = "https://github.com/Copidoping/workflowguard-ai/issues/new/choose";

const plannedFeatures = [
  "PDF and HTML export",
  "Shareable audit reports",
  "Workflow history",
  "Template store",
  "Make and Zapier support exploration",
  "Team-ready audits"
];

export default function WaitlistPage() {
  return (
    <main className="bg-paper">
      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-sm font-medium text-moss">Early public MVP</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink">
            WorkflowGuard AI pro features are being shaped in public
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/72">
            WorkflowGuard AI is live as an early public MVP. The email waitlist is not active yet because the privacy notice, provider choice, and retention policy need to be finalized first.
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-ink/70">
            For now, follow the GitHub repo or leave feedback through GitHub Issues. Please do not share secrets, credentials, or private workflow data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/upload" className="rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-ink">
              Try free audit
            </Link>
            <a href="https://github.com/Copidoping/workflowguard-ai" target="_blank" rel="noreferrer" className="rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss">
              Follow on GitHub
            </a>
            <a href={feedbackUrl} target="_blank" rel="noreferrer" className="rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss">
              Give feedback
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-3xl font-semibold text-ink">Planned features</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plannedFeatures.map((feature) => (
            <div key={feature} className="rounded-md border border-ink/10 bg-white p-5">
              <p className="font-medium text-ink">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white py-12">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-semibold text-ink">No email collection yet</h2>
          <p className="mt-4 max-w-3xl leading-7 text-ink/70">
            This page is prepared launch copy only. It does not include a form, does not submit data, and does not store email addresses.
          </p>
        </div>
      </section>
    </main>
  );
}