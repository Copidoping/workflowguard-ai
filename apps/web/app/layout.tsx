import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
                href="/upload"
                className="rounded-md bg-ink px-4 py-2 font-medium text-white transition hover:bg-moss"
              >
                Run free audit
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
