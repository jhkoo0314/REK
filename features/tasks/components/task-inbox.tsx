"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { toggleTaskCompletion } from "@/features/tasks/server/task-completions";
import type { TodayTask } from "@/features/tasks/server/task-queries";
import { TaskQuickAction } from "@/features/tasks/components/task-quick-action";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const tone = { 상담: "planned", 계약: "neutral", 퇴실: "notice" } as const;

function TaskRows({ tasks, pending, onToggle }: { tasks: TodayTask[]; pending: boolean; onToggle: (task: TodayTask) => void }) {
  if (!tasks.length) return <p className="px-3 py-8 text-center text-xs text-[#7b7470]">확인할 업무가 없습니다.</p>;
  return <div className="p-2">{tasks.map((task) => <div className={`flex items-start gap-2 rounded-lg p-3 hover:bg-[#fdf8f5] ${task.completed ? "opacity-60" : ""}`} key={task.id}><button type="button" aria-label={`${task.title} 완료`} disabled={pending} onClick={() => onToggle(task)} className="mt-1 h-4 w-4 shrink-0 rounded border border-[#c9bfb8] text-[#8d5b43]">{task.completed ? "✓" : ""}</button><Link href={task.href} className="min-w-0 flex-1"><div className="flex gap-2"><StatusBadge tone={tone[task.category]}>{task.category}</StatusBadge><span className="ml-auto font-mono text-[11px]">{task.dueDate}</span></div><b className="mt-2 block text-sm">{task.title}</b>{task.customerPhone && <p className="mt-1 text-xs font-bold text-[#514b45]">{task.customerPhone}</p>}<p className="mt-1 text-xs text-[#7b7470]">{task.detail}</p></Link><TaskQuickAction task={task} /></div>)}</div>;
}

function TaskPanel({ title, tasks, pending, onToggle, toneName }: { title: string; tasks: TodayTask[]; pending: boolean; onToggle: (task: TodayTask) => void; toneName: "overdue" | "today" | "week" }) {
  const colors = { overdue: "border-[#f0c8c4] bg-[#fff5f3] text-[#b94a42]", today: "border-[#e8e1db] bg-[#fff8ec] text-[#a46d26]", week: "border-[#e8e1db] bg-[#f6f8fb] text-[#52677c]" };
  const [showAll, setShowAll] = useState(false);
  const visibleTasks = showAll ? tasks : tasks.slice(0, 4);
  const moreCount = tasks.length - visibleTasks.length;
  return <section className="overflow-hidden rounded-xl border border-[#e8e1db] bg-white">
    <header className={`flex w-full items-center justify-between px-4 py-3 text-left ${colors[toneName]}`}>
      <span><b>{title}</b><span className="ml-2 font-mono text-xs">{tasks.length}건</span></span>
    </header>
    <div className="border-t border-[#e8e1db]"><TaskRows tasks={visibleTasks} pending={pending} onToggle={onToggle} />{tasks.length > 4 && <div className="border-t border-[#eee7e1] px-3 py-2 text-center"><button type="button" onClick={() => setShowAll((value) => !value)} className="text-xs font-bold text-[#8d5b43] underline">{showAll ? "간단히 보기" : `${moreCount}건 더 보기`}</button></div>}</div>
  </section>;
}

export function TaskInbox({ tasks, referenceDate }: { tasks: TodayTask[]; referenceDate: string }) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams(); const [pending, startTransition] = useTransition(); const [showCompleted, setShowCompleted] = useState(false);
  const visible = (group: TodayTask["group"]) => tasks.filter((task) => task.group === group && (showCompleted || !task.completed));
  const overdue = visible("지연"); const today = visible("오늘"); const thisWeek = visible("이번 주");
  function changeDate(value: string) { const next = new URLSearchParams(params.toString()); if (value) next.set("date", value); else next.delete("date"); router.replace(`${pathname}?${next.toString()}`); }
  function toggle(task: TodayTask) { startTransition(async () => { const result = await toggleTaskCompletion(task.id, !task.completed); if (!result.ok) window.alert(result.message); else router.refresh(); }); }
  return <section><div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[#e8e1db] bg-white px-5 py-4"><div><b className="text-sm">중요 업무 {tasks.filter((task) => !task.completed).length}건</b><p className="mt-1 text-xs text-[#7b7470]">일정 묶음별로 최대 4건을 먼저 표시하며, 더 많은 업무는 더 보기로 확인합니다.</p></div><div className="flex items-end gap-4"><button type="button" className="text-xs underline" onClick={() => setShowCompleted((value) => !value)}>{showCompleted ? "완료 업무 숨기기" : `완료 업무 보기 (${tasks.filter((task) => task.completed).length})`}</button><label><span className="label">기준일</span><input className="field mt-0" type="date" value={referenceDate} onChange={(e) => changeDate(e.target.value)} /></label></div></div><div className="grid gap-4 xl:grid-cols-3"><TaskPanel title="지연 업무" tasks={overdue} pending={pending} onToggle={toggle} toneName="overdue" /><TaskPanel title="오늘 업무" tasks={today} pending={pending} onToggle={toggle} toneName="today" /><TaskPanel title="이번 주 업무" tasks={thisWeek} pending={pending} onToggle={toggle} toneName="week" /></div></section>;
}
