"use server";

import { contractActivitySchema, type ContractActivityInput } from "@/features/contracts/schemas/contract-activity";
import { contractCreateSchema, type ContractCreateInput } from "@/features/contracts/schemas/contract-create";
import { getOrganizationContext } from "@/lib/auth/organization-context";
import { getSensitiveAccess } from "@/lib/auth/sensitive-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ContractOption = { id: string; label: string; searchText?: string; transactionType?: "monthly_rent" | "jeonse" | "sale" | "to_be_confirmed"; isCurrent?: boolean };
export type ContractListItem = { id: string; referenceNumber: number; status: string; listingLabel: string; sourceLabel: string | null; officialContractDate: string | null; moveInDate: string | null; endDate: string | null; balanceDueDate: string | null };
export type ContractSaveResult = { ok: true; contractId: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function labelForListing(item: any) { const unit = Array.isArray(item.units) ? item.units[0] : item.units; const building = Array.isArray(unit?.buildings) ? unit.buildings[0] : unit?.buildings; return `M-${String(item.listing_reference_number).padStart(6, "0")} · ${building?.name ?? "건물"} · ${unit?.unit_number ?? "호실"} · ${item.is_current ? "현재 매물" : "과거 이력"}`; }

export async function getContractRegistrationOptions() {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, listings: [] as ContractOption[], consultations: [] as ContractOption[] };
  const sensitiveAccess = await getSensitiveAccess(context);
  const supabase = createSupabaseServerClient();
  const { data: listings, error: listingError } = await supabase.from("listings").select("id, listing_reference_number, transaction_type, listing_status, is_current, units!inner(unit_number, buildings!inner(name, lot_address, road_address))").eq("organization_id", context.organizationId).order("listing_reference_number", { ascending: false }).limit(200);
  const { data: consultations, error: consultationError } = await supabase.from("consultations").select("id, consultation_reference_number, customer_name, customer_phone").eq("organization_id", context.organizationId).order("consultation_date", { ascending: false });
  if (listingError || consultationError) throw new Error("계약 등록에 필요한 매물 또는 상담 정보를 불러오지 못했습니다. P1 migration 적용 상태를 확인해 주세요.");
  return { context, listings: (listings ?? []).map((item) => { const unit = Array.isArray(item.units) ? item.units[0] : item.units; const building = Array.isArray(unit?.buildings) ? unit?.buildings[0] : unit?.buildings; return { id: item.id, label: labelForListing(item), searchText: `M-${String(item.listing_reference_number).padStart(6, "0")} ${building?.name ?? ""} ${building?.lot_address ?? ""} ${building?.road_address ?? ""} ${unit?.unit_number ?? ""} ${item.listing_status}`, transactionType: item.transaction_type, isCurrent: item.is_current }; }), consultations: (consultations ?? []).map((item) => ({ id: item.id, label: `S-${String(item.consultation_reference_number).padStart(6, "0")} · ${item.customer_name ?? "이름 미입력"}${sensitiveAccess.consultationContacts ? ` · ${item.customer_phone}` : ""}` })) };
}

export async function getContractList() {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, contracts: [] as ContractListItem[] };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("contracts").select("id, contract_reference_number, status, official_contract_date, move_in_date, end_date, balance_due_date, listing_id, source_consultation_id").eq("organization_id", context.organizationId).order("created_at", { ascending: false });
  if (error) throw new Error("계약 목록을 불러오지 못했습니다. 20260826001600 migration을 Dev DB에 적용해 주세요.");
  const listingIds = (data ?? []).map((item) => item.listing_id); const consultationIds = (data ?? []).map((item) => item.source_consultation_id).filter(Boolean);
  const { data: listings } = listingIds.length ? await supabase.from("listings").select("id, listing_reference_number, units!inner(unit_number, buildings!inner(name))").eq("organization_id", context.organizationId).in("id", listingIds) : { data: [] };
  const { data: consultations } = consultationIds.length ? await supabase.from("consultations").select("id, consultation_reference_number, customer_name").eq("organization_id", context.organizationId).in("id", consultationIds) : { data: [] };
  const listingMap = new Map((listings ?? []).map((item) => [item.id, labelForListing(item)])); const consultationMap = new Map((consultations ?? []).map((item) => [item.id, `S-${String(item.consultation_reference_number).padStart(6, "0")} · ${item.customer_name ?? "이름 미입력"}`]));
  return { context, contracts: (data ?? []).map((item) => ({ id: item.id, referenceNumber: item.contract_reference_number, status: item.status, listingLabel: listingMap.get(item.listing_id) ?? "연결 매물 확인 필요", sourceLabel: item.source_consultation_id ? consultationMap.get(item.source_consultation_id) ?? "출처 상담 확인 필요" : null, officialContractDate: item.official_contract_date, moveInDate: item.move_in_date, endDate: item.end_date, balanceDueDate: item.balance_due_date })) };
}

export async function createContract(values: ContractCreateInput): Promise<ContractSaveResult> {
  const parsed = contractCreateSchema.safeParse(values); if (!parsed.success) return { ok: false, message: "계약 입력 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const value = parsed.data; const supabase = createSupabaseServerClient();
  const { data: listing } = await supabase.from("listings").select("id").eq("id", value.listingId).eq("organization_id", context.organizationId).maybeSingle(); if (!listing) return { ok: false, message: "현재 조직의 매물 기록만 실제 계약 매물로 선택할 수 있습니다." };
  if (value.sourceConsultationId) { const { data: consultation } = await supabase.from("consultations").select("id").eq("id", value.sourceConsultationId).eq("organization_id", context.organizationId).maybeSingle(); if (!consultation) return { ok: false, message: "선택한 출처 상담을 찾을 수 없습니다." }; }
  const { data, error } = await supabase.from("contracts").insert({ organization_id: context.organizationId, listing_id: value.listingId, source_consultation_id: value.sourceConsultationId || null, contract_type: value.contractKind === "renewal" ? "renewal" : value.transactionType === "sale" ? "sale" : "rental", transaction_type: value.transactionType, contract_kind: value.contractKind, brokerage_type: value.brokerageType, contract_started_date: value.contractStartedDate || null, official_contract_date: value.officialContractDate || null, move_in_date: value.moveInDate || null, end_date: value.endDate || null, total_contract_deposit_amount: value.totalContractDepositAmount ? Number(value.totalContractDepositAmount) : null, provisional_deposit_amount: value.provisionalDepositAmount ? Number(value.provisionalDepositAmount) : null, additional_deposit_due_date: value.additionalDepositDueDate || null, balance_amount: value.balanceAmount ? Number(value.balanceAmount) : null, balance_due_date: value.balanceDueDate || null, note: value.note || null, created_by_clerk_user_id: context.clerkUserId, updated_by_clerk_user_id: context.clerkUserId }).select("id").single();
  if (error || !data) return { ok: false, message: `계약을 저장하지 못했습니다. (${error?.code ?? "원인 미확인"}) ${error?.message ?? "20260826001600 migration 적용 상태를 확인해 주세요."}` };
  revalidatePath("/contracts"); revalidatePath("/listings"); revalidatePath("/consultations"); return { ok: true, contractId: data.id };
}

export async function createContractActivity(values: ContractActivityInput): Promise<ContractSaveResult> {
  const parsed = contractActivitySchema.safeParse(values); if (!parsed.success) return { ok: false, message: "계약 단계 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." }; const value = parsed.data; const supabase = createSupabaseServerClient();
  const { data: contract } = await supabase.from("contracts").select("id").eq("id", value.contractId).eq("organization_id", context.organizationId).maybeSingle(); if (!contract) return { ok: false, message: "계약을 찾을 수 없습니다." };
  const { error } = await supabase.from("contract_activities").insert({ organization_id: context.organizationId, contract_id: value.contractId, activity_type: value.activityType, activity_date: value.activityDate, note: value.note || null, created_by_clerk_user_id: context.clerkUserId, updated_by_clerk_user_id: context.clerkUserId });
  if (error) return { ok: false, message: "계약 단계를 저장하지 못했습니다." }; revalidatePath("/contracts"); revalidatePath("/listings"); revalidatePath("/consultations"); return { ok: true, contractId: value.contractId };
}

export async function deleteContract(contractId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const { data: contract } = await supabase.from("contracts").select("id, listing_id, status").eq("id", contractId).eq("organization_id", context.organizationId).maybeSingle();
  if (!contract) return { ok: false, message: "삭제할 계약을 찾을 수 없습니다." };
  if (contract.status === "in_progress" || contract.status === "balance_due") {
    const { error: listingError } = await supabase.from("listings").update({ listing_status: "vacant", updated_by_clerk_user_id: context.clerkUserId }).eq("id", contract.listing_id).eq("organization_id", context.organizationId).eq("is_current", true).eq("listing_status", "contract_in_progress");
    if (listingError) return { ok: false, message: "계약 삭제 전 연결 매물을 공실로 되돌리지 못했습니다. 계약은 삭제하지 않았습니다." };
  }
  const { error } = await supabase.from("contracts").delete().eq("id", contractId).eq("organization_id", context.organizationId);
  if (error) return { ok: false, message: "계약을 삭제하지 못했습니다. 연결된 매물·상담은 삭제되지 않았습니다." };
  revalidatePath("/contracts"); revalidatePath("/listings"); revalidatePath("/consultations");
  return { ok: true };
}

export async function updateContractDetails(contractId: string, values: Omit<ContractCreateInput, "listingId" | "sourceConsultationId">): Promise<{ ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string[]> }> {
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient(); const { data: existing } = await supabase.from("contracts").select("listing_id, source_consultation_id").eq("id", contractId).eq("organization_id", context.organizationId).maybeSingle();
  if (!existing) return { ok: false, message: "수정할 계약을 찾을 수 없습니다." };
  const parsed = contractCreateSchema.safeParse({ ...values, listingId: existing.listing_id, sourceConsultationId: existing.source_consultation_id ?? "" }); if (!parsed.success) return { ok: false, message: "수정 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const value = parsed.data; const { error } = await supabase.from("contracts").update({ contract_type: value.contractKind === "renewal" ? "renewal" : value.transactionType === "sale" ? "sale" : "rental", transaction_type: value.transactionType, contract_kind: value.contractKind, brokerage_type: value.brokerageType, contract_started_date: value.contractStartedDate || null, official_contract_date: value.officialContractDate || null, move_in_date: value.moveInDate || null, end_date: value.endDate || null, total_contract_deposit_amount: value.totalContractDepositAmount ? Number(value.totalContractDepositAmount) : null, provisional_deposit_amount: value.provisionalDepositAmount ? Number(value.provisionalDepositAmount) : null, additional_deposit_due_date: value.additionalDepositDueDate || null, balance_amount: value.balanceAmount ? Number(value.balanceAmount) : null, balance_due_date: value.balanceDueDate || null, note: value.note || null, updated_by_clerk_user_id: context.clerkUserId }).eq("id", contractId).eq("organization_id", context.organizationId);
  if (error) return { ok: false, message: "계약 정보를 수정하지 못했습니다." }; revalidatePath("/contracts"); revalidatePath(`/contracts/${contractId}`); return { ok: true };
}
