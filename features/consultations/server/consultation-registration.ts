"use server";

import { consultationCreateSchema, type ConsultationCreateInput } from "@/features/consultations/schemas/consultation-create";
import { consultationFollowupDeleteSchema, consultationFollowupSchema, consultationFollowupUpdateSchema, type ConsultationFollowupInput, type ConsultationFollowupUpdateInput } from "@/features/consultations/schemas/consultation-followup";
import { consultationDeleteSchema, consultationInitialListingSchema, consultationUpdateSchema, type ConsultationUpdateInput } from "@/features/consultations/schemas/consultation-edit";
import { getOrganizationContext } from "@/lib/auth/organization-context";
import { getSensitiveAccess } from "@/lib/auth/sensitive-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ConsultationListingOption = { id: string; label: string };
export type ConsultationRegistrationOptions = { context: Awaited<ReturnType<typeof getOrganizationContext>>; listings: ConsultationListingOption[] };
export type ConsultationRegistrationResult = { ok: true; consultationId: string } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
export type ConsultationFollowupResult = { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function consultationSaveErrorMessage(error: { code?: string; message?: string } | null) {
  const message = error?.message ?? "";
  if (error?.code === "23502" && message.includes("customer_name")) return "고객 이름을 비워 저장하려면 20260826001200 migration을 먼저 적용해 주세요.";
  if (error?.code === "42703" && message.includes("consultation_reference_number")) return "상담번호를 추가하는 20260826001400 migration을 먼저 적용해 주세요.";
  if (error?.code === "23505" && message.includes("reference_number")) return "상담번호가 중복되었습니다. 20260826001400 migration 파일 전체를 다시 실행해 번호 순서를 정리해 주세요.";
  if (error?.code === "42P01") return "상담 테이블이 없습니다. 20260826001100 migration 적용 여부를 확인해 주세요.";
  if (error?.code || message) return `상담 저장 오류 (${error?.code ?? "원인 코드 없음"}): ${message || "DB가 상세 내용을 반환하지 않았습니다."}`;
  return "상담을 저장하지 못했습니다. Dev DB의 P1 상담 migration 적용 상태를 확인해 주세요.";
}
export type StoredConsultationDetail = {
  id: string; customerName: string; customerPhone: string; category: "general" | "listing"; consultationDate: string; inflowSource: string; consultationMethod: string; consultationNote: string | null;
  desiredAreas: string[]; desiredAreasOther: string | null; desiredRoomTypes: string[]; desiredRoomTypesOther: string | null; desiredDepositBudget: number | null; desiredMonthlyRentBudget: number | null; desiredMoveInDate: string | null; requiredFeaturesNote: string | null;
  status: string; progressStage: string; nextContactDate: string | null; closedReason: string | null; initialListingId: string | null; initialListingLabel: string | null;
  followups: StoredConsultationFollowup[];
};
export type StoredConsultationFollowup = { id: string; followupDate: string; followupMethod: string; progressStage: string | null; visitResult: string | null; closedReason: string | null; nextContactDate: string | null; note: string | null };
export type ConsultationListItem = {
  id: string; referenceNumber: number | null; customerName: string; customerPhone: string; category: "general" | "listing"; inflowSource: string; consultationDate: string; status: string; progressStage: string; nextContactDate: string | null; closedReason: string | null; initialListingLabel: string | null; latestFollowupDate: string | null; latestFollowupMethod: string | null;
  desiredAreas: string[]; desiredAreasOther: string | null; desiredRoomTypes: string[]; desiredRoomTypesOther: string | null; desiredDepositBudget: number | null; desiredMonthlyRentBudget: number | null;
};

export async function getConsultationRegistrationOptions(): Promise<ConsultationRegistrationOptions> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, listings: [] };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, listing_reference_number, property_type, deposit_amount, monthly_rent_amount, units!inner(unit_number, buildings!inner(name))")
    .eq("organization_id", context.organizationId)
    .eq("is_current", true)
    .order("listing_reference_number", { ascending: false });
  if (error) throw new Error("상담에 연결할 매물 목록을 불러오지 못했습니다.");

  return {
    context,
    listings: (data ?? []).map((listing) => {
      const unit = Array.isArray(listing.units) ? listing.units[0] : listing.units;
      const building = unit && !Array.isArray(unit.buildings) ? unit.buildings : Array.isArray(unit?.buildings) ? unit.buildings[0] : null;
      const reference = String(listing.listing_reference_number ?? "").padStart(6, "0");
      return { id: listing.id, label: `M-${reference} · ${building?.name ?? "건물"} ${unit?.unit_number ?? "호실"} · ${listing.deposit_amount ?? "-"} / ${listing.monthly_rent_amount ?? "-"}` };
    }),
  };
}

export async function getStoredConsultationDetail(consultationId: string): Promise<{ context: Awaited<ReturnType<typeof getOrganizationContext>>; consultation: StoredConsultationDetail | null }> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, consultation: null };
  const sensitiveAccess = await getSensitiveAccess(context);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("consultations").select("id, customer_name, customer_phone, category, consultation_date, inflow_source, consultation_method, consultation_note, desired_areas, desired_areas_other, desired_room_types, desired_room_types_other, desired_deposit_budget, desired_monthly_rent_budget, desired_move_in_date, required_features_note, status, progress_stage, next_contact_date, closed_reason, initial_listing_id").eq("id", consultationId).eq("organization_id", context.organizationId).maybeSingle();
  if (error || !data) return { context, consultation: null };
  let initialListingLabel: string | null = null;
  if (data.initial_listing_id) {
    const { data: listing } = await supabase.from("listings").select("listing_reference_number, units!inner(unit_number, buildings!inner(name))").eq("id", data.initial_listing_id).eq("organization_id", context.organizationId).maybeSingle();
    if (listing) {
      const unit = Array.isArray(listing.units) ? listing.units[0] : listing.units;
      const building = unit && !Array.isArray(unit.buildings) ? unit.buildings : Array.isArray(unit?.buildings) ? unit.buildings[0] : null;
      initialListingLabel = `M-${String(listing.listing_reference_number ?? "").padStart(6, "0")} · ${building?.name ?? "건물"} ${unit?.unit_number ?? "호실"}`;
    }
  }
  const { data: followups, error: followupError } = await supabase.from("consultation_followups").select("id, followup_date, followup_method, progress_stage, visit_result, closed_reason, next_contact_date, note").eq("consultation_id", data.id).eq("organization_id", context.organizationId).order("followup_date", { ascending: false }).order("created_at", { ascending: false });
  if (followupError) throw new Error("상담 후속 이력을 불러오지 못했습니다.");
  return { context, consultation: {
    id: data.id, customerName: data.customer_name ?? "이름 미입력", customerPhone: sensitiveAccess.consultationContacts ? data.customer_phone : "", category: data.category, consultationDate: data.consultation_date, inflowSource: data.inflow_source, consultationMethod: data.consultation_method, consultationNote: data.consultation_note,
    desiredAreas: data.desired_areas ?? [], desiredAreasOther: data.desired_areas_other, desiredRoomTypes: data.desired_room_types ?? [], desiredRoomTypesOther: data.desired_room_types_other, desiredDepositBudget: data.desired_deposit_budget, desiredMonthlyRentBudget: data.desired_monthly_rent_budget, desiredMoveInDate: data.desired_move_in_date, requiredFeaturesNote: data.required_features_note,
    status: data.status, progressStage: data.progress_stage, nextContactDate: data.next_contact_date, closedReason: data.closed_reason, initialListingId: data.initial_listing_id, initialListingLabel,
    followups: (followups ?? []).map((item) => ({ id: item.id, followupDate: item.followup_date, followupMethod: item.followup_method, progressStage: item.progress_stage, visitResult: item.visit_result, closedReason: item.closed_reason, nextContactDate: item.next_contact_date, note: item.note })),
  } };
}

export async function getConsultationList(): Promise<{ context: Awaited<ReturnType<typeof getOrganizationContext>>; consultations: ConsultationListItem[] }> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, consultations: [] };
  const sensitiveAccess = await getSensitiveAccess(context);
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("consultations").select("id, consultation_reference_number, initial_listing_id, customer_name, customer_phone, category, inflow_source, consultation_date, status, progress_stage, next_contact_date, closed_reason, latest_followup_date, latest_followup_method, desired_areas, desired_areas_other, desired_room_types, desired_room_types_other, desired_deposit_budget, desired_monthly_rent_budget").eq("organization_id", context.organizationId).order("consultation_date", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw new Error("상담 목록을 불러오지 못했습니다. Dev DB의 P1 상담 migration 적용 상태를 확인해 주세요.");
  const listingIds = (data ?? []).map((item) => item.initial_listing_id).filter((item): item is string => Boolean(item));
  const { data: initialListings, error: listingError } = listingIds.length === 0 ? { data: [], error: null } : await supabase.from("listings").select("id, listing_reference_number, units!inner(unit_number, buildings!inner(name))").eq("organization_id", context.organizationId).in("id", listingIds);
  if (listingError) throw new Error("연결된 최초 문의 매물 정보를 불러오지 못했습니다.");
  const listingLabelById = new Map((initialListings ?? []).map((listing) => {
    const unit = Array.isArray(listing.units) ? listing.units[0] : listing.units;
    const building = unit && !Array.isArray(unit.buildings) ? unit.buildings : Array.isArray(unit?.buildings) ? unit.buildings[0] : null;
    return [listing.id, `M-${String(listing.listing_reference_number ?? "").padStart(6, "0")} · ${building?.name ?? "건물"} ${unit?.unit_number ?? "호실"}`];
  }));
  return { context, consultations: (data ?? []).map((item) => ({
    id: item.id, referenceNumber: item.consultation_reference_number, customerName: item.customer_name ?? "이름 미입력", customerPhone: sensitiveAccess.consultationContacts ? item.customer_phone : "", category: item.category, inflowSource: item.inflow_source, consultationDate: item.consultation_date, status: item.status, progressStage: item.progress_stage, nextContactDate: item.next_contact_date, closedReason: item.closed_reason, initialListingLabel: item.initial_listing_id ? listingLabelById.get(item.initial_listing_id) ?? "연결 매물 확인 필요" : null, latestFollowupDate: item.latest_followup_date, latestFollowupMethod: item.latest_followup_method,
    desiredAreas: item.desired_areas ?? [], desiredAreasOther: item.desired_areas_other, desiredRoomTypes: item.desired_room_types ?? [], desiredRoomTypesOther: item.desired_room_types_other, desiredDepositBudget: item.desired_deposit_budget, desiredMonthlyRentBudget: item.desired_monthly_rent_budget,
  })) };
}

export async function createConsultation(values: ConsultationCreateInput): Promise<ConsultationRegistrationResult> {
  const parsed = consultationCreateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "입력한 상담 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };

  const value = parsed.data;
  const supabase = createSupabaseServerClient();
  if (value.initialListingId) {
    const { data: listing, error: listingError } = await supabase.from("listings").select("id").eq("id", value.initialListingId).eq("organization_id", context.organizationId).eq("is_current", true).maybeSingle();
    if (listingError || !listing) return { ok: false, message: "선택한 최초 문의 매물을 찾을 수 없습니다. 다시 선택해 주세요.", fieldErrors: { initialListingId: ["현재 조직의 관리 중 매물만 연결할 수 있습니다."] } };
  }

  const { data, error } = await supabase.from("consultations").insert({
    organization_id: context.organizationId,
    initial_listing_id: value.initialListingId || null,
    category: value.category,
    customer_name: value.customerName,
    customer_phone: value.customerPhone,
    consultation_date: value.consultationDate,
    inflow_source: value.inflowSource,
    consultation_method: value.consultationMethod,
    consultation_note: value.consultationNote || null,
    desired_areas: value.desiredAreas,
    desired_areas_other: value.desiredAreasOther || null,
    desired_room_types: value.desiredRoomTypes,
    desired_room_types_other: value.desiredRoomTypesOther || null,
    desired_deposit_budget: value.desiredDepositBudget ? Number(value.desiredDepositBudget) : null,
    desired_monthly_rent_budget: value.desiredMonthlyRentBudget ? Number(value.desiredMonthlyRentBudget) : null,
    desired_move_in_date: value.desiredMoveInDate || null,
    required_features_note: value.requiredFeaturesNote || null,
    status: value.status,
    progress_stage: value.progressStage,
    scheduled_next_contact_date: value.status === "ended" ? null : value.nextContactDate || null,
    next_contact_date: value.status === "ended" ? null : value.nextContactDate || null,
    closed_reason: value.status === "ended" ? value.closedReason : null,
    created_by_clerk_user_id: context.clerkUserId,
    updated_by_clerk_user_id: context.clerkUserId,
  }).select("id").single();
  if (error || !data) return { ok: false, message: consultationSaveErrorMessage(error) };

  revalidatePath("/consultations");
  revalidatePath("/dashboard");
  return { ok: true, consultationId: data.id };
}

async function getConsultationForFollowup(consultationId: string) {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, supabase: null, consultation: null };
  const supabase = createSupabaseServerClient();
  const { data: consultation, error } = await supabase
    .from("consultations")
    .select("id, status")
    .eq("id", consultationId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  if (error || !consultation) return { context, supabase, consultation: null };
  return { context, supabase, consultation };
}

function followupPayload(values: ConsultationFollowupInput | ConsultationFollowupUpdateInput, organizationId: string, clerkUserId: string) {
  return {
    organization_id: organizationId,
    consultation_id: values.consultationId,
    followup_date: values.followupDate,
    followup_method: values.followupMethod,
    progress_stage: values.progressStage ?? null,
    visit_result: values.visitResult || null,
    closed_reason: values.closedReason || null,
    next_contact_date: values.progressStage === "closed" ? null : values.nextContactDate || null,
    note: values.note || null,
    updated_by_clerk_user_id: clerkUserId,
  };
}

async function closeConsultationFromFollowup({ consultationId, organizationId, clerkUserId, closedReason, supabase }: { consultationId: string; organizationId: string; clerkUserId: string; closedReason: string; supabase: ReturnType<typeof createSupabaseServerClient> }) {
  const { error } = await supabase.from("consultations").update({ status: "ended", progress_stage: "closed", closed_reason: closedReason, scheduled_next_contact_date: null, next_contact_date: null, updated_by_clerk_user_id: clerkUserId }).eq("id", consultationId).eq("organization_id", organizationId);
  return !error;
}

export async function createConsultationFollowup(values: ConsultationFollowupInput): Promise<ConsultationFollowupResult> {
  const parsed = consultationFollowupSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "후속 이력 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const value = parsed.data;
  const { context, supabase, consultation } = await getConsultationForFollowup(value.consultationId);
  if (context.kind !== "ready" || !supabase) return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  if (!consultation) return { ok: false, message: "후속 이력을 추가할 상담을 찾을 수 없습니다." };
  if (consultation.status === "ended") return { ok: false, message: "종료된 상담에는 후속 이력을 추가할 수 없습니다." };
  const { error } = await supabase.from("consultation_followups").insert({ ...followupPayload(value, context.organizationId, context.clerkUserId), created_by_clerk_user_id: context.clerkUserId });
  if (error) return { ok: false, message: "후속 이력을 저장하지 못했습니다. Dev DB의 P1 상담 migration을 확인해 주세요." };
  if (value.progressStage === "closed" && !await closeConsultationFromFollowup({ consultationId: value.consultationId, organizationId: context.organizationId, clerkUserId: context.clerkUserId, closedReason: value.closedReason, supabase })) return { ok: false, message: "후속 이력은 저장됐지만 상담 종료 상태를 반영하지 못했습니다. 다시 열어 확인해 주세요." };
  revalidatePath("/consultations"); revalidatePath(`/consultations/${value.consultationId}`); revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateConsultationFollowup(values: ConsultationFollowupUpdateInput): Promise<ConsultationFollowupResult> {
  const parsed = consultationFollowupUpdateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "후속 이력 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const value = parsed.data;
  const { context, supabase, consultation } = await getConsultationForFollowup(value.consultationId);
  if (context.kind !== "ready" || !supabase) return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  if (!consultation) return { ok: false, message: "수정할 후속 이력의 상담을 찾을 수 없습니다." };
  const { data, error } = await supabase.from("consultation_followups").update(followupPayload(value, context.organizationId, context.clerkUserId)).eq("id", value.id).eq("consultation_id", value.consultationId).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "후속 이력을 수정하지 못했습니다." };
  if (value.progressStage === "closed" && consultation.status !== "ended" && !await closeConsultationFromFollowup({ consultationId: value.consultationId, organizationId: context.organizationId, clerkUserId: context.clerkUserId, closedReason: value.closedReason, supabase })) return { ok: false, message: "후속 이력은 수정됐지만 상담 종료 상태를 반영하지 못했습니다. 다시 열어 확인해 주세요." };
  revalidatePath("/consultations"); revalidatePath(`/consultations/${value.consultationId}`); revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteConsultationFollowup(values: { id: string; consultationId: string }): Promise<ConsultationFollowupResult> {
  const parsed = consultationFollowupDeleteSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "삭제할 후속 이력을 확인해 주세요." };
  const { context, supabase, consultation } = await getConsultationForFollowup(parsed.data.consultationId);
  if (context.kind !== "ready" || !supabase) return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  if (!consultation) return { ok: false, message: "삭제할 후속 이력의 상담을 찾을 수 없습니다." };
  const { data, error } = await supabase.from("consultation_followups").delete().eq("id", parsed.data.id).eq("consultation_id", parsed.data.consultationId).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "후속 이력을 삭제하지 못했습니다." };
  revalidatePath("/consultations"); revalidatePath(`/consultations/${parsed.data.consultationId}`); revalidatePath("/dashboard");
  return { ok: true };
}

function consultationPayload(value: ConsultationUpdateInput, organizationId: string, clerkUserId: string) {
  return { category: value.category, initial_listing_id: value.initialListingId || null, customer_name: value.customerName || null, customer_phone: value.customerPhone, consultation_date: value.consultationDate, inflow_source: value.inflowSource, consultation_method: value.consultationMethod, consultation_note: value.consultationNote || null, desired_areas: value.desiredAreas, desired_areas_other: value.desiredAreasOther || null, desired_room_types: value.desiredRoomTypes, desired_room_types_other: value.desiredRoomTypesOther || null, desired_deposit_budget: value.desiredDepositBudget ? Number(value.desiredDepositBudget) : null, desired_monthly_rent_budget: value.desiredMonthlyRentBudget ? Number(value.desiredMonthlyRentBudget) : null, desired_move_in_date: value.desiredMoveInDate || null, required_features_note: value.requiredFeaturesNote || null, status: value.status, progress_stage: value.progressStage, scheduled_next_contact_date: value.status === "ended" ? null : value.nextContactDate || null, next_contact_date: value.status === "ended" ? null : value.nextContactDate || null, closed_reason: value.status === "ended" ? value.closedReason : null, updated_by_clerk_user_id: clerkUserId, organization_id: organizationId };
}

export async function updateConsultation(values: ConsultationUpdateInput): Promise<ConsultationFollowupResult> {
  const parsed = consultationUpdateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "상담 기본 정보를 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const value = parsed.data;
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  if (value.initialListingId) {
    const { data: listing } = await supabase.from("listings").select("id").eq("id", value.initialListingId).eq("organization_id", context.organizationId).eq("is_current", true).maybeSingle();
    if (!listing) return { ok: false, message: "선택한 최초 문의 매물을 찾을 수 없습니다.", fieldErrors: { initialListingId: ["현재 조직의 관리 중 매물만 연결할 수 있습니다."] } };
  }
  const { data, error } = await supabase.from("consultations").update(consultationPayload(value, context.organizationId, context.clerkUserId)).eq("id", value.id).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "상담 기본 정보를 저장하지 못했습니다." };
  revalidatePath("/consultations"); revalidatePath(`/consultations/${value.id}`); revalidatePath("/dashboard");
  return { ok: true };
}

export async function connectConsultationInitialListing(values: { consultationId: string; listingId: string }): Promise<ConsultationFollowupResult> {
  const parsed = consultationInitialListingSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "연결할 상담과 매물을 확인해 주세요." };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const { data: listing } = await supabase.from("listings").select("id").eq("id", parsed.data.listingId).eq("organization_id", context.organizationId).eq("is_current", true).maybeSingle();
  if (!listing) return { ok: false, message: "현재 조직의 관리 중 매물만 연결할 수 있습니다." };
  const { data, error } = await supabase.from("consultations").update({ category: "listing", initial_listing_id: parsed.data.listingId, updated_by_clerk_user_id: context.clerkUserId }).eq("id", parsed.data.consultationId).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "최초 문의 매물을 연결하지 못했습니다." };
  revalidatePath("/consultations"); revalidatePath(`/consultations/${parsed.data.consultationId}`);
  return { ok: true };
}


export async function deleteConsultation(consultationId: string): Promise<ConsultationFollowupResult> {
  const parsed = consultationDeleteSchema.safeParse({ id: consultationId });
  if (!parsed.success) return { ok: false, message: "삭제할 상담을 확인해 주세요." };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("consultations").delete().eq("id", parsed.data.id).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "상담을 삭제하지 못했습니다." };
  revalidatePath("/consultations"); revalidatePath("/dashboard");
  return { ok: true };
}
