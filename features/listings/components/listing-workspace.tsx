"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { listings } from "@/lib/mock-data/workspace";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function ListingWorkspace() {
  const params = useSearchParams();
  const consultation = params.get("consultation");
  const [query, setQuery] = useState(params.get("area") ?? "");
  const [vacantOnly, setVacantOnly] = useState(false);
  const result = useMemo(() => listings.filter((listing) => `${listing.building} ${listing.unit} ${listing.address} ${listing.id} ${listing.layout}`.includes(query) && (!vacantOnly || listing.status === "공실")), [query, vacantOnly]);
  return <><section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><div className="flex flex-wrap gap-2 border-b border-[#e5e1db] p-3"><input className="h-9 min-w-52 rounded-lg border border-[#e5e1db] px-3 text-xs outline-none focus:border-[#aa9b8d]" onChange={(event) => setQuery(event.target.value)} value={query} placeholder="건물명, 주소, 호실, 매물번호 검색" /><button className={`h-9 rounded-lg border px-3 text-xs font-semibold ${vacantOnly ? "border-[#d7cabe] bg-[#eeeae3]" : "border-[#e5e1db]"}`} onClick={() => setVacantOnly((value) => !value)}>공실만</button>{consultation && <span className="flex h-9 items-center rounded-lg bg-[#eeeae3] px-3 text-xs font-semibold text-[#3e3a37]">상담 조건 적용됨</span>}</div><div className="overflow-x-auto"><table className="min-w-[760px] w-full border-collapse text-left text-xs"><thead className="border-b border-[#e5e1db] bg-[#faf9f7] font-mono text-[10px] tracking-wide text-[#77736e]"><tr><th className="px-4 py-3">STATUS</th><th>PROPERTY</th><th>LAYOUT</th><th>TERMS</th><th>AVAILABLE</th><th>CHECK</th><th>ACTION</th></tr></thead><tbody>{result.map((listing) => <tr className="border-b border-[#eeeae5] hover:bg-[#faf8f4]" key={listing.id}><td className="px-4 py-3"><StatusBadge tone={listing.status === "공실" ? "active" : listing.status === "계약 진행" ? "notice" : "neutral"}>{listing.status}</StatusBadge></td><td className="py-3"><b>{listing.building} {listing.unit}</b><span className="mt-0.5 block text-[11px] text-[#77736e]">{listing.address} · {listing.id}</span></td><td>{listing.layout}</td><td className="font-mono">{listing.terms}</td><td>{listing.available}</td><td>{listing.check === "—" ? "—" : <StatusBadge tone="notice">{listing.check}</StatusBadge>}</td><td>{consultation ? <Link className="rounded-lg border border-[#3e3a37] px-2.5 py-2 text-[11px] font-bold text-[#3e3a37]" href={`/consultations/${consultation}`}>이 상담에 제안</Link> : <button className="rounded-lg border border-[#3e3a37] px-2.5 py-2 text-[11px] font-bold text-[#3e3a37]">빠른 수정</button>}</td></tr>)}</tbody></table></div></section>{consultation && <p className="mt-3 text-xs text-[#77736e]">상담에서 가져온 조건을 기준으로 전체 재고를 검색하고 있습니다. 실제 제안 저장은 다음 기능 구현 단계에서 연결합니다.</p>}</>;
}
