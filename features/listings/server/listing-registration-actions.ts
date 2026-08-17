"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { findActiveOrganizationMember, createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationActionState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
  listingId?: string;
  existingListingId?: string;
  showDuplicateUnitAlert?: boolean;
};

const optionalAmount = z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().int().min(0, "0 이상으로 입력해 주세요.").optional());
const optionalText = z.preprocess((value) => typeof value === "string" && value.trim() === "" ? undefined : value, z.string().trim().optional());

const registrationSchema = z.object({
  buildingMode: z.enum(["existing", "new"]),
  existingBuildingId: z.string().uuid().optional().or(z.literal("")),
  buildingName: optionalText,
  lotArea: optionalText,
  lotNumber: optionalText,
  lotAddress: optionalText,
  unitMode: z.enum(["existing", "new"]),
  existingUnitId: z.string().uuid().optional().or(z.literal("")),
  unitNumber: optionalText,
  roomType: z.enum(["원룸", "투룸", "투베이", "쓰리룸", "쓰리베이", "주인세대", "기타", "확인 필요"]).optional(),
  listingHolder: z.string().trim().min(1, "매물 보유처를 입력해 주세요."),
  listingStatus: z.enum(["확인 필요", "퇴실 예정", "공실", "광고 가능", "계약 진행 중", "계약 완료", "보류", "종료"]),
  transactionType: z.enum(["월세", "전세", "확인 필요"]),
  depositManwon: optionalAmount,
  monthlyRentManwon: optionalAmount,
  managementFeeManwon: optionalAmount,
  availabilityType: z.enum(["즉시입주", "날짜 지정", "퇴실 후 협의", "확인 필요"]),
  availableFromDate: optionalText,
  listingNote: optionalText,
}).superRefine((value, context) => {
  if (value.buildingMode === "existing" && !value.existingBuildingId) context.addIssue({ code: "custom", path: ["existingBuildingId"], message: "기존 건물을 선택해 주세요." });
  if (value.buildingMode === "new") {
    if (!value.lotArea) context.addIssue({ code: "custom", path: ["lotArea"], message: "지역을 입력해 주세요." });
    if (!value.lotNumber) context.addIssue({ code: "custom", path: ["lotNumber"], message: "지번을 입력해 주세요." });
    if (!value.lotAddress) context.addIssue({ code: "custom", path: ["lotAddress"], message: "주소를 입력해 주세요." });
  }
  if (value.unitMode === "existing" && !value.existingUnitId) context.addIssue({ code: "custom", path: ["existingUnitId"], message: "기존 호실을 선택해 주세요." });
  if (value.unitMode === "new" && !value.unitNumber) context.addIssue({ code: "custom", path: ["unitNumber"], message: "호실을 입력해 주세요." });
  if (value.transactionType === "월세" && value.monthlyRentManwon === undefined) context.addIssue({ code: "custom", path: ["monthlyRentManwon"], message: "월세를 입력해 주세요." });
  if ((value.transactionType === "월세" || value.transactionType === "전세") && value.depositManwon === undefined) context.addIssue({ code: "custom", path: ["depositManwon"], message: "보증금 또는 전세금을 입력해 주세요." });
  if (value.availabilityType === "날짜 지정" && !value.availableFromDate) context.addIssue({ code: "custom", path: ["availableFromDate"], message: "입주 가능일을 입력해 주세요." });
});

export async function registerListing(input: unknown): Promise<RegistrationActionState> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) return { message: "입력한 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };

  const { userId } = await auth();
  if (!userId) return { message: "로그인 정보를 확인해 주세요." };

  const member = await findActiveOrganizationMember(userId);
  if (!member) return { message: "활성 조직 멤버십을 확인하지 못했습니다." };

  const value = parsed.data;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_listing_with_structure", {
    p_organization_id: member.organizationId,
    p_member_id: member.id,
    p_existing_building_id: value.buildingMode === "existing" ? value.existingBuildingId || null : null,
    p_building_name: value.buildingMode === "new" ? value.buildingName ?? null : null,
    p_lot_area: value.buildingMode === "new" ? value.lotArea ?? null : null,
    p_lot_number: value.buildingMode === "new" ? value.lotNumber ?? null : null,
    p_lot_address: value.buildingMode === "new" ? value.lotAddress ?? null : null,
    p_existing_unit_id: value.unitMode === "existing" ? value.existingUnitId || null : null,
    p_unit_number: value.unitMode === "new" ? value.unitNumber ?? null : null,
    p_room_type: value.unitMode === "new" ? value.roomType ?? "확인 필요" : null,
    p_listing_holder: value.listingHolder,
    p_listing_status: value.listingStatus,
    p_transaction_type: value.transactionType,
    p_deposit_manwon: value.depositManwon ?? null,
    p_monthly_rent_manwon: value.transactionType === "월세" ? value.monthlyRentManwon ?? null : null,
    p_management_fee_manwon: value.managementFeeManwon ?? null,
    p_availability_type: value.availabilityType,
    p_available_from_date: value.availableFromDate ?? null,
    p_listing_note: value.listingNote ?? null,
  });

  if (error) {
    const match = error.message.match(/CURRENT_LISTING_EXISTS:([\w-]+)/);
    if (match) return { message: "이미 현재 매물이 등록된 호실입니다. 기존 매물을 수정해 주세요.", existingListingId: match[1], showDuplicateUnitAlert: true };
    if (error.code === "23505" || /duplicate key|normalized_unit|already exists/i.test(error.message)) {
      return { message: "이미 등록된 호실입니다. 기존 호실을 선택해 매물을 등록해 주세요.", showDuplicateUnitAlert: true };
    }
    return { message: "저장하지 못했습니다. 입력값과 Dev DB 연결 상태를 확인한 뒤 다시 시도해 주세요." };
  }

  return { listingId: data as string };
}
