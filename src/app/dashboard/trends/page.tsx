"use client";

import { useState, useEffect } from "react";

interface TrendReport {
  id: string;
  title: string;
  summary: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export default function TrendsPage() {
  const [reports, setReports] = useState<TrendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", data: "" });
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchReports() {
    const res = await fetch("/api/trends");
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMsg(null);

    let parsedData: Record<string, unknown> | undefined;
    if (form.data.trim()) {
      try {
        parsedData = JSON.parse(form.data);
      } catch {
        setMsg("Invalid JSON in data field");
        setCreating(false);
        return;
      }
    }

    const res = await fetch("/api/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        summary: form.summary || undefined,
        data: parsedData,
      }),
    });

    if (res.ok) {
      setForm({ title: "", summary: "", data: "" });
      setShowForm(false);
      fetchReports();
    } else {
      setMsg("Failed to create report");
    }
    setCreating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trend Reports</h1>
          <p className="mt-1 text-sm text-gray-400">
            Market intelligence — reports only, not injected into the pipeline
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "New Report"}
        </button>
      </div>

      {msg && (
        <div className="rounded bg-red-900 px-4 py-2 text-sm text-red-300">{msg}</div>
      )}

      {showForm && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Create Trend Report</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="label">Title *</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Top TikTok Products Week 14"
                required
              />
            </div>
            <div>
              <label className="label">Summary</label>
              <textarea
                className="input min-h-[80px] resize-y"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Brief overview of the trend..."
              />
            </div>
            <div>
              <label className="label">Data (JSON, optional)</label>
              <textarea
                className="input min-h-[80px] resize-y font-mono text-xs"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                placeholder='{"products": [], "keywords": []}'
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? "Creating..." : "Create Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card text-center text-gray-400 py-8">Loading...</div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400">No trend reports yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            Create reports to track market intelligence separately from the product pipeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="card space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-white">{report.title}</h3>
                <span className="text-xs text-gray-500 shrink-0 ml-4">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              {report.summary && (
                <p className="text-sm text-gray-300">{report.summary}</p>
              )}
              {report.data && Object.keys(report.data).length > 0 && (
                <details className="text-xs">
                  <summary className="text-gray-500 cursor-pointer hover:text-gray-300">
                    View data
                  </summary>
                  <pre className="mt-2 rounded bg-gray-800 p-3 text-gray-300 overflow-x-auto">
                    {JSON.stringify(report.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
