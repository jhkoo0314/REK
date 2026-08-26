"use server";

import { buildingUpdateSchema, type BuildingUpdateInput, type UnitUpdateInput, unitUpdateSchema } from "@/features/listings/schemas/building-management";
import type { ListingEndReason, ListingStatus } from "@/features/listings/types";
import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeForMatch, normalizeUnitNumber } from "@/lib/text-normalize";
import { revalidatePath } from "next/cache";

export type BuildingHistoryItem = { id: string; referenceNumber: number; status: ListingStatus; propertyType: string; isCurrent: boolean; updatedAt: string; endReason: ListingEndReason | null };
export type ManagedUnit = { id: string; buildingId: string; unitNumber: string; floor: number | null; direction: string | null; options: string[]; accessPassword: string; tenantPhone: string; history: BuildingHistoryItem[] };
export type ManagedBuilding = { id: string; name: string; roadAddress: string | null; lotAddress: string | null; addressDetail: string | null; postalCode: string | null; ownerPhone: string; units: ManagedUnit[] };
export type BuildingManagementData = { context: Awaited<ReturnType<typeof getOrganizationContext>>; buildings: ManagedBuilding[]; restrictedContactsAvailable: boolean };
type SaveResult = { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function getBuildingManagementData(): Promise<BuildingManagementData> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, buildings: [], restrictedContactsAvailable: false };
  const supabase = createSupabaseServerClient();
  const [buildingResult, unitResult, listingResult, ownerResult, tenantResult, accessResult] = await Promise.all([
    supabase.from("buildings").select("id, name, road_address, lot_address, address_detail, postal_code").eq("organization_id", context.organizationId).order("name"),
    supabase.from("units").select("id, building_id, unit_number, floor, direction, options").eq("organization_id", context.organizationId).order("unit_number"),
    supabase.from("listings").select("id, unit_id, listing_reference_number, listing_status, property_type, is_current, updated_at, end_reason").eq("organization_id", context.organizationId).order("listing_reference_number", { ascending: false }),
    supabase.from("building_contacts").select("building_id, phone_number").eq("organization_id", context.organizationId).eq("contact_role", "owner"),
    supabase.from("unit_contacts").select("unit_id, phone_number").eq("organization_id", context.organizationId).eq("contact_role", "tenant"),
    supabase.from("unit_access_details").select("unit_id, access_password").eq("organization_id", context.organizationId),
  ]);
  if (buildingResult.error || unitResult.error || listingResult.error || ownerResult.error || accessResult.error) throw new Error("건물·호실 관리 정보를 불러오지 못했습니다.");
  const ownerByBuilding = new Map((ownerResult.data ?? []).map((item) => [item.building_id, item.phone_number]));
  const tenantByUnit = new Map((tenantResult.data ?? []).map((item) => [item.unit_id, item.phone_number]));
  const accessByUnit = new Map((accessResult.data ?? []).map((item) => [item.unit_id, item.access_password ?? ""]));
  const historyByUnit = new Map<string, BuildingHistoryItem[]>();
  for (const item of listingResult.data ?? []) {
    const history = historyByUnit.get(item.unit_id) ?? [];
    history.push({ id: item.id, referenceNumber: item.listing_reference_number, status: item.listing_status as ListingStatus, propertyType: item.property_type, isCurrent: item.is_current, updatedAt: item.updated_at, endReason: item.end_reason as ListingEndReason | null });
    historyByUnit.set(item.unit_id, history);
  }
  const unitsByBuilding = new Map<string, ManagedUnit[]>();
  for (const item of unitResult.data ?? []) {
    const units = unitsByBuilding.get(item.building_id) ?? [];
    units.push({ id: item.id, buildingId: item.building_id, unitNumber: item.unit_number, floor: item.floor, direction: item.direction, options: item.options ?? [], accessPassword: accessByUnit.get(item.id) ?? "", tenantPhone: tenantByUnit.get(item.id) ?? "", history: historyByUnit.get(item.id) ?? [] });
    unitsByBuilding.set(item.building_id, units);
  }
  return { context, restrictedContactsAvailable: !tenantResult.error, buildings: (buildingResult.data ?? []).map((item) => ({ id: item.id, name: item.name, roadAddress: item.road_address, lotAddress: item.lot_address, addressDetail: item.address_detail, postalCode: item.postal_code, ownerPhone: ownerByBuilding.get(item.id) ?? "", units: unitsByBuilding.get(item.id) ?? [] })) };
}

async function saveOwnerPhone(supabase: ReturnType<typeof createSupabaseServerClient>, organizationId: string, clerkUserId: string, buildingId: string, phone: string) {
  const { data: existing, error } = await supabase.from("building_contacts").select("id").eq("organization_id", organizationId).eq("building_id", buildingId).eq("contact_role", "owner").maybeSingle();
  if (error) return false;
  if (!phone) return !existing || !(await supabase.from("building_contacts").delete().eq("id", existing.id).eq("organization_id", organizationId)).error;
  if (existing) return !(await supabase.from("building_contacts").update({ contact_name: "임대인", phone_number: phone, updated_by_clerk_user_id: clerkUserId }).eq("id", existing.id).eq("organization_id", organizationId)).error;
  return !(await supabase.from("building_contacts").insert({ organization_id: organizationId, building_id: buildingId, contact_name: "임대인", phone_number: phone, contact_role: "owner", is_primary: false, created_by_clerk_user_id: clerkUserId, updated_by_clerk_user_id: clerkUserId })).error;
}

export async function updateManagedBuilding(values: BuildingUpdateInput): Promise<SaveResult> {
  const parsed = buildingUpdateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "건물 정보를 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const value = parsed.data; const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("buildings").update({ name: value.name, normalized_name: normalizeForMatch(value.name), road_address: value.roadAddress || null, lot_address: value.lotAddress || null, address_detail: value.addressDetail || null, postal_code: value.postalCode || null, normalized_address: normalizeForMatch(value.roadAddress || value.lotAddress), updated_by_clerk_user_id: context.clerkUserId }).eq("id", value.id).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error?.code === "23505") return { ok: false, message: "같은 이름과 주소의 건물이 이미 있습니다." };
  if (error || !data) return { ok: false, message: "수정할 건물을 찾지 못했거나 저장에 실패했습니다." };
  if (!await saveOwnerPhone(supabase, context.organizationId, context.clerkUserId, value.id, value.ownerPhone)) return { ok: false, message: "건물 정보는 저장됐지만 임대인 연락처를 저장하지 못했습니다." };
  revalidatePath("/buildings"); revalidatePath("/listings");
  return { ok: true };
}

export async function updateManagedUnit(values: UnitUpdateInput): Promise<SaveResult> {
  const parsed = unitUpdateSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "호실 정보를 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const value = parsed.data; const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("units").update({ unit_number: value.unitNumber, normalized_unit_number: normalizeUnitNumber(value.unitNumber), floor: value.floor === "" ? null : Number(value.floor), direction: value.direction || null, options: value.optionsText ? value.optionsText.split(",").map((item) => item.trim()).filter(Boolean) : [], updated_by_clerk_user_id: context.clerkUserId }).eq("id", value.id).eq("building_id", value.buildingId).eq("organization_id", context.organizationId).select("id").maybeSingle();
  if (error?.code === "23505") return { ok: false, message: "같은 건물에 같은 호실이 이미 있습니다." };
  if (error || !data) return { ok: false, message: "수정할 호실을 찾지 못했거나 저장에 실패했습니다." };
  const { data: existingAccess, error: accessReadError } = await supabase.from("unit_access_details").select("id").eq("organization_id", context.organizationId).eq("unit_id", value.id).maybeSingle();
  if (accessReadError) return { ok: false, message: "호실 정보는 저장됐지만 세대 비밀번호를 확인하지 못했습니다." };
  if (value.accessPassword || existingAccess) {
    const { error: accessError } = await supabase.from("unit_access_details").upsert({ organization_id: context.organizationId, unit_id: value.id, access_password: value.accessPassword || null, created_by_clerk_user_id: context.clerkUserId, updated_by_clerk_user_id: context.clerkUserId }, { onConflict: "unit_id" });
    if (accessError) return { ok: false, message: "호실 정보는 저장됐지만 세대 비밀번호를 저장하지 못했습니다." };
  }
  const { data: existingTenant, error: tenantReadError } = await supabase.from("unit_contacts").select("id").eq("organization_id", context.organizationId).eq("unit_id", value.id).eq("contact_role", "tenant").maybeSingle();
  if (tenantReadError) return { ok: false, message: "호실 정보는 저장됐지만 세입자 연락처를 저장하지 못했습니다. 20260826000700 migration 적용 여부를 확인해 주세요." };
  const tenantError = !value.tenantPhone ? (existingTenant ? (await supabase.from("unit_contacts").delete().eq("id", existingTenant.id).eq("organization_id", context.organizationId)).error : null) : existingTenant ? (await supabase.from("unit_contacts").update({ contact_name: "세입자", phone_number: value.tenantPhone, updated_by_clerk_user_id: context.clerkUserId }).eq("id", existingTenant.id).eq("organization_id", context.organizationId)).error : (await supabase.from("unit_contacts").insert({ organization_id: context.organizationId, unit_id: value.id, contact_name: "세입자", phone_number: value.tenantPhone, contact_role: "tenant", created_by_clerk_user_id: context.clerkUserId, updated_by_clerk_user_id: context.clerkUserId })).error;
  if (tenantError) return { ok: false, message: "호실 정보는 저장됐지만 세입자 연락처를 저장하지 못했습니다." };
  revalidatePath("/buildings"); revalidatePath("/listings");
  return { ok: true };
}
