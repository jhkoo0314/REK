"use client";

import { updateTaskConsultation, updateTaskContractDate } from "@/features/tasks/server/task-quick-actions";
import type { TodayTask } from "@/features/tasks/server/task-queries";
import { useRouter } from "next/navigation";
import { useState } from "react";

const contractFieldLabels = { official_contract_date: "정식 계약일", additional_deposit_due_date: "추가 수령 예정일", balance_due_date: "잔금 예정일", end_date: "임대차 종료일" } as const;

export function TaskQuickAction({ task }: { task: TodayTask }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [date, setDate] = useState(task.dueDate); const [status, setStatus] = useState(task.consultationStatus ?? "in_progress"); const [saving, setSaving] = useState(false); const [message, setMessage] = useState("");
  if (!task.quickField) return null;
  async function save() {
    setSaving(true); setMessage("");
    const result = task.category === "상담"
      ? await updateTaskConsultation({ consultationId: task.sourceId, nextContactDate: date, status: status as "in_progress" | "on_hold" | "needs_confirmation" })
      : await updateTaskContractDate({ contractId: task.sourceId, field: task.quickField as keyof typeof contractFieldLabels, date });
    setSaving(false); if (!result.ok) { setMessage(result.message); return; } setOpen(false); router.refresh();
  }
  const isConsultation = task.category === "상담";
  return <><button type="button" onClick={() => setOpen(true)} className="rounded-md border border-[#d8d0c7] px-2 py-1 text-[10px] font-bold text-[#655f59]">빠른 처리</button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-[#2d2926]/35 p-4"><section className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"><h2 className="text-base font-extrabold">{isConsultation ? "상담 빠른 처리" : "계약 일정 변경"}</h2><p className="mt-1 text-xs text-[#7b7470]">{isConsultation ? "다음 연락일과 가벼운 상담 상태만 바꿉니다. 상담 종료는 상세 화면에서 처리합니다." : "일정 날짜만 바꿉니다. 계약 단계 변경은 상세 화면에서 처리합니다."}</p><div className="mt-5 grid gap-4">{isConsultation && <label><span className="label">상담 상태</span><select className="field" value={status} onChange={(event) => setStatus(event.target.value as "in_progress" | "on_hold" | "needs_confirmation")}><option value="in_progress">진행 중</option><option value="on_hold">보류</option><option value="needs_confirmation">확인 필요</option></select></label>}<label><span className="label">{isConsultation ? "다음 연락일" : contractFieldLabels[task.quickField as keyof typeof contractFieldLabels]}</span><input className="field" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div>{message && <p className="mt-3 text-xs text-[#b94a42]">{message}</p>}<div className="mt-5 flex justify-end gap-2"><button type="button" className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => setOpen(false)}>취소</button><button type="button" disabled={saving} className="rounded-lg bg-[#3e3a37] px-3 py-2 text-xs font-bold text-white" onClick={save}>{saving ? "저장 중…" : "저장"}</button></div></section></div>}</>;
}
