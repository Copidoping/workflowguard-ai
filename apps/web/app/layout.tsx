import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const feedbackUrl = "https://github.com/Copidoping/workflowguard-ai/issues/new/choose";

export const metadata: Metadata = {
  title: "WorkflowGuard AI",
  description:
    "Production-readiness audits for n8n and AI automation workflows."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <header className="border-b border-ink/10 bg-paper/90">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-base font-semibold text-ink">
              WorkflowGuard AI
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/#pricing"
                className="hidden rounded-md px-3 py-2 text-ink/70 transition hover:bg-white hover:text-ink sm:inline-flex"
              >
                Pricing
              </Link>
              <Link
                href="/waitlist"
                className="hidden rounded-md px-3 py-2 text-ink/70 transition hover:bg-white hover:text-ink sm:inline-flex"
              >
                Waitlist
              </Link>
              <Link
                href="/upload"
                className="rounded-md bg-ink px-4 py-2 font-medium text-white transition hover:bg-moss"
              >
                Run free audit
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-ink/10 bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-ink/65">
            <p>WorkflowGuard AI by OpsForge Labs</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/example-report" className="hover:text-moss">Example report</Link>
              <Link href="/waitlist" className="hover:text-moss">Waitlist</Link>
              <a href={feedbackUrl} target="_blank" rel="noreferrer" className="hover:text-moss">Feedback</a>
              <Link href="/upload" className="hover:text-moss">Run free audit</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
