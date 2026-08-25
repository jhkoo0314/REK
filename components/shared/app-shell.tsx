"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/consultations", label: "상담 관리" },
  { href: "/dashboard", label: "업무 인박스" },
  { href: "/listings", label: "매물 관리" },
  { href: "/buildings", label: "건물·호실" },
  { href: "/contracts", label: "계약 관리" },
  { href: "/advertisements", label: "광고비·문구" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6f5f2] text-[#292827] lg:grid lg:grid-cols-[224px_1fr]">
      <aside className="bg-[#292827] px-4 py-5 text-[#eceae6] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:py-7">
        <div className="flex items-center justify-between lg:block">
          <Link className="text-base font-extrabold tracking-[-0.06em] text-white" href="/consultations">
            <span className="mr-2 rounded bg-[#eeeae3] px-1.5 py-0.5 font-mono text-sm text-[#292827]">h</span>
            HOMEROOM
          </Link>
          <div className="lg:hidden"><UserButton /></div>
        </div>
        <nav className="mt-5 flex gap-1 overflow-x-auto lg:mt-8 lg:grid">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-xs font-semibold transition ${active ? "bg-[#3e3a37] text-white" : "text-[#c7c3bd] hover:bg-[#3e3a37] hover:text-white"}`}
                href={item.href}
                key={item.href}
              >
                {active && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#e6c8a8]" />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-[#484541] px-3 pt-5 text-xs text-[#c7c3bd] lg:block">
          <UserButton showName />
        </div>
      </aside>
      <div className="min-w-0 px-4 pb-10 lg:px-9">
        <header className="flex h-16 items-center justify-between border-b border-[#e5e1db]">
          <span className="font-mono text-[10px] tracking-wide text-[#77736e]">WORKSPACE / DEVELOPMENT</span>
          <div className="hidden lg:block"><UserButton /></div>
        </header>
        {children}
      </div>
    </div>
  );
}
