"use client";

import { RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ListingListFilters } from "@/features/listings/server/listing-queries";

type QuickFilter = {
  label: string;
  values: Pick<ListingListFilters, "status" | "availabilityType">;
};

const quickFilters: QuickFilter[] = [
  { label: "전체 보기", values: {} },
  { label: "즉시 입주 가능", values: { availabilityType: "즉시입주" } },
  { label: "공실", values: { status: "공실" } },
  { label: "광고 가능", values: { status: "광고 가능" } },
  { label: "계약 진행 중", values: { status: "계약 진행 중" } },
];

const statuses = ["확인 필요", "퇴실 예정", "공실", "광고 가능", "계약 진행 중", "계약 완료", "보류", "종료"] as const;

export function ListingFilterPanel({ filters }: { filters: ListingListFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const [query, setQuery] = useState(filters.query ?? "");

  useEffect(() => setQuery(filters.query ?? ""), [filters.query]);

  function updateParams(changes: Record<string, string | undefined>) {
    const params = new URLSearchParams(currentSearchParams.toString());

    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname);
  }

  function selectQuickFilter(values: QuickFilter["values"]) {
    updateParams({ status: undefined, availabilityType: undefined, ...values });
  }

  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"><div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4"><span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">추천 필터</span>{quickFilters.map((filter) => { const isSelected = filter.values.status ? filters.status === filter.values.status : filter.values.availabilityType ? filters.availabilityType === filter.values.availabilityType : !filters.status && !filters.availabilityType; return <button key={filter.label} type="button" onClick={() => selectQuickFilter(filter.values)} className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${isSelected ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"}`}>{filter.label}</button>; })}</div><form className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => { event.preventDefault(); updateParams({ q: query.trim() || undefined }); }}><label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-slate-500">통합 검색</span><span className="relative block"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="건물명, 호실, 주소, 매물번호로 검색" /></span></label><label><span className="mb-1.5 block text-xs font-semibold text-slate-500">매물 상태</span><select value={filters.status ?? ""} onChange={(event) => updateParams({ status: event.target.value || undefined })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="">전체 상태</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label><span className="mb-1.5 block text-xs font-semibold text-slate-500">거래 방식</span><select value={filters.transactionType ?? ""} onChange={(event) => updateParams({ transactionType: event.target.value || undefined })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"><option value="">월세 · 전세 전체</option><option>월세</option><option>전세</option><option>확인 필요</option></select></label><button type="submit" className="sr-only">검색</button></form><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><p className="text-xs text-slate-400">검색어는 Enter를 누르면 적용됩니다. 상태·거래 방식은 선택 즉시 적용됩니다.</p><button type="button" onClick={() => { setQuery(""); router.replace(pathname); }} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"><RotateCcw className="size-3.5" /> 초기화</button></div></section>;
}
