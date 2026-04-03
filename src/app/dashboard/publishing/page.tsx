"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

interface PublishJob {
  id: string;
  channel: string;
  status: string;
  createdAt: string;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  product: { id: string; productName: string | null; status: string };
  video: { id: string; caption: string | null; status: string } | null;
}

export default function PublishingPage() {
  const [jobs, setJobs] = useState<PublishJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchJobs() {
    const res = await fetch("/api/publishing");
    if (res.ok) setJobs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function handleExecute(jobId: string) {
    setExecuting(jobId);
    setMsg(null);
    try {
      const res = await fetch(`/api/publishing/${jobId}/execute`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMsg("Job executed!");
        fetchJobs();
      } else {
        setMsg(data.error || "Execution failed");
      }
    } finally {
      setExecuting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Publishing</h1>
        <p className="mt-1 text-sm text-gray-400">TikTok-ready packages and publish jobs</p>
      </div>

      {msg && (
        <div className="rounded bg-blue-900 px-4 py-2 text-sm text-blue-300">{msg}</div>
      )}

      {loading ? (
        <div className="card text-center text-gray-400 py-8">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400">No publish jobs yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Go to a product and click "Create TikTok Package".
          </p>
          <Link href="/dashboard" className="btn-secondary mt-4 inline-flex">
            Back to Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                      {job.channel}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                  <Link
                    href={`/dashboard/product/${job.product.id}`}
                    className="mt-1 text-sm font-medium text-white hover:text-indigo-400"
                  >
                    {job.product.productName || "Unnamed Product"}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(job.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {job.status === "PENDING" && (
                    <button
                      onClick={() => handleExecute(job.id)}
                      disabled={executing === job.id}
                      className="btn-primary text-xs"
                    >
                      {executing === job.id ? "Executing..." : "Execute"}
                    </button>
                  )}
                </div>
              </div>

              {/* Package Preview */}
              {job.payload && Object.keys(job.payload).length > 0 && (() => {
                const p = job.payload as Record<string, string | number | undefined>;
                return (
                  <div className="rounded bg-gray-800 p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-400">Package Preview</p>

                    {p.caption && (
                      <div>
                        <p className="text-xs text-gray-500">Caption</p>
                        <p className="text-sm text-gray-200 mt-0.5 whitespace-pre-line">
                          {String(p.caption)}
                        </p>
                      </div>
                    )}

                    {p.videoUrl && String(p.videoUrl).startsWith("http") && (
                      <div>
                        <p className="text-xs text-gray-500">Video URL</p>
                        <a
                          href={String(p.videoUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:underline break-all"
                        >
                          {String(p.videoUrl)}
                        </a>
                      </div>
                    )}

                    {p.characterCount !== undefined && (
                      <p className="text-xs text-gray-500">
                        Caption length: {String(p.characterCount)} chars
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Result */}
              {job.result && (
                <div className="rounded bg-gray-800 p-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">Result</p>
                  <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(job.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
