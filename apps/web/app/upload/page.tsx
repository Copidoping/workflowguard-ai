"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { REPORT_STORAGE_KEY, auditWorkflowJson } from "../../lib/audit";
import { serializeReport } from "../../lib/report-storage";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string>("");
  const [details, setDetails] = useState<string[]>([]);

  function handleFileSelection(file: File | undefined) {
    setError("");
    setDetails([]);
    setFileName(file?.name ?? "");
    setSelectedFile(null);

    if (!file) {
      return;
    }

    const isJsonFile =
      file.type === "application/json" || file.name.toLowerCase().endsWith(".json");

    if (!isJsonFile) {
      setError("WorkflowGuard can only audit .json files.");
      setDetails(["Export the workflow from n8n as JSON, then upload that file."]);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("This workflow JSON is too large for the local MVP.");
      setDetails(["Upload a file smaller than 5 MB or split very large workflows before auditing."]);
      return;
    }

    setSelectedFile(file);
  }

  async function runAudit() {
    setError("");
    setDetails([]);

    if (!selectedFile) {
      setError("Choose a workflow JSON file first.");
      setDetails(["Select an exported n8n workflow .json file, then run the audit."]);
      return;
    }

    setIsRunning(true);
    sessionStorage.removeItem(REPORT_STORAGE_KEY);

    try {
      const source = await selectedFile.text();
      const audit = auditWorkflowJson(source);

      if (!audit.ok) {
        setError(audit.message);
        setDetails(audit.details);
        return;
      }

      sessionStorage.setItem(
        REPORT_STORAGE_KEY,
        serializeReport(audit.report)
      );
      router.push("/report");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper">
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="inline-flex rounded-md border border-moss/25 bg-moss/10 px-3 py-1 text-sm font-medium text-moss">
            Local-only MVP
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink">
            Run a production-readiness audit
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-ink/70">
            The file is read in your browser, parsed locally, and converted into
            a report. WorkflowGuard does not execute the workflow or persist the
            uploaded JSON.
          </p>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-6 shadow-soft">
          <label
            htmlFor="workflow-file"
            className="block text-sm font-semibold text-ink"
          >
            n8n workflow JSON
          </label>
          <div className="mt-3 rounded-md border border-dashed border-ink/25 bg-paper p-6">
            <input
              ref={inputRef}
              id="workflow-file"
              type="file"
              accept=".json,application/json"
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-moss"
              onChange={(event) => {
                handleFileSelection(event.target.files?.[0]);
              }}
            />
            {fileName ? (
              <p className="mt-3 text-sm text-ink/65">Selected: {fileName}</p>
            ) : null}
          </div>

          {error ? (
            <div className="mt-5 rounded-md border border-coral/25 bg-coral/10 p-4">
              <p className="font-semibold text-coral">{error}</p>
              {details.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink/75">
                  {details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md bg-coral px-5 py-3 font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:bg-ink/30"
              disabled={isRunning}
              onClick={() => {
                void runAudit();
              }}
            >
              {isRunning ? "Auditing..." : "Run free audit"}
            </button>
            <button
              type="button"
              className="rounded-md border border-ink/15 bg-white px-5 py-3 font-semibold text-ink transition hover:border-moss hover:text-moss"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                setSelectedFile(null);
                setFileName("");
                setError("");
                setDetails([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
