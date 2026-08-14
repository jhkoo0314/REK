"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  Building2,
  ClipboardSignature,
  House,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageCircle,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

type AppShellProps = {
  children: ReactNode;
};

const navigation = [
  { href: "/dashboard", label: "대시보드 Overview", icon: LayoutDashboard },
  { href: "/listings", label: "매물 통합 관리", icon: House },
  { href: "/consultations", label: "상담 및 고객 DB", icon: MessageCircle },
  { href: "/contracts", label: "계약 관리 센터", icon: ClipboardSignature },
  { href: "/advertisements", label: "광고 및 AI 홍보 문구", icon: Megaphone },
];

const pageHeaders = [
  { match: (path: string) => path === "/dashboard", title: "대시보드 Overview", description: "오늘의 매물과 업무 현황을 확인합니다." },
  { match: (path: string) => path === "/listings", title: "매물 통합 관리 (SCR-03)", description: "매물 검색, 상태 확인, 빠른 수정 관리를 제공합니다." },
  { match: (path: string) => path === "/listings/new", title: "신규 매물 등록 (SCR-04)", description: "건물 → 호실 → 매물 조건 3단계 등록" },
  { match: (path: string) => path.startsWith("/listings/"), title: "매물 상세 정보", description: "매물 조건과 연결 업무를 확인합니다." },
  { match: (path: string) => path === "/consultations", title: "상담 및 고객 DB (SCR-06)", description: "문의 고객 관리, 매물 추천 및 현장 방문 일정 추적" },
  { match: (path: string) => path === "/contracts", title: "계약 관리 센터 (SCR-07)", description: "임대차 계약 체결 현황, 만기 예정 알림 및 재계약 추적" },
  { match: (path: string) => path === "/advertisements", title: "광고 현황 & AI 카피라이팅 (SCR-08)", description: "채널별 매물 광고 노출 관리 및 홍보 문구 템플릿" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pageHeader = pageHeaders.find((item) => item.match(pathname)) ?? pageHeaders[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {isMobileMenuOpen ? (
        <button
          aria-label="메뉴 닫기"
          className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white px-4 py-5 transition-transform duration-200 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
              <Building2 className="size-5" strokeWidth={2.1} />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight tracking-tight text-slate-900">배방우리부동산</span>
              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">SaaS Partner Platform</span>
            </span>
          </Link>
          <button
            aria-label="메뉴 닫기"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-10 space-y-1" aria-label="주 메뉴">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">조직 &amp; 설정</p>
          <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400" aria-disabled="true">
            <UsersRound className="size-5" />
            멤버 및 권한 <span className="ml-auto text-[11px]">준비 중</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400" aria-disabled="true">
            <Settings className="size-5" />
            환경 설정
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <UserButton />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900">로그인한 사용자</p>
              <p className="mt-0.5 text-[11px] text-slate-500">조직 설정 연결 전</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur lg:px-9">
          <div className="flex items-center gap-3">
            <button
              aria-label="메뉴 열기"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-base font-bold text-slate-950 sm:text-lg">{pageHeader.title}</p>
              <p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block">{pageHeader.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pathname === "/dashboard" ? (
              <Link
                href="/listings/new"
                className="hidden rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-brand-700 sm:inline-flex"
              >
                + 신규 매물 등록 (SCR-04)
              </Link>
            ) : null}
            <button aria-label="알림" type="button" className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell className="size-5" />
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
