"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { inboxTasks, type InboxTask } from "@/lib/mock-data/workspace";
import Link from "next/link";
import { useState } from "react";

const groups: InboxTask["group"][] = ["지연됨", "오늘", "이번 주"];
const categoryTone = { 상담: "planned", 매물: "active", 퇴실: "notice", 계약: "neutral", 확인: "notice" } as const;

export function TaskInbox({ compact = false }: { compact?: boolean }) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const visibleTasks = inboxTasks.filter((task) => showCompleted || !completedIds.includes(task.id));
  const displayedGroups = compact ? groups.slice(0, 2) : groups;

  return <section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><div className="flex items-center justify-between px-4 py-4"><div><h2 className="font-extrabold tracking-[-0.04em]">업무 인박스</h2><p className="mt-1 text-[11px] text-[#77736e]">예정된 일과 확인할 일을 기한순으로 점검합니다.</p></div><button onClick={() => setShowCompleted((value) => !value)} className="font-mono text-[10px] text-[#77736e]">{showCompleted ? "미완료만" : `미완료 ${visibleTasks.length}건`}</button></div>{displayedGroups.map((group) => { const tasks = visibleTasks.filter((task) => task.group === group); if (!tasks.length) return null; return <div className="border-t border-[#e5e1db] p-2" key={group}><div className={`px-2 py-2 font-mono text-[10px] font-bold ${group === "지연됨" ? "text-[#b64c43]" : group === "오늘" ? "text-[#a86a32]" : "text-[#77736e]"}`}>{group.toUpperCase()} · {tasks.length}</div>{tasks.map((task) => { const completed = completedIds.includes(task.id); return <article className={`flex items-start gap-3 rounded-lg px-2 py-3 ${completed ? "opacity-45" : "hover:bg-[#faf8f4]"}`} key={task.id}><button aria-label={`${task.title} 완료 처리`} onClick={() => setCompletedIds((ids) => ids.includes(task.id) ? ids.filter((id) => id !== task.id) : [...ids, task.id])} className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${completed ? "border-[#657660] bg-[#657660] text-white" : "border-[#bdb7b0] bg-white"}`}>{completed ? "✓" : ""}</button><Link className="min-w-0 flex-1" href={task.href}><div className="flex items-center gap-2"><StatusBadge tone={categoryTone[task.category]}>{task.category}</StatusBadge><b className="text-xs">{task.title}</b><em className={`ml-auto whitespace-nowrap font-mono text-[10px] not-italic ${group === "지연됨" ? "text-[#b64c43]" : "text-[#77736e]"}`}>{task.due}</em></div><p className="mt-1 text-[11px] text-[#77736e]">{task.detail}</p></Link></article>; })}</div>; })}{!visibleTasks.length && <div className="border-t border-[#e5e1db] px-5 py-10 text-center text-xs text-[#77736e]">현재 확인할 예정 업무가 없습니다.</div>}<div className="border-t border-[#e5e1db] bg-[#faf9f7] px-4 py-3 text-[10px] text-[#77736e]">완료 체크는 현재 목업 화면에서만 반영됩니다. 실제 저장과 원본 상태 변경은 하지 않습니다.</div></section>;
}
