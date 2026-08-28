"use server";

import { getOrganizationContext } from "@/lib/auth/organization-context";
import { getSensitiveAccess } from "@/lib/auth/sensitive-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeForMatch, normalizeUnitNumber } from "@/lib/text-normalize";
import { listingCreateSchema, type ListingCreateInput } from "@/features/listings/schemas/listing-create";
import { listingUpdateSchema, type ListingUpdateInput } from "@/features/listings/schemas/listing-update";
import { listingQuickUpdateSchema, type ListingQuickUpdateInput } from "@/features/listings/schemas/listing-quick-update";
import { listingRetireSchema, type ListingRetireInput } from "@/features/listings/schemas/listing-retire";
import { revalidatePath } from "next/cache";

type BuildingOption = { id: string; name: string; address: string };
type UnitOption = { id: string; buildingId: string; unitNumber: string; layoutType: string | null };

export type ListingRegistrationOptions = { context: Awaited<ReturnType<typeof getOrganizationContext>>; buildings: BuildingOption[]; units: UnitOption[]; sensitiveAccess: { propertyContacts: boolean; unitAccess: boolean } };

export async function getListingRegistrationOptions(): Promise<ListingRegistrationOptions> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, buildings: [], units: [], sensitiveAccess: { propertyContacts: false, unitAccess: false } };
  const sensitiveAccess = await getSensitiveAccess(context);

  const supabase = createSupabaseServerClient();
  const [{ data: buildings, error: buildingError }, { data: units, error: unitError }] = await Promise.all([
    supabase.from("buildings").select("id, name, road_address, lot_address").eq("organization_id", context.organizationId).order("name"),
    supabase.from("units").select("id, building_id, unit_number, layout_type").eq("organization_id", context.organizationId).order("unit_number"),
  ]);

  if (buildingError || unitError) throw new Error("건물·호실 선택 정보를 불러오지 못했습니다.");
  return {
    context,
    sensitiveAccess: { propertyContacts: sensitiveAccess.propertyContacts, unitAccess: sensitiveAccess.unitAccess },
    buildings: (buildings ?? []).map((building) => ({ id: building.id, name: building.name, address: building.road_address ?? building.lot_address ?? "주소 미입력" })),
    units: (units ?? []).map((unit) => ({ id: unit.id, buildingId: unit.building_id, unitNumber: unit.unit_number, layoutType: unit.layout_type })),
  };
}

function toPayload(values: ListingCreateInput) {
  return {
    buildingId: values.buildingMode === "existing" ? values.buildingId : "",
    buildingName: values.buildingName,
    normalizedBuildingName: normalizeForMatch(values.buildingName),
    roadAddress: "",
    lotAddress: values.lotAddress,
    addressDetail: "",
    postalCode: "",
    normalizedAddress: normalizeForMatch(values.lotAddress),
    unitId: values.unitMode === "existing" ? values.unitId : "",
    unitNumber: values.unitNumber,
    normalizedUnitNumber: normalizeUnitNumber(values.unitNumber),
    floor: values.floor,
    layoutType: values.layoutType,
    direction: values.direction,
    options: values.elevatorOption ? [values.elevatorOption] : [],
    accessPassword: values.accessPassword,
    ownerPhone: values.ownerPhone,
    tenantPhone: values.tenantPhone,
    propertyType: values.propertyType,
    listingStatus: values.listingStatus,
    transactionType: values.transactionType,
    depositAmount: values.depositAmount,
    monthlyRentAmount: values.monthlyRentAmount,
    maintenanceFeeAmount: values.maintenanceFeeAmount,
    availabilityType: values.availabilityType,
    availableDate: values.availabilityType === "date_specified" ? values.availableDate : "",
    moveOutDate: values.moveOutDate,
    photoStatus: values.photoStatus,
    lastConfirmedDate: values.lastConfirmedDate,
    holdingSource: values.holdingSource,
  };
}

export type ListingRegistrationResult = { ok: true; listingReferenceNumber: number } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

async function getBuildingIdForListing(supabase: ReturnType<typeof createSupabaseServerClient>, organizationId: string, listingId: string) {
  const { data, error } = await supabase.from("listings").select("units!inner(building_id)").eq("id", listingId).eq("organization_id", organizationId).maybeSingle();
  if (error || !data) return null;
  const unit = Array.isArray(data.units) ? data.units[0] : data.units;
  return unit?.building_id ?? null;
}

async function saveBuildingOwnerContact({ supabase, organizationId, clerkUserId, buildingId, phone }: { supabase: ReturnType<typeof createSupabaseServerClient>; organizationId: string; clerkUserId: string; buildingId: string; phone: string }) {
  const { data: existing, error: findError } = await supabase.from("building_contacts").select("id").eq("organization_id", organizationId).eq("building_id", buildingId).eq("contact_role", "owner").maybeSingle();
  if (findError) return false;
  if (!phone) {
    if (!existing) return true;
    const { error } = await supabase.from("building_contacts").delete().eq("id", existing.id).eq("organization_id", organizationId);
    return !error;
  }
  if (existing) {
    const { error } = await supabase.from("building_contacts").update({ contact_name: "임대인", phone_number: phone, updated_by_clerk_user_id: clerkUserId }).eq("id", existing.id).eq("organization_id", organizationId);
    return !error;
  }
  const { error } = await supabase.from("building_contacts").insert({ organization_id: organizationId, building_id: buildingId, contact_name: "임대인", phone_number: phone, contact_role: "owner", is_primary: false, created_by_clerk_user_id: clerkUserId, updated_by_clerk_user_id: clerkUserId });
  return !error;
}

async function saveUnitTenantContact({ supabase, organizationId, clerkUserId, unitId, phone }: { supabase: ReturnType<typeof createSupabaseServerClient>; organizationId: string; clerkUserId: string; unitId: string; phone: string }) {
  const { data: existing, error: findError } = await supabase.from("unit_contacts").select("id").eq("organization_id", organizationId).eq("unit_id", unitId).eq("contact_role", "tenant").maybeSingle();
  if (findError) return false;
  if (!phone) {
    if (!existing) return true;
    const { error } = await supabase.from("unit_contacts").delete().eq("id", existing.id).eq("organization_id", organizationId);
    return !error;
  }
  if (existing) {
    const { error } = await supabase.from("unit_contacts").update({ contact_name: "세입자", phone_number: phone, updated_by_clerk_user_id: clerkUserId }).eq("id", existing.id).eq("organization_id", organizationId);
    return !error;
  }
  const { error } = await supabase.from("unit_contacts").insert({ organization_id: organizationId, unit_id: unitId, contact_name: "세입자", phone_number: phone, contact_role: "tenant", created_by_clerk_user_id: clerkUserId, updated_by_clerk_user_id: clerkUserId });
  return !error;
}

export async function createListing(values: ListingCreateInput): Promise<ListingRegistrationResult> {
  const parsed = listingCreateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "입력한 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };

  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const sensitiveAccess = await getSensitiveAccess(context);

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_p0_listing", {
    p_organization_id: context.organizationId,
    p_clerk_user_id: context.clerkUserId,
    p_payload: toPayload({ ...parsed.data, accessPassword: sensitiveAccess.unitAccess ? parsed.data.accessPassword : "", ownerPhone: sensitiveAccess.propertyContacts ? parsed.data.ownerPhone : "", tenantPhone: sensitiveAccess.propertyContacts ? parsed.data.tenantPhone : "" }),
  });

  if (error) {
    const message = error.message.includes("이미 현재 매물") || error.code === "23505"
      ? "같은 호실에 현재 매물이 이미 있습니다. 기존 매물을 수정해 주세요."
      : error.message.includes("create_p0_listing")
        ? "신규 매물 등록 DB 함수를 먼저 Dev에 적용해 주세요."
        : "매물 저장에 실패했습니다. 입력값과 Dev DB 상태를 확인해 주세요.";
    return { ok: false, message };
  }

  const created = Array.isArray(data) ? data[0] : data;
  if (!created?.listing_reference_number) return { ok: false, message: "저장 결과를 확인하지 못했습니다." };
  const buildingId = await getBuildingIdForListing(supabase, context.organizationId, created.listing_id);
  const { data: createdListing } = await supabase.from("listings").select("unit_id").eq("id", created.listing_id).eq("organization_id", context.organizationId).maybeSingle();
  const shouldSaveOwner = parsed.data.buildingMode === "new" || Boolean(parsed.data.ownerPhone);
  const shouldSaveTenant = parsed.data.unitMode === "new" || Boolean(parsed.data.tenantPhone);
  if (!buildingId || !createdListing || (shouldSaveOwner && !await saveBuildingOwnerContact({ supabase, organizationId: context.organizationId, clerkUserId: context.clerkUserId, buildingId, phone: parsed.data.ownerPhone })) || (shouldSaveTenant && !await saveUnitTenantContact({ supabase, organizationId: context.organizationId, clerkUserId: context.clerkUserId, unitId: createdListing.unit_id, phone: parsed.data.tenantPhone }))) return { ok: false, message: "매물은 저장됐지만 제한 연락처를 저장하지 못했습니다. unit_contacts migration을 적용한 뒤 수정 화면에서 다시 저장해 주세요." };
  revalidatePath("/listings");
  return { ok: true, listingReferenceNumber: created.listing_reference_number };
}

export type ListingUpdateResult = { ok: true; movedToHistory: boolean } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export type ListingAccessPasswordResult = { ok: true; password: string } | { ok: false; message: string };

export type ListingQuickUpdateResult = { ok: true; movedToHistory: boolean } | { ok: false; message: string };
export type ListingRetireResult = { ok: true } | { ok: false; message: string };

export async function retireListing(values: ListingRetireInput): Promise<ListingRetireResult> {
  const parsed = listingRetireSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "매물 정보를 확인해 주세요." };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("listings").update({ listing_status: "ended", is_current: false, end_reason: parsed.data.endReason, updated_by_clerk_user_id: context.clerkUserId }).eq("id", parsed.data.id).eq("organization_id", context.organizationId).eq("is_current", true).select("id").maybeSingle();
  if (error || !data) return { ok: false, message: "종료할 현재 매물을 찾지 못했거나 저장에 실패했습니다." };
  revalidatePath("/listings"); revalidatePath("/buildings"); revalidatePath(`/listings/${parsed.data.id}`); revalidatePath(`/listings/${parsed.data.id}/history`);
  return { ok: true };
}

export async function quickUpdateListing(values: ListingQuickUpdateInput): Promise<ListingQuickUpdateResult> {
  const parsed = listingQuickUpdateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "빠른 수정 내용을 확인해 주세요." };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const value = parsed.data;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .update({ listing_status: value.listingStatus, is_current: value.listingStatus !== "contract_complete", photo_status: value.photoStatus, last_confirmed_date: value.lastConfirmedDate || null, holding_source: value.holdingSource || null, updated_by_clerk_user_id: context.clerkUserId })
    .eq("id", value.id)
    .eq("organization_id", context.organizationId)
    .eq("is_current", true)
    .select("id")
    .maybeSingle();
  if (error || !data) return { ok: false, message: "수정할 현재 매물을 찾지 못했거나 저장에 실패했습니다." };
  revalidatePath("/listings");
  revalidatePath(`/listings/${value.id}`);
  revalidatePath(`/listings/${value.id}/edit`);
  revalidatePath(`/listings/${value.id}/history`);
  revalidatePath("/buildings");
  return { ok: true, movedToHistory: value.listingStatus === "contract_complete" };
}

export async function getListingAccessPassword(listingId: string): Promise<ListingAccessPasswordResult> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const sensitiveAccess = await getSensitiveAccess(context);
  if (!sensitiveAccess.unitAccess) return { ok: false, message: "세대 비밀번호 열람 권한이 없습니다. 관리자에게 권한을 요청해 주세요." };

  const supabase = createSupabaseServerClient();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("unit_id")
    .eq("id", listingId)
    .eq("organization_id", context.organizationId)
    .eq("is_current", true)
    .maybeSingle();
  if (listingError || !listing) return { ok: false, message: "현재 매물을 찾지 못했습니다." };

  const { data: access, error: accessError } = await supabase
    .from("unit_access_details")
    .select("access_password")
    .eq("organization_id", context.organizationId)
    .eq("unit_id", listing.unit_id)
    .maybeSingle();
  if (accessError) return { ok: false, message: "세대 비밀번호 정보를 불러오지 못했습니다." };
  if (!access?.access_password) return { ok: false, message: "등록된 세대 비밀번호가 없습니다." };
  return { ok: true, password: access.access_password };
}

export async function updateListing(values: ListingUpdateInput): Promise<ListingUpdateResult> {
  const parsed = listingUpdateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "입력한 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };

  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const sensitiveAccess = await getSensitiveAccess(context);

  const value = parsed.data;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .update({
      property_type: value.propertyType,
      listing_status: value.listingStatus,
      is_current: value.listingStatus !== "contract_complete",
      transaction_type: value.transactionType,
      deposit_amount: value.depositAmount ? Number(value.depositAmount) : null,
      monthly_rent_amount: value.monthlyRentAmount ? Number(value.monthlyRentAmount) : null,
      maintenance_fee_amount: value.maintenanceFeeAmount ? Number(value.maintenanceFeeAmount) : null,
      availability_type: value.availabilityType,
      available_date: value.availabilityType === "date_specified" ? value.availableDate : null,
      move_out_date: value.moveOutDate || null,
      photo_status: value.photoStatus,
      last_confirmed_date: value.lastConfirmedDate || null,
      holding_source: value.holdingSource || null,
      updated_by_clerk_user_id: context.clerkUserId,
    })
    .eq("id", value.id)
    .eq("organization_id", context.organizationId)
    .eq("is_current", true)
    .select("id, unit_id")
    .maybeSingle();

  if (error) return { ok: false, message: "매물 수정에 실패했습니다. 입력값과 Dev DB 상태를 확인해 주세요." };
  if (!data) return { ok: false, message: "수정할 현재 매물을 찾지 못했습니다." };
  const { data: existingAccess, error: accessReadError } = sensitiveAccess.unitAccess ? await supabase
    .from("unit_access_details")
    .select("id")
    .eq("organization_id", context.organizationId)
    .eq("unit_id", data.unit_id)
    .maybeSingle() : { data: null, error: null };
  if (accessReadError) return { ok: false, message: "세대 비밀번호 정보를 확인하지 못했습니다. 매물 조건은 저장됐으니 다시 열어 확인해 주세요." };
  if (sensitiveAccess.unitAccess && (value.accessPassword || existingAccess)) {
    const { error: accessError } = await supabase
      .from("unit_access_details")
      .upsert({ organization_id: context.organizationId, unit_id: data.unit_id, access_password: value.accessPassword || null, created_by_clerk_user_id: context.clerkUserId, updated_by_clerk_user_id: context.clerkUserId }, { onConflict: "unit_id" });
    if (accessError) return { ok: false, message: "세대 비밀번호 저장에 실패했습니다. 매물 조건은 저장됐으니 다시 열어 확인해 주세요." };
  }
  if (sensitiveAccess.propertyContacts) { const buildingId = await getBuildingIdForListing(supabase, context.organizationId, value.id); if (!buildingId || !await saveBuildingOwnerContact({ supabase, organizationId: context.organizationId, clerkUserId: context.clerkUserId, buildingId, phone: value.ownerPhone }) || !await saveUnitTenantContact({ supabase, organizationId: context.organizationId, clerkUserId: context.clerkUserId, unitId: data.unit_id, phone: value.tenantPhone })) return { ok: false, message: "매물 조건은 저장됐지만 제한 연락처를 저장하지 못했습니다. unit_contacts migration을 적용한 뒤 수정 화면에서 다시 저장해 주세요." }; }
  revalidatePath("/listings");
  revalidatePath(`/listings/${value.id}`);
  revalidatePath(`/listings/${value.id}/edit`);
  revalidatePath(`/listings/${value.id}/history`);
  revalidatePath("/buildings");
  return { ok: true, movedToHistory: value.listingStatus === "contract_complete" };
}
