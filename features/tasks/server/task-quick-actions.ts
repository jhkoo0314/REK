"use server";

import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; message: string };
const consultationStatuses = ["in_progress", "on_hold", "needs_confirmation"] as const;
const contractDateFields = ["official_contract_date", "additional_deposit_due_date", "balance_due_date", "end_date"] as const;

export async function updateTaskConsultation(values: { consultationId: string; nextContactDate: string; status: typeof consultationStatuses[number] }): Promise<Result> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.nextContactDate) || !consultationStatuses.includes(values.status)) return { ok: false, message: "다음 연락일과 상담 상태를 확인해 주세요." };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("consultations").update({ status: values.status, scheduled_next_contact_date: values.nextContactDate, next_contact_date: values.nextContactDate, updated_by_clerk_user_id: context.clerkUserId }).eq("id", values.consultationId).eq("organization_id", context.organizationId).neq("status", "ended").select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "상담의 다음 연락일을 저장하지 못했습니다. 종료된 상담은 상세 화면에서 확인해 주세요." };
  revalidatePath("/consultations"); revalidatePath(`/consultations/${values.consultationId}`); revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTaskContractDate(values: { contractId: string; field: typeof contractDateFields[number]; date: string }): Promise<Result> {
  if (!contractDateFields.includes(values.field) || !/^\d{4}-\d{2}-\d{2}$/.test(values.date)) return { ok: false, message: "변경할 일정 날짜를 확인해 주세요." };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const { data: contract } = await supabase.from("contracts").select("id, contract_started_date, official_contract_date, move_in_date, end_date").eq("id", values.contractId).eq("organization_id", context.organizationId).maybeSingle();
  if (!contract) return { ok: false, message: "수정할 계약을 찾을 수 없습니다." };
  const dates = { contractStartedDate: contract.contract_started_date, officialContractDate: contract.official_contract_date, moveInDate: contract.move_in_date, endDate: contract.end_date, [values.field]: values.date } as Record<string, string | null>;
  if (dates.officialContractDate && dates.contractStartedDate && dates.officialContractDate < dates.contractStartedDate) return { ok: false, message: "정식 계약일은 계약 진행일보다 빠를 수 없습니다." };
  if (dates.moveInDate && dates.officialContractDate && dates.moveInDate < dates.officialContractDate) return { ok: false, message: "입주일은 정식 계약일보다 빠를 수 없습니다." };
  if (dates.endDate && dates.moveInDate && dates.endDate <= dates.moveInDate) return { ok: false, message: "만료일은 입주일보다 뒤여야 합니다." };
  const { error } = await supabase.from("contracts").update({ [values.field]: values.date, updated_by_clerk_user_id: context.clerkUserId }).eq("id", values.contractId).eq("organization_id", context.organizationId);
  if (error) return { ok: false, message: "계약 일정 날짜를 저장하지 못했습니다." };
  revalidatePath("/contracts"); revalidatePath(`/contracts/${values.contractId}`); revalidatePath("/dashboard");
  return { ok: true };
}
