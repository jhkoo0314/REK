"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, type ReactNode, useState } from "react";

const navigation = [
  { href: "/dashboard", label: "중요업무알림" },
  { href: "/consultations", label: "상담 관리" },
  { href: "/listings", label: "매물 관리" },
  { href: "/buildings", label: "건물·호실" },
  { href: "/contracts", label: "계약 관리", children: [{ href: "/contracts", label: "계약 조회" }, { href: "/contracts/new", label: "계약 등록" }] },
  { href: "/advertisements", label: "광고비·문구" },
  { href: "/revenue", label: "매출관리" },
  { href: "/members", label: "멤버 권한" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(pathname.startsWith("/contracts"));

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#302b28] lg:grid lg:grid-cols-[224px_1fr]">
      <aside className="border-r border-[#e2d9d1] bg-[#f1ede8] px-4 py-5 text-[#302b28] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:py-7">
        <div className="flex items-center justify-between lg:block">
          <Link className="text-base font-extrabold tracking-[-0.06em] text-[#302b28]" href="/dashboard">
            <span className="mr-2 rounded bg-[#e8d1c5] px-1.5 py-0.5 font-mono text-sm text-[#8f4e36]">h</span>
            HOMEROOM
          </Link>
          <div className="flex items-center gap-2 lg:hidden"><OrganizationSwitcher afterSelectOrganizationUrl="/dashboard" hidePersonal /><UserButton /></div>
        </div>
        <nav className="mt-5 flex gap-1 overflow-x-auto lg:mt-8 lg:grid">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Fragment key={item.href}>
              {item.children ? <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className={`w-full text-left whitespace-nowrap rounded-lg px-3 py-3 text-sm font-bold tracking-[-0.02em] transition ${active ? "bg-[#f3e4dc] text-[#8f4e36]" : "text-[#655d59] hover:bg-[#eae3dc] hover:text-[#302b28]"}`}
              >
                {active && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#a85f43]" />}
                {item.label}<span className="ml-2 text-xs">{expanded ? "▾" : "▸"}</span>
              </button> : <Link
                className={`whitespace-nowrap rounded-lg px-3 py-3 text-sm font-bold tracking-[-0.02em] transition ${active ? "bg-[#f3e4dc] text-[#8f4e36]" : "text-[#655d59] hover:bg-[#eae3dc] hover:text-[#302b28]"}`}
                href={item.href}
              >{active && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#a85f43]" />}{item.label}</Link>}
              {item.children && expanded && <div className="ml-3 grid gap-1 border-l border-[#dfd4cb] pl-2">{item.children.map((child) => { const childActive = pathname === child.href; return <Link key={child.href} href={child.href} className={`rounded-lg px-3 py-2 text-xs font-bold ${childActive ? "bg-[#f3e4dc] text-[#8f4e36]" : "text-[#655d59] hover:bg-[#eae3dc]"}`}>{child.label}</Link>; })}</div>}
              </Fragment>
            );
          })}
        </nav>
        <div className="mt-auto hidden border-t border-[#e2d9d1] px-3 pt-5 text-xs text-[#7b7470] lg:block">
          <UserButton showName />
        </div>
      </aside>
      <div className="min-w-0 px-4 pb-10 lg:px-9">
        <header className="flex h-16 items-center justify-between border-b border-[#e8e1db]">
          <span className="font-mono text-[10px] tracking-wide text-[#7b7470]">WORKSPACE / DEVELOPMENT</span>
          <div className="hidden items-center gap-3 lg:flex"><OrganizationSwitcher afterSelectOrganizationUrl="/dashboard" hidePersonal /><UserButton /></div>
        </header>
        {children}
      </div>
    </div>
  );
}
