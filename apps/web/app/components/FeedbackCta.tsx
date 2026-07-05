"use client";

export const FEEDBACK_URL = "https://github.com/Copidoping/workflowguard-ai/issues/new/choose";

export function FeedbackCta({ className = "" }: { className?: string }) {
  return (
    <section className={`border-t border-ink/10 bg-white py-12 ${className}`.trim()}>
      <div className="mx-auto max-w-6xl px-5">
        <div className="rounded-md border border-ink/10 bg-paper p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Help shape WorkflowGuard AI</h2>
              <p className="mt-3 max-w-3xl leading-7 text-ink/70">
                If you build n8n or AI automation workflows, try the audit and tell us what it missed. Do not share secrets, credentials, or private workflow data.
              </p>
            </div>
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 justify-center rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-moss"
            >
              Give feedback
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}