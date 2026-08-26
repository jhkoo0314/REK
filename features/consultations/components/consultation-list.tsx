"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import type { ConsultationListItem } from "@/features/consultations/server/consultation-registration";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const statusLabel: Record<string, string> = { in_progress: "진행 중", on_hold: "보류", ended: "종료", needs_confirmation: "확인 필요" };
const stageLabel: Record<string, string> = { new_inquiry: "신규 문의", condition_check: "조건 확인", visit_scheduled: "방문 예정", visit_completed: "방문 완료", reviewing: "검토 중", closed: "종료" };
type Filter = "전체" | "지연" | "오늘 연락" | "진행 중" | "보류" | "확인 필요" | "종료";

function today() { return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }); }
function nextState(date: string | null) { if (!date) return "없음"; if (date < today()) return "지연"; if (date === today()) return "오늘"; return "예정"; }
function needSummary(item: ConsultationListItem) {
  const areas = [...item.desiredAreas, item.desiredAreasOther ?? ""].filter(Boolean).join(", ");
  const rooms = [...item.desiredRoomTypes, item.desiredRoomTypesOther ?? ""].filter(Boolean).join(", ");
  const budget = [item.desiredDepositBudget !== null ? `${item.desiredDepositBudget}` : "", item.desiredMonthlyRentBudget !== null ? item.desiredMonthlyRentBudget : ""].filter((value) => value !== "").join(" / ");
  return [areas, rooms, budget].filter(Boolean).join(" · ") || "희망 조건 미입력";
}

export function ConsultationList({ consultations }: { consultations: ConsultationListItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("전체");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => consultations.filter((item) => {
    const searchText = `${item.customerName} ${item.customerPhone} ${item.inflowSource} ${needSummary(item)}`.toLowerCase();
    if (!searchText.includes(query.trim().toLowerCase())) return false;
    const due = nextState(item.nextContactDate);
    if (filter === "전체") return true;
    if (filter === "지연") return due === "지연";
    if (filter === "오늘 연락") return due === "오늘";
    return statusLabel[item.status] === filter;
  }), [consultations, filter, query]);
  const filters: Array<{ label: Filter; count: number }> = [
    { label: "전체", count: consultations.length }, { label: "지연", count: consultations.filter((item) => nextState(item.nextContactDate) === "지연").length }, { label: "오늘 연락", count: consultations.filter((item) => nextState(item.nextContactDate) === "오늘").length },
    { label: "진행 중", count: consultations.filter((item) => item.status === "in_progress").length }, { label: "보류", count: consultations.filter((item) => item.status === "on_hold").length }, { label: "확인 필요", count: consultations.filter((item) => item.status === "needs_confirmation").length }, { label: "종료", count: consultations.filter((item) => item.status === "ended").length },
  ];
  return <section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><div className="flex flex-wrap gap-2 border-b border-[#e5e1db] p-3"><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 min-w-52 rounded-lg border border-[#e5e1db] px-3 text-xs outline-none focus:border-[#aa9b8d]" placeholder="고객, 연락처, 지역 검색" />{filters.map((item) => <button className={`h-9 rounded-lg border px-3 text-xs font-semibold ${filter === item.label ? "border-[#d7cabe] bg-[#eeeae3] text-[#3e3a37]" : "border-[#e5e1db] text-[#655f59]"}`} onClick={() => setFilter(item.label)} key={item.label}>{item.label}<span className="ml-1.5 font-mono text-[10px]">{item.count}</span></button>)}</div>{rows.length === 0 ? <div className="px-5 py-16 text-center"><p className="text-sm font-bold text-[#514b45]">표시할 상담이 없습니다.</p><p className="mt-2 text-xs text-[#7b7470]">새 상담을 등록하거나 검색·필터 조건을 바꿔 보세요.</p></div> : <div className="overflow-x-auto"><table className="min-w-[900px] w-full border-collapse text-left"><thead className="border-b border-[#e5e1db] bg-[#faf9f7] font-mono text-[10px] tracking-wide text-[#77736e]"><tr><th className="px-4 py-3">STATUS / STAGE</th><th>CUSTOMER</th><th>NEED</th><th>SOURCE</th><th>CONSULTED</th><th>NEXT CONTACT</th></tr></thead><tbody>{rows.map((item) => { const due = nextState(item.nextContactDate); const href = `/consultations/${item.id}`; return <tr className="cursor-pointer border-b border-[#eeeae5] hover:bg-[#faf8f4] focus-within:bg-[#faf8f4]" key={item.id} onClick={() => router.push(href)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); router.push(href); } }} role="link" tabIndex={0}><td className="px-4 py-3"><div className="flex flex-wrap gap-1"><StatusBadge tone={item.status === "ended" ? "neutral" : item.status === "on_hold" ? "notice" : "active"}>{statusLabel[item.status] ?? item.status}</StatusBadge><StatusBadge tone="planned">{stageLabel[item.progressStage] ?? item.progressStage}</StatusBadge></div></td><td className="py-3"><Link href={href} className="block"><b>{item.customerName}</b><span className="mt-0.5 block font-mono text-[11px] text-[#514b45]">{item.customerPhone}</span><span className="mt-0.5 block font-mono text-[10px] text-[#77736e]">{item.category === "listing" ? "매물 상담" : "일반 상담"}</span></Link></td><td className="max-w-60 py-3 text-xs text-[#655f59]">{needSummary(item)}</td><td className="py-3 text-xs">{item.inflowSource}</td><td className="py-3 font-mono text-[11px]">{item.consultationDate}</td><td className="py-3">{due === "지연" ? <StatusBadge tone="late">지연 · {item.nextContactDate}</StatusBadge> : due === "오늘" ? <StatusBadge tone="notice">오늘 · {item.nextContactDate}</StatusBadge> : <span className="font-mono text-[11px]">{item.nextContactDate ?? "—"}</span>}</td></tr>; })}</tbody></table></div>}</section>;
}
