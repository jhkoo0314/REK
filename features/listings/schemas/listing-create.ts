import { z } from "zod";

const amount = z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), "금액은 0 이상의 정수로 입력해 주세요.");
const optionalInteger = z.string().trim().refine((value) => value === "" || /^-?\d+$/.test(value), "층수는 정수로 입력해 주세요.");

export const listingCreateSchema = z.object({
  buildingMode: z.enum(["existing", "new"]),
  buildingId: z.string(),
  buildingName: z.string().trim(),
  roadAddress: z.string().trim(),
  lotAddress: z.string().trim(),
  addressDetail: z.string().trim(),
  postalCode: z.string().trim(),
  unitMode: z.enum(["existing", "new"]),
  unitId: z.string(),
  unitNumber: z.string().trim(),
  floor: optionalInteger,
  layoutType: z.string().trim(),
  direction: z.string().trim(),
  optionsText: z.string().trim(),
  accessPassword: z.string().trim(),
  ownerPhone: z.string().trim().refine((value) => value === "" || /^[0-9+()\-\s]{7,25}$/.test(value), "연락처 형식을 확인해 주세요."),
  tenantPhone: z.string().trim().refine((value) => value === "" || /^[0-9+()\-\s]{7,25}$/.test(value), "연락처 형식을 확인해 주세요."),
  propertyType: z.enum(["one_room", "two_room", "two_bay", "three_room", "owner_unit"]),
  listingStatus: z.enum(["vacant", "contract_in_progress", "on_hold"]),
  transactionType: z.enum(["monthly_rent", "jeonse", "to_be_confirmed"]),
  depositAmount: amount,
  monthlyRentAmount: amount,
  maintenanceFeeAmount: amount,
  availabilityType: z.enum(["immediate", "date_specified", "needs_confirmation"]),
  availableDate: z.string(),
  moveOutDate: z.string(),
  photoStatus: z.enum(["not_available", "available", "needs_confirmation"]),
  lastConfirmedDate: z.string(),
  holdingSource: z.string().trim(),
}).superRefine((values, context) => {
  if (values.buildingMode === "existing" && !values.buildingId) context.addIssue({ code: "custom", path: ["buildingId"], message: "기존 건물을 선택해 주세요." });
  if (values.buildingMode === "new") {
    if (!values.buildingName) context.addIssue({ code: "custom", path: ["buildingName"], message: "건물명을 입력해 주세요." });
    if (!values.roadAddress && !values.lotAddress) context.addIssue({ code: "custom", path: ["roadAddress"], message: "도로명 주소 또는 지번 주소를 입력해 주세요." });
  }
  if (values.unitMode === "existing" && !values.unitId) context.addIssue({ code: "custom", path: ["unitId"], message: "기존 호실을 선택해 주세요." });
  if (values.unitMode === "new" && !values.unitNumber) context.addIssue({ code: "custom", path: ["unitNumber"], message: "호실을 입력해 주세요." });
  if (values.transactionType === "monthly_rent" && !values.monthlyRentAmount) context.addIssue({ code: "custom", path: ["monthlyRentAmount"], message: "월세를 입력해 주세요." });
  if (values.transactionType === "jeonse" && !values.depositAmount) context.addIssue({ code: "custom", path: ["depositAmount"], message: "전세 보증금을 입력해 주세요." });
  if (values.transactionType === "jeonse" && values.monthlyRentAmount && values.monthlyRentAmount !== "0") context.addIssue({ code: "custom", path: ["monthlyRentAmount"], message: "전세 매물의 월세는 비우거나 0으로 입력해 주세요." });
  if (values.availabilityType === "date_specified" && !values.availableDate) context.addIssue({ code: "custom", path: ["availableDate"], message: "입주 가능일을 지정해 주세요." });
});

export type ListingCreateInput = z.input<typeof listingCreateSchema>;
