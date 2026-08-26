"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { createConsultationFollowup, deleteConsultationFollowup, updateConsultationFollowup, type StoredConsultationFollowup } from "@/features/consultations/server/consultation-registration";
import { consultationFollowupSchema, type ConsultationFollowupInput } from "@/features/consultations/schemas/consultation-followup";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const methodLabel: Record<string, string> = { phone: "전화", message: "문자", visit: "방문", other: "기타" };
const stageLabel: Record<string, string> = { new_inquiry: "신규 문의", condition_check: "조건 확인", visit_scheduled: "방문 예정", visit_completed: "방문 완료", reviewing: "검토 중", closed: "종료" };
const defaults = (consultationId: string): ConsultationFollowupInput => ({ consultationId, followupDate: new Date().toISOString().slice(0, 10), followupMethod: "phone", progressStage: "condition_check", visitResult: "", closedReason: "", nextContactDate: "", note: "" });

export function ConsultationFollowupTimeline({ consultationId, isClosed, followups }: { consultationId: string; isClosed: boolean; followups: StoredConsultationFollowup[] }) {
  const [editing, setEditing] = useState<StoredConsultationFollowup | null>(null);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  async function remove(item: StoredConsultationFollowup) {
    if (!window.confirm(`${item.followupDate} 후속 이력을 삭제할까요? 삭제 후 마지막 이력과 다음 연락일은 다시 계산됩니다.`)) return;
    const result = await deleteConsultationFollowup({ id: item.id, consultationId });
    if (!result.ok) { window.alert(result.message); return; }
    router.refresh();
  }

  return <section className="border-t border-[#e5e1db] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">후속 이력</h3><p className="mt-1 text-xs text-[#77736e]">통화·문자·방문 내용을 누적합니다. 가장 최근 이력이 다음 연락일 요약에 반영됩니다.</p></div>{!isClosed && <button className="rounded-lg bg-[#3e3a37] px-3 py-2 text-xs font-bold text-white" onClick={() => { setEditing(null); setAdding(true); }} type="button">＋ 이력 추가</button>}</div>{isClosed && <p className="mt-3 rounded-lg bg-[#faf9f7] px-3 py-2 text-xs text-[#77736e]">종료된 상담은 새 후속 이력을 추가할 수 없습니다.</p>}{adding && <FollowupForm consultationId={consultationId} onCancel={() => setAdding(false)} onSaved={() => { setAdding(false); router.refresh(); }} />}{editing && <FollowupForm consultationId={consultationId} item={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); router.refresh(); }} />}{followups.length === 0 ? <p className="mt-5 rounded-lg bg-[#faf9f7] px-4 py-5 text-center text-xs text-[#77736e]">아직 등록한 후속 이력이 없습니다.</p> : <div className="mt-5 space-y-3 border-l border-[#e5e1db] pl-4">{followups.map((item) => <article className="relative rounded-lg border border-[#e5e1db] bg-white p-4" key={item.id}><span className="absolute -left-[21px] top-5 h-3 w-3 rounded-full border-2 border-white bg-[#8b8279]" /><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><b className="text-sm">{item.followupDate} · {methodLabel[item.followupMethod] ?? item.followupMethod}</b>{item.progressStage && <StatusBadge tone={item.progressStage === "closed" ? "neutral" : "planned"}>{stageLabel[item.progressStage] ?? item.progressStage}</StatusBadge>}</div>{item.note && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#514b45]">{item.note}</p>}{item.visitResult && <p className="mt-2 text-xs text-[#655f59]">방문 결과: {item.visitResult}</p>}{item.closedReason && <p className="mt-1 text-xs text-[#655f59]">종료 사유: {item.closedReason}</p>}{item.nextContactDate && <p className="mt-2 font-mono text-[11px] text-[#77736e]">다음 연락 {item.nextContactDate}</p>}</div><div className="flex gap-2"><button className="text-xs font-bold text-[#655f59] underline underline-offset-4" onClick={() => { setAdding(false); setEditing(item); }} type="button">수정</button><button className="text-xs font-bold text-[#a85f43] underline underline-offset-4" onClick={() => remove(item)} type="button">삭제</button></div></div></article>)}</div>}</section>;
}

function FollowupForm({ consultationId, item, onCancel, onSaved }: { consultationId: string; item?: StoredConsultationFollowup; onCancel: () => void; onSaved: () => void }) {
  const form = useForm<ConsultationFollowupInput>({ resolver: zodResolver(consultationFollowupSchema), defaultValues: item ? { consultationId, followupDate: item.followupDate, followupMethod: item.followupMethod as ConsultationFollowupInput["followupMethod"], progressStage: item.progressStage as ConsultationFollowupInput["progressStage"], visitResult: item.visitResult ?? "", closedReason: item.closedReason ?? "", nextContactDate: item.nextContactDate ?? "", note: item.note ?? "" } : defaults(consultationId) });
  const stage = useWatch({ control: form.control, name: "progressStage" });
  useEffect(() => { if (stage === "closed") form.setValue("nextContactDate", ""); }, [form, stage]);
  async function submit(values: ConsultationFollowupInput) {
    const result = item ? await updateConsultationFollowup({ ...values, id: item.id }) : await createConsultationFollowup(values);
    if (!result.ok) { Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => form.setError(name as keyof ConsultationFollowupInput, { message: messages[0] })); form.setError("root", { message: result.message }); return; }
    onSaved();
  }
  return <form className="mt-5 rounded-xl border border-[#d7cabe] bg-[#fffdf9] p-4" onSubmit={form.handleSubmit(submit)}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><Field label="이력일" error={form.formState.errors.followupDate?.message}><input className="field" type="date" {...form.register("followupDate")} /></Field><Field label="방식"><select className="field" {...form.register("followupMethod")}><option value="phone">전화</option><option value="message">문자</option><option value="visit">방문</option><option value="other">기타</option></select></Field><Field label="진행 단계"><select className="field" {...form.register("progressStage")}><option value="new_inquiry">신규 문의</option><option value="condition_check">조건 확인</option><option value="visit_scheduled">방문 예정</option><option value="visit_completed">방문 완료</option><option value="reviewing">검토 중</option><option value="closed">종료</option></select></Field><Field label="방문 결과"><input className="field" placeholder="방문인 경우 입력" {...form.register("visitResult")} /></Field>{stage === "closed" ? <Field label="종료 사유" error={form.formState.errors.closedReason?.message}><input className="field" placeholder="예: 조건 불일치" {...form.register("closedReason")} /></Field> : <Field label="다음 연락일" error={form.formState.errors.nextContactDate?.message}><input className="field" type="date" {...form.register("nextContactDate")} /></Field>}<label className="md:col-span-2 xl:col-span-3"><span className="label">내용</span><textarea className="field min-h-24 resize-y" placeholder="안내한 내용, 고객 반응, 다음에 확인할 사항을 기록합니다." {...form.register("note")} /></label></div>{form.formState.errors.root?.message && <p role="alert" className="mt-3 text-xs text-[#b94a42]">{form.formState.errors.root.message}</p>}<div className="mt-4 flex justify-end gap-2"><button className="rounded-lg border border-[#e5e1db] px-3 py-2 text-xs font-bold text-[#655f59]" onClick={onCancel} type="button">취소</button><button className="rounded-lg bg-[#3e3a37] px-3 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={form.formState.isSubmitting} type="submit">{form.formState.isSubmitting ? "저장 중…" : item ? "이력 수정" : "이력 저장"}</button></div></form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label><span className="label">{label}</span>{children}{error && <span className="mt-1 block text-xs text-[#b94a42]">{error}</span>}</label>; }
