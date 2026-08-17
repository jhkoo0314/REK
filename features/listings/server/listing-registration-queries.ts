import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationUnitOption = {
  id: string;
  unitNumber: string;
  roomType: string | null;
  hasCurrentListing: boolean;
};

export type RegistrationBuildingOption = {
  id: string;
  name: string;
  address: string;
  lotArea: string;
  lotNumber: string;
  units: RegistrationUnitOption[];
};

type BuildingRow = {
  id: string;
  building_name: string | null;
  lot_address: string;
  lot_area: string;
  lot_number: string;
  units: Array<{ id: string; unit_number: string; room_type: string | null; is_active: boolean; listings: Array<{ id: string; is_current: boolean }> }>;
};

export async function getRegistrationBuildingOptions(organizationId: string): Promise<RegistrationBuildingOption[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("buildings")
    .select("id, building_name, lot_address, lot_area, lot_number, units(id, unit_number, room_type, is_active, listings(id, is_current))")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .order("building_name", { ascending: true });

  if (error) throw new Error("등록용 건물 목록을 불러오지 못했습니다.");

  return ((data as unknown as BuildingRow[] ?? [])).map((building) => ({
    id: building.id,
    name: building.building_name ?? "건물명 미입력",
    address: building.lot_address,
    lotArea: building.lot_area,
    lotNumber: building.lot_number,
    units: building.units.filter((unit) => unit.is_active).map((unit) => ({
      id: unit.id,
      unitNumber: unit.unit_number,
      roomType: unit.room_type,
      hasCurrentListing: unit.listings.some((listing) => listing.is_current),
    })),
  }));
}
