"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { consultations, type ConsultationStage } from "@/lib/mock-data/workspace";
import Link from "next/link";
import { useMemo, useState } from "react";

const filters: Array<{ label: ConsultationStage | "전체" | "오늘 연락" | "지연"; count?: number }> = [
  { label: "전체", count: consultations.length },
  { label: "지연", count: consultations.filter((item) => item.nextActionState === "지연").length },
  { label: "오늘 연락", count: consultations.filter((item) => item.nextActionState === "오늘").length },
  { label: "상담 진행" },
  { label: "방문 예정" },
];

function tone(stage: ConsultationStage) { return stage === "방문 예정" ? "planned" : stage === "상담 진행" ? "active" : stage === "계약 검토" ? "notice" : stage === "연락 예정" ? "late" : "neutral" as const; }

export function ConsultationList() {
  const [filter, setFilter] = useState<(typeof filters)[number]["label"]>("전체");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => consultations.filter((item) => {
    const matchesQuery = `${item.customerName} ${item.id} ${item.area}`.includes(query);
    if (filter === "전체") return matchesQuery;
    if (filter === "오늘 연락") return matchesQuery && item.nextActionState === "오늘";
    if (filter === "지연") return matchesQuery && item.nextActionState === "지연";
    return matchesQuery && item.stage === filter;
  }), [filter, query]);
  return <section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><div className="flex flex-wrap gap-2 border-b border-[#e5e1db] p-3"><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 min-w-52 rounded-lg border border-[#e5e1db] px-3 text-xs outline-none focus:border-[#aa9b8d]" placeholder="고객, 상담번호, 지역 검색" />{filters.map((item) => <button className={`h-9 rounded-lg border px-3 text-xs font-semibold ${filter === item.label ? "border-[#d7cabe] bg-[#eeeae3] text-[#3e3a37]" : "border-[#e5e1db] text-[#655f59]"}`} onClick={() => setFilter(item.label)} key={item.label}>{item.label}{item.count !== undefined && <span className="ml-1.5 font-mono text-[10px]">{item.count}</span>}</button>)}</div><div className="overflow-x-auto"><table className="min-w-[760px] w-full border-collapse text-left"><thead className="border-b border-[#e5e1db] bg-[#faf9f7] font-mono text-[10px] tracking-wide text-[#77736e]"><tr><th className="px-4 py-3">STAGE</th><th> CUSTOMER / NEED</th><th>SOURCE</th><th>LISTINGS</th><th>LAST ACTIVITY</th><th>NEXT ACTION</th><th>OWNER</th></tr></thead><tbody>{rows.map((item) => <tr className="border-b border-[#eeeae5] hover:bg-[#faf8f4]" key={item.id}><td className="px-4 py-3"><StatusBadge tone={tone(item.stage)}>{item.stage}</StatusBadge></td><td className="py-3"><Link href={`/consultations/${item.id}`} className="block"><b>{item.customerName}</b><span className="mt-0.5 block text-[11px] text-[#77736e]">{item.area} · {item.layout} · {item.budget}</span></Link></td><td>{item.source}</td><td>{item.listingIds.length}건</td><td className="font-mono text-[11px]">{item.lastActivity} · {item.lastActivityType}</td><td>{item.nextActionState === "지연" ? <StatusBadge tone="late">지연 · {item.nextAction}</StatusBadge> : item.nextActionState === "오늘" ? <StatusBadge tone="notice">{item.nextAction}</StatusBadge> : <span className="font-mono text-[11px]">{item.nextAction}</span>}</td><td>{item.owner}</td></tr>)}</tbody></table></div></section>;
}
