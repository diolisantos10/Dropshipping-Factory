import clsx from "clsx";

const statusColors: Record<string, string> = {
  QUEUED: "bg-yellow-900 text-yellow-300",
  PROCESSING: "bg-blue-900 text-blue-300",
  READY: "bg-green-900 text-green-300",
  PUBLISHED: "bg-purple-900 text-purple-300",
  FAILED: "bg-red-900 text-red-300",
  PENDING: "bg-yellow-900 text-yellow-300",
  GENERATING: "bg-blue-900 text-blue-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx("badge", statusColors[status] || "bg-gray-700 text-gray-300")}>
      {status}
    </span>
  );
}
