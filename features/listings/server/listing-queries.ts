import { getOrganizationContext } from "@/lib/auth/organization-context";
import { getSensitiveAccess } from "@/lib/auth/sensitive-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AvailabilityType, ListingDetail, ListingEditData, ListingFilters, ListingListItem, ListingStatus, TransactionType } from "@/features/listings/types";

const listingStatuses = ["vacant", "contract_in_progress", "contract_complete", "on_hold", "ended"] as const;
const transactionTypes = ["monthly_rent", "jeonse", "sale", "to_be_confirmed"] as const;

type SearchValue = string | string[] | undefined;
type SearchParams = Record<string, SearchValue>;

function firstValue(value: SearchValue) { return typeof value === "string" ? value : ""; }
function enumValue<T extends readonly string[]>(value: string, values: T): T[number] | "all" { return values.includes(value) ? value as T[number] : "all"; }

export function readListingFilters(searchParams: SearchParams): ListingFilters {
  const rawStatus = firstValue(searchParams.status);
  return {
    query: firstValue(searchParams.q).trim(),
    scope: firstValue(searchParams.scope) === "history" || firstValue(searchParams.scope) === "all"
      ? firstValue(searchParams.scope) as ListingFilters["scope"]
      : "current",
    status: rawStatus === "active" ? "all" : enumValue(rawStatus, listingStatuses) as ListingStatus | "all",
    propertyType: enumValue(firstValue(searchParams.propertyType), ["one_room", "two_room", "two_bay", "three_room", "owner_unit", "apartment", "officetel", "retail", "office"] as const) as ListingFilters["propertyType"],
    transaction: enumValue(firstValue(searchParams.transaction), transactionTypes) as TransactionType | "all",
    availability: ["immediate", "date_specified", "needs_confirmation"].includes(firstValue(searchParams.availability)) ? firstValue(searchParams.availability) as ListingFilters["availability"] : "all",
    receivedStart: firstValue(searchParams.receivedStart),
    receivedEnd: firstValue(searchParams.receivedEnd),
    minDeposit: firstValue(searchParams.minDeposit),
    maxDeposit: firstValue(searchParams.maxDeposit),
    minMonthlyRent: firstValue(searchParams.minMonthlyRent),
    maxMonthlyRent: firstValue(searchParams.maxMonthlyRent),
    holdingSource: firstValue(searchParams.holdingSource).trim(),
  };
}

function numberValue(value: string) { const parsed = Number(value); return Number.isFinite(parsed) && value.trim() !== "" ? parsed : null; }

function matchesFilters(item: ListingListItem, filters: ListingFilters) {
  const query = filters.query.toLocaleLowerCase("ko-KR");
  const text = `${item.referenceNumber} ${item.buildingName} ${item.address} ${item.unitNumber}`.toLocaleLowerCase("ko-KR");
  const minDeposit = numberValue(filters.minDeposit);
  const maxDeposit = numberValue(filters.maxDeposit);
  const minMonthlyRent = numberValue(filters.minMonthlyRent);
  const maxMonthlyRent = numberValue(filters.maxMonthlyRent);
  return (!query || text.includes(query))
    && (filters.scope === "all" || (filters.scope === "current" ? item.isCurrent : !item.isCurrent))
    && (filters.status === "all" || item.status === filters.status)
    && (filters.propertyType === "all" || item.propertyType === filters.propertyType)
    && (filters.transaction === "all" || item.transactionType === filters.transaction)
    && (filters.availability === "all" || item.availabilityType === filters.availability)
    && (!filters.receivedStart || item.createdAt >= filters.receivedStart)
    && (!filters.receivedEnd || item.createdAt <= filters.receivedEnd)
    && (minDeposit === null || (item.depositAmount ?? 0) >= minDeposit)
    && (maxDeposit === null || (item.depositAmount ?? 0) <= maxDeposit)
    && (minMonthlyRent === null || (item.monthlyRentAmount ?? 0) >= minMonthlyRent)
    && (maxMonthlyRent === null || (item.monthlyRentAmount ?? 0) <= maxMonthlyRent)
    && (!filters.holdingSource || (item.holdingSource ?? "").includes(filters.holdingSource));
}

export async function getListingList(searchParams: SearchParams) {
  const filters = readListingFilters(searchParams);
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, filters, listings: [] as ListingListItem[] };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, listing_reference_number, property_type, listing_status, is_current, transaction_type, deposit_amount, monthly_rent_amount, maintenance_fee_amount, availability_type, available_date, holding_source, created_at, units!inner(unit_number, layout_type, buildings!inner(name, road_address, lot_address))")
    .eq("organization_id", context.organizationId)
    .order("listing_reference_number", { ascending: false });

  if (error) throw new Error("매물 목록을 불러오지 못했습니다. P0 매물번호 migration 적용 여부를 확인해 주세요.");

  const listings = (data ?? []).map((row) => {
    const unit = Array.isArray(row.units) ? row.units[0] : row.units;
    const building = unit && "buildings" in unit ? (Array.isArray(unit.buildings) ? unit.buildings[0] : unit.buildings) : null;
    return {
      id: row.id,
      referenceNumber: row.listing_reference_number,
      propertyType: row.property_type,
      status: row.listing_status,
      isCurrent: row.is_current,
      transactionType: row.transaction_type,
      buildingName: building?.name ?? "건물 정보 없음",
      address: building?.road_address ?? building?.lot_address ?? "주소 미입력",
      unitNumber: unit?.unit_number ?? "호실 미입력",
      layoutType: unit?.layout_type ?? null,
      depositAmount: row.deposit_amount,
      monthlyRentAmount: row.monthly_rent_amount,
      maintenanceFeeAmount: row.maintenance_fee_amount,
      availableDate: row.available_date,
      availabilityType: row.availability_type,
      holdingSource: row.holding_source,
      createdAt: row.created_at.slice(0, 10),
    } satisfies ListingListItem;
  }).filter((item) => matchesFilters(item, filters));

  return { context, filters, listings };
}

async function getListingDetailByCurrentState(listingId: string, isCurrent: boolean) {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, listing: null as ListingDetail | null };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, listing_reference_number, property_type, listing_status, is_current, transaction_type, deposit_amount, monthly_rent_amount, maintenance_fee_amount, availability_type, available_date, move_out_date, end_reason, end_date, holding_source, created_at, units!inner(id, unit_number, layout_type, floor, direction, options, buildings!inner(id, name, road_address, lot_address, address_detail))")
    .eq("id", listingId)
    .eq("organization_id", context.organizationId)
    .eq("is_current", isCurrent)
    .maybeSingle();

  if (error) throw new Error("매물 상세를 불러오지 못했습니다.");
  if (!data) return { context, listing: null as ListingDetail | null };

  const unit = Array.isArray(data.units) ? data.units[0] : data.units;
  const building = unit && "buildings" in unit ? (Array.isArray(unit.buildings) ? unit.buildings[0] : unit.buildings) : null;
  return {
    context,
    listing: {
      id: data.id,
      unitId: unit?.id ?? "",
      buildingId: building?.id ?? "",
      referenceNumber: data.listing_reference_number,
      propertyType: data.property_type,
      status: data.listing_status,
      isCurrent: data.is_current,
      transactionType: data.transaction_type,
      buildingName: building?.name ?? "건물 정보 없음",
      address: building?.road_address ?? building?.lot_address ?? "주소 미입력",
      unitNumber: unit?.unit_number ?? "호실 미입력",
      layoutType: unit?.layout_type ?? null,
      depositAmount: data.deposit_amount,
      monthlyRentAmount: data.monthly_rent_amount,
      maintenanceFeeAmount: data.maintenance_fee_amount,
      availableDate: data.available_date,
      availabilityType: data.availability_type as AvailabilityType,
      holdingSource: data.holding_source,
      createdAt: data.created_at.slice(0, 10),
      roadAddress: building?.road_address ?? null,
      lotAddress: building?.lot_address ?? null,
      addressDetail: building?.address_detail ?? null,
      floor: unit?.floor ?? null,
      direction: unit?.direction ?? null,
      options: unit?.options ?? [],
      moveOutDate: data.move_out_date,
      endReason: data.end_reason,
      endDate: data.end_date,
    } satisfies ListingDetail,
  };
}

export async function getListingDetail(listingId: string) {
  return getListingDetailByCurrentState(listingId, true);
}

export async function getListingHistoryDetail(listingId: string) {
  return getListingDetailByCurrentState(listingId, false);
}

export async function getListingEditData(listingId: string) {
  const result = await getListingDetail(listingId);
  if (result.context.kind !== "ready" || !result.listing) return { ...result, editData: null as ListingEditData | null };
  const sensitiveAccess = await getSensitiveAccess(result.context);

  const supabase = createSupabaseServerClient();
  const [{ data: access, error: accessError }, { data: ownerContact, error: ownerError }, { data: tenantContact, error: tenantError }] = await Promise.all([
    supabase.from("unit_access_details").select("access_password").eq("organization_id", result.context.organizationId).eq("unit_id", result.listing.unitId).maybeSingle(),
    supabase.from("building_contacts").select("phone_number").eq("organization_id", result.context.organizationId).eq("building_id", result.listing.buildingId).eq("contact_role", "owner").maybeSingle(),
    supabase.from("unit_contacts").select("phone_number").eq("organization_id", result.context.organizationId).eq("unit_id", result.listing.unitId).eq("contact_role", "tenant").maybeSingle(),
  ]);
  if (accessError || ownerError || tenantError) throw new Error("제한 정보를 불러오지 못했습니다. unit_contacts migration 적용 여부를 확인해 주세요.");
  const ownerPhone = sensitiveAccess.propertyContacts ? ownerContact?.phone_number ?? "" : "";
  const tenantPhone = sensitiveAccess.propertyContacts ? tenantContact?.phone_number ?? "" : "";
  return { ...result, editData: { listing: result.listing, accessPassword: sensitiveAccess.unitAccess ? access?.access_password ?? "" : "", ownerPhone, tenantPhone, sensitiveAccess: { propertyContacts: sensitiveAccess.propertyContacts, unitAccess: sensitiveAccess.unitAccess } } };
}
