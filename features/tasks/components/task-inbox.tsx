"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { inboxTasks, type InboxTask } from "@/lib/mock-data/workspace";
import Link from "next/link";
import { useState } from "react";

const groups: InboxTask["group"][] = ["지연됨", "오늘", "이번 주"];
const categoryTone = { 상담: "planned", 매물: "active", 퇴실: "notice", 계약: "neutral", 확인: "notice" } as const;

export function TaskInbox() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const visibleTasks = inboxTasks.filter((task) => showCompleted || !completedIds.includes(task.id));

  return <section><div className="mb-4 flex items-center justify-between rounded-xl border border-[#e8e1db] bg-white px-5 py-4"><div><b className="text-sm">예정 업무 {visibleTasks.length}건</b><p className="mt-1 text-xs text-[#7b7470]">기한이 가까운 상담, 매물, 퇴실, 계약 확인을 모았습니다.</p></div><button onClick={() => setShowCompleted((value) => !value)} className="rounded-lg border border-[#e8e1db] px-3 py-2 text-xs font-bold text-[#655d59]">{showCompleted ? "미완료만 보기" : "완료 항목 보기"}</button></div><div className="grid gap-4 xl:grid-cols-3">{groups.map((group) => { const tasks = visibleTasks.filter((task) => task.group === group); return <section className="overflow-hidden rounded-xl border border-[#e8e1db] bg-white" key={group}><header className={`flex items-center justify-between border-b border-[#e8e1db] px-4 py-3 ${group === "지연됨" ? "bg-[#fff5f3]" : group === "오늘" ? "bg-[#fff8ec]" : "bg-[#fdfaf8]"}`}><h2 className={`text-sm font-extrabold ${group === "지연됨" ? "text-[#b94a42]" : group === "오늘" ? "text-[#a46d26]" : "text-[#655d59]"}`}>{group}</h2><span className="font-mono text-xs text-[#7b7470]">{tasks.length}건</span></header><div className="p-2">{tasks.length ? tasks.map((task) => { const completed = completedIds.includes(task.id); return <article className={`flex items-start gap-3 rounded-lg p-3 ${completed ? "opacity-45" : "hover:bg-[#fdf8f5]"}`} key={task.id}><button aria-label={`${task.title} 완료 처리`} onClick={() => setCompletedIds((ids) => ids.includes(task.id) ? ids.filter((id) => id !== task.id) : [...ids, task.id])} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border text-[11px] ${completed ? "border-[#69775e] bg-[#69775e] text-white" : "border-[#bdb7b0] bg-white"}`}>{completed ? "✓" : ""}</button><Link className="min-w-0 flex-1" href={task.href}><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={categoryTone[task.category]}>{task.category}</StatusBadge><em className={`ml-auto font-mono text-[11px] not-italic ${group === "지연됨" ? "text-[#b94a42]" : "text-[#7b7470]"}`}>{task.due}</em></div><b className="mt-2 block text-sm leading-5">{task.title}</b><p className="mt-1 text-xs leading-5 text-[#7b7470]">{task.detail}</p></Link></article>; }) : <p className="px-3 py-8 text-center text-xs text-[#7b7470]">확인할 업무가 없습니다.</p>}</div></section>; })}</div><p className="mt-3 text-center text-[11px] text-[#7b7470]">완료 체크는 현재 목업 화면에서만 반영됩니다. 실제 저장과 원본 상태 변경은 하지 않습니다.</p></section>;
}
