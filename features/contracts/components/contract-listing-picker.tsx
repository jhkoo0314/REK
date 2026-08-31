"use client";

import type { ContractOption } from "@/features/contracts/server/contract-registration";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function ContractListingPicker({ listings, sourceConsultationId }: { listings: ContractOption[]; sourceConsultationId?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [includeHistory, setIncludeHistory] = useState(false);
  const rows = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("ko-KR");
    if (keyword.length < 2) return [];
    return listings.filter((item) => (includeHistory || item.isCurrent) && (item.searchText ?? item.label).toLocaleLowerCase("ko-KR").includes(keyword)).slice(0, 50);
  }, [includeHistory, listings, query]);

  function registerContract(listingId: string) {
    const params = new URLSearchParams({ listingId });
    if (sourceConsultationId) params.set("sourceConsultation", sourceConsultationId);
    router.push(`/contracts/new?${params.toString()}`);
  }

  return <section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><div className="border-b border-[#e5e1db] p-5"><h2 className="text-base font-extrabold">계약할 매물 찾기</h2><p className="mt-1 text-xs text-[#7b7470]">매물번호, 건물명, 주소 또는 호수를 2글자 이상 입력한 뒤 매물을 선택하세요.</p><div className="mt-4 flex flex-wrap items-center gap-3"><input className="field mt-0 min-w-[220px] flex-1" onChange={(event) => setQuery(event.target.value)} placeholder="예: M-000150, 햇살하우스, 북수리, 302호" value={query} /><label className="flex items-center gap-2 text-xs text-[#655f59]"><input checked={includeHistory} onChange={(event) => setIncludeHistory(event.target.checked)} type="checkbox" />과거 매물 이력도 찾기</label></div></div>{query.trim().length > 0 && query.trim().length < 2 && <p className="px-5 py-4 text-xs text-[#7b7470]">2글자 이상 입력해 주세요.</p>}{query.trim().length >= 2 && <div className="divide-y divide-[#eeeae5]">{rows.length ? rows.map((item) => <article className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" key={item.id}><div><b className="text-sm">{item.label}</b><p className="mt-1 text-xs text-[#77736e]">{item.isCurrent ? "현재 매물" : "과거 이력 · 상태는 다시 열리지 않습니다."}</p></div><button className="rounded-lg bg-[#3e3a37] px-3 py-2 text-xs font-bold text-white" onClick={() => registerContract(item.id)} type="button">이 매물로 계약 등록</button></article>) : <p className="px-5 py-12 text-center text-sm text-[#7b7470]">조건에 맞는 매물 기록이 없습니다.</p>}</div>}{!query.trim() && <p className="px-5 py-12 text-center text-sm text-[#7b7470]">매물을 검색하면 계약 등록 대상을 선택할 수 있습니다.</p>}</section>;
}
