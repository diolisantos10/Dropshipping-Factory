"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Products" },
  { href: "/dashboard/publishing", label: "Publishing" },
  { href: "/dashboard/trends", label: "Trends" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-gray-800 bg-gray-950 px-6 py-3">
      <Link href="/dashboard" className="mr-6 text-sm font-bold text-indigo-400">
        Dropshipping Factory
      </Link>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={clsx(
            "rounded px-3 py-1.5 text-sm transition-colors",
            pathname === item.href
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:text-gray-100"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
