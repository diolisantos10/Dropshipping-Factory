"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

interface ProductImage {
  id: string;
  originalUrl: string;
  processedUrl: string | null;
  isMain: boolean;
}

interface ProductVideo {
  id: string;
  script: string | null;
  caption: string | null;
  hashtags: string[] | null;
  status: string;
  videoUrl: string | null;
  variantIndex: number;
  voiceProvider: string | null;
  videoProvider: string | null;
  createdAt: string;
}

interface Product {
  id: string;
  sourceUrl: string;
  status: string;
  productName: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  bulletPoints: string[] | null;
  benefits: string[] | null;
  tags: string[] | null;
  category: string | null;
  costPrice: number | null;
  suggestedPrice: number | null;
  compareAtPrice: number | null;
  images: ProductImage[];
  videos: ProductVideo[];
  createdAt: string;
  updatedAt: string;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoVariants, setVideoVariants] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function fetchProduct() {
    const res = await fetch(`/api/products/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setProduct(data);
      setEditData({
        productName: data.productName,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        category: data.category,
        costPrice: data.costPrice,
        suggestedPrice: data.suggestedPrice,
        compareAtPrice: data.compareAtPrice,
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleProcess() {
    setProcessing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/products/${params.id}/process`, { method: "POST" });
      if (res.ok) {
        await fetchProduct();
        setMsg({ type: "success", text: "Product processed successfully!" });
      } else {
        const j = await res.json();
        setMsg({ type: "error", text: j.error || "Processing failed" });
      }
    } finally {
      setProcessing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        await fetchProduct();
        setEditMode(false);
        setMsg({ type: "success", text: "Saved!" });
      } else {
        const j = await res.json();
        setMsg({ type: "error", text: j.error || "Save failed" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateVideos() {
    setGeneratingVideo(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/products/${params.id}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantCount: videoVariants }),
      });
      if (res.ok) {
        await fetchProduct();
        setMsg({ type: "success", text: `${videoVariants} video(s) generation started!` });
      } else {
        const j = await res.json();
        setMsg({ type: "error", text: j.error || "Video generation failed" });
      }
    } finally {
      setGeneratingVideo(false);
    }
  }

  async function handleCreatePublishJob(videoId?: string) {
    const res = await fetch("/api/publishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: params.id, channel: "tiktok", videoId }),
    });
    if (res.ok) {
      setMsg({ type: "success", text: "TikTok publish job created!" });
      router.push("/dashboard/publishing");
    } else {
      const j = await res.json();
      setMsg({ type: "error", text: j.error || "Failed to create publish job" });
    }
  }

  if (loading) {
    return <div className="text-gray-400 text-center py-16">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Product not found</p>
        <Link href="/dashboard" className="btn-secondary mt-4 inline-flex">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">
            &larr; Back to Products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-white">
            {product.productName || "Unnamed Product"}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={product.status} />
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:underline"
            >
              View on AliExpress
            </a>
          </div>
        </div>

        <div className="flex gap-2">
          {(product.status === "QUEUED" || product.status === "FAILED") && (
            <button onClick={handleProcess} disabled={processing} className="btn-primary">
              {processing ? "Processing..." : "Process Now"}
            </button>
          )}
          {product.status === "READY" && !editMode && (
            <button onClick={() => setEditMode(true)} className="btn-secondary">
              Edit
            </button>
          )}
          {editMode && (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditMode(false)} className="btn-secondary">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={`rounded px-4 py-2 text-sm ${
            msg.type === "success"
              ? "bg-green-900 text-green-300"
              : "bg-red-900 text-red-300"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Product Info */}
        <div className="col-span-2 space-y-4">
          {/* Core Fields */}
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Product Info
            </h2>

            <div>
              <label className="label">Product Name</label>
              {editMode ? (
                <input
                  className="input"
                  value={editData.productName || ""}
                  onChange={(e) => setEditData({ ...editData, productName: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-200">{product.productName || "—"}</p>
              )}
            </div>

            <div>
              <label className="label">Short Description</label>
              {editMode ? (
                <input
                  className="input"
                  value={editData.shortDescription || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, shortDescription: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-gray-200">{product.shortDescription || "—"}</p>
              )}
            </div>

            <div>
              <label className="label">Long Description</label>
              {editMode ? (
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={editData.longDescription || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, longDescription: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-gray-200 whitespace-pre-wrap">
                  {product.longDescription || "—"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                {editMode ? (
                  <input
                    className="input"
                    value={editData.category || ""}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-gray-200">{product.category || "—"}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Cost Price</label>
                {editMode ? (
                  <input
                    type="number"
                    className="input"
                    value={editData.costPrice || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, costPrice: parseFloat(e.target.value) })
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-200">
                    {product.costPrice ? `$${product.costPrice.toFixed(2)}` : "—"}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Suggested Price</label>
                {editMode ? (
                  <input
                    type="number"
                    className="input"
                    value={editData.suggestedPrice || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, suggestedPrice: parseFloat(e.target.value) })
                    }
                  />
                ) : (
                  <p className="text-sm text-green-400 font-medium">
                    {product.suggestedPrice ? `$${product.suggestedPrice.toFixed(2)}` : "—"}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Compare At</label>
                {editMode ? (
                  <input
                    type="number"
                    className="input"
                    value={editData.compareAtPrice || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, compareAtPrice: parseFloat(e.target.value) })
                    }
                  />
                ) : (
                  <p className="text-sm text-gray-400 line-through">
                    {product.compareAtPrice ? `$${product.compareAtPrice.toFixed(2)}` : "—"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bullet Points & Benefits */}
          {(product.bulletPoints?.length || product.benefits?.length) && (
            <div className="card space-y-4">
              {product.bulletPoints?.length ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Key Features</h3>
                  <ul className="space-y-1">
                    {product.bulletPoints.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-indigo-400 shrink-0">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {product.benefits?.length ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Benefits</h3>
                  <ul className="space-y-1">
                    {product.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-green-400 shrink-0">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {product.tags?.length ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Videos */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Videos ({product.videos.length})
              </h2>
              {product.status === "READY" && (
                <div className="flex items-center gap-2">
                  <select
                    value={videoVariants}
                    onChange={(e) => setVideoVariants(parseInt(e.target.value))}
                    className="input w-auto py-1 text-xs"
                  >
                    <option value={1}>1 variant</option>
                    <option value={2}>2 variants</option>
                    <option value={3}>3 variants</option>
                  </select>
                  <button
                    onClick={handleGenerateVideos}
                    disabled={generatingVideo}
                    className="btn-primary text-xs"
                  >
                    {generatingVideo ? "Generating..." : "Generate Videos"}
                  </button>
                </div>
              )}
            </div>

            {product.videos.length === 0 ? (
              <p className="text-sm text-gray-500">
                No videos yet. Generate videos once the product is processed.
              </p>
            ) : (
              <div className="space-y-3">
                {product.videos.map((video) => (
                  <div key={video.id} className="rounded border border-gray-700 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Variant {video.variantIndex + 1} — {video.voiceProvider || "—"} /{" "}
                        {video.videoProvider || "—"}
                      </span>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={video.status} />
                        {video.status === "READY" && (
                          <button
                            onClick={() => handleCreatePublishJob(video.id)}
                            className="btn-primary text-xs py-0.5 px-2"
                          >
                            Publish to TikTok
                          </button>
                        )}
                      </div>
                    </div>

                    {video.script && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Script</p>
                        <p className="text-sm text-gray-300 bg-gray-800 rounded p-2">
                          {video.script}
                        </p>
                      </div>
                    )}

                    {video.caption && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Caption</p>
                        <p className="text-sm text-gray-300">{video.caption}</p>
                      </div>
                    )}

                    {video.hashtags && (
                      <div className="flex flex-wrap gap-1">
                        {(video.hashtags as string[]).map((tag, i) => (
                          <span key={i} className="text-xs text-indigo-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Images */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Images ({product.images.length})
            </h2>

            {product.images.length === 0 ? (
              <p className="text-sm text-gray-500">No images</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className={`relative overflow-hidden rounded ${
                      img.isMain ? "ring-2 ring-indigo-500" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.originalUrl}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                    {img.isMain && (
                      <span className="absolute top-1 left-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-xs text-white">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {product.status === "READY" && (
            <div className="card space-y-2">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Quick Actions
              </h2>
              <button
                onClick={() => handleCreatePublishJob()}
                className="btn-primary w-full justify-center"
              >
                Create TikTok Package
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
