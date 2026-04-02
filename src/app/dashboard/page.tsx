"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

interface Product {
  id: string;
  productName: string | null;
  sourceUrl: string;
  status: string;
  category: string | null;
  suggestedPrice: number | null;
  createdAt: string;
  images: { originalUrl: string }[];
  _count: { videos: number; publishJobs: number };
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: url }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to queue product");
      } else {
        setSuccess(`Product queued! Processing started for: ${url}`);
        setUrl("");
        fetchProducts();
      }
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Factory</h1>
        <p className="mt-1 text-sm text-gray-400">Paste an AliExpress URL to start processing</p>
      </div>

      {/* URL Input */}
      <div className="card">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.aliexpress.com/item/..."
            className="input flex-1"
            required
          />
          <button type="submit" disabled={submitting} className="btn-primary whitespace-nowrap">
            {submitting ? "Queuing..." : "Queue Product"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {success && <p className="mt-2 text-sm text-green-400">{success}</p>}
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-4 gap-4">
          {(["QUEUED", "PROCESSING", "READY", "PUBLISHED"] as const).map((status) => {
            const count = data.products.filter((p) => p.status === status).length;
            return (
              <div key={status} className="card text-center">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className="text-xs text-gray-400 mt-1">{status}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Products List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            Products {data ? `(${data.total})` : ""}
          </h2>
          <button onClick={fetchProducts} className="btn-secondary text-xs">
            Refresh
          </button>
        </div>

        {loading && !data ? (
          <div className="card text-center text-gray-400 py-8">Loading...</div>
        ) : !data?.products.length ? (
          <div className="card text-center text-gray-400 py-8">
            No products yet. Paste an AliExpress URL above to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {data.products.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/product/${product.id}`}
                className="card flex items-center gap-4 hover:border-indigo-700 transition-colors cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-800">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0].originalUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">
                      IMG
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">
                      {product.productName || "Processing..."}
                    </span>
                    <StatusBadge status={product.status} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {product.sourceUrl}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {product.suggestedPrice && (
                    <div className="text-sm font-medium text-green-400">
                      ${product.suggestedPrice.toFixed(2)}
                    </div>
                  )}
                  {product.category && (
                    <div className="text-xs text-gray-500">{product.category}</div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    {product._count.videos} video{product._count.videos !== 1 ? "s" : ""}
                    {" · "}
                    {product._count.publishJobs} job{product._count.publishJobs !== 1 ? "s" : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
