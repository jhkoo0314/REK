import type { StatusBadgeLabel } from "@/components/shared/status-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ListingListItem = {
  id: string;
  listingNumber: string;
  building: string;
  unit: string;
  address: string;
  structure: string;
  price: string;
  fee: string;
  available: string;
  status: StatusBadgeLabel;
  channels: string;
};

export type ListingListFilters = {
  query?: string;
  status?: StatusBadgeLabel;
  transactionType?: "월세" | "전세" | "확인 필요";
  availabilityType?: "즉시입주" | "날짜 지정";
};

type ListingRow = {
  id: string;
  listing_number: string;
  listing_status: string;
  transaction_type: string;
  deposit_manwon: number | null;
  monthly_rent_manwon: number | null;
  management_fee_manwon: number | null;
  availability_type: string;
  available_from_date: string | null;
  units: Array<{
    unit_number: string;
    room_type: string | null;
    buildings: Array<{ building_name: string; lot_address: string | null }>;
  }>;
};

const supportedStatuses = new Set<StatusBadgeLabel>([
  "확인 필요",
  "퇴실 예정",
  "공실",
  "광고 가능",
  "계약 진행 중",
  "계약 완료",
  "보류",
  "종료",
]);

const supportedTransactionTypes = new Set<ListingListFilters["transactionType"]>(["월세", "전세", "확인 필요"]);
const supportedAvailabilityTypes = new Set<ListingListFilters["availabilityType"]>(["즉시입주", "날짜 지정"]);

function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export function parseListingListFilters(searchParams: Record<string, string | string[] | undefined>): ListingListFilters {
  const query = firstValue(searchParams.q)?.trim().slice(0, 100);
  const status = firstValue(searchParams.status);
  const transactionType = firstValue(searchParams.transactionType);
  const availabilityType = firstValue(searchParams.availabilityType);

  return {
    ...(query ? { query } : {}),
    ...(status && supportedStatuses.has(status as StatusBadgeLabel) ? { status: status as StatusBadgeLabel } : {}),
    ...(transactionType && supportedTransactionTypes.has(transactionType as ListingListFilters["transactionType"]) ? { transactionType: transactionType as ListingListFilters["transactionType"] } : {}),
    ...(availabilityType && supportedAvailabilityTypes.has(availabilityType as ListingListFilters["availabilityType"]) ? { availabilityType: availabilityType as ListingListFilters["availabilityType"] } : {}),
  };
}

function formatManwon(value: number | null) {
  return value === null ? null : `${value.toLocaleString("ko-KR")}만`;
}

function formatPrice(row: ListingRow) {
  const deposit = formatManwon(row.deposit_manwon);

  if (row.transaction_type === "전세") {
    return deposit ? `전세 ${deposit}` : "전세 조건 확인 필요";
  }

  if (row.transaction_type === "월세") {
    const monthlyRent = formatManwon(row.monthly_rent_manwon);
    return deposit && monthlyRent ? `${deposit} / ${monthlyRent}` : "월세 조건 확인 필요";
  }

  return "조건 확인 필요";
}

function formatAvailable(row: ListingRow) {
  if (row.availability_type === "즉시입주") return "즉시 입주";
  if (row.availability_type === "퇴실 후 협의") return "퇴실 후 협의";
  if (row.availability_type === "날짜 지정") {
    return row.available_from_date ? row.available_from_date.replaceAll("-", ".") : "날짜 확인 필요";
  }

  return "입주일 확인 필요";
}

/**
 * 목록에 필요한 업무 정보만 가져옵니다. 연락처·비고·출입 정보는 의도적으로 제외합니다.
 */
export async function getCurrentListings(organizationId: string, filters: ListingListFilters = {}): Promise<ListingListItem[]> {
  const supabase = createSupabaseServerClient();
  let request = supabase
    .from("listings")
    .select("id, listing_number, listing_status, transaction_type, deposit_manwon, monthly_rent_manwon, management_fee_manwon, availability_type, available_from_date, units!inner(unit_number, room_type, buildings!inner(building_name, lot_address))")
    .eq("organization_id", organizationId)
    .eq("is_current", true)
    .order("updated_at", { ascending: false });

  if (filters.status) request = request.eq("listing_status", filters.status);
  if (filters.transactionType) request = request.eq("transaction_type", filters.transactionType);
  if (filters.availabilityType) request = request.eq("availability_type", filters.availabilityType);

  const { data, error } = await request;

  if (error) {
    throw new Error("매물 목록을 불러오지 못했습니다.");
  }

  const listings = (data as unknown as ListingRow[] ?? []).map((row) => {
    const unit = row.units[0];
    const building = unit?.buildings[0];

    return {
    id: row.id,
    listingNumber: row.listing_number,
    building: building?.building_name ?? "건물명 미입력",
    unit: unit?.unit_number ?? row.listing_number,
    address: building?.lot_address ?? "주소 미입력",
    structure: unit?.room_type ?? "구조 확인 필요",
    price: formatPrice(row),
    fee: row.management_fee_manwon === null ? "확인 필요" : `${row.management_fee_manwon.toLocaleString("ko-KR")}만 원`,
    available: formatAvailable(row),
    status: supportedStatuses.has(row.listing_status as StatusBadgeLabel) ? (row.listing_status as StatusBadgeLabel) : "확인 필요",
    channels: "연결 준비 중",
    };
  });

  if (!filters.query) return listings;

  const keyword = filters.query.toLocaleLowerCase("ko-KR");
  return listings.filter((listing) => [listing.building, listing.unit, listing.address, listing.listingNumber].some((value) => value.toLocaleLowerCase("ko-KR").includes(keyword)));
}
