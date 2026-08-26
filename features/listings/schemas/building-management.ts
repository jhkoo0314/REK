import { z } from "zod";

const phone = z.string().trim().refine((value) => value === "" || /^[0-9+()\-\s]{7,25}$/.test(value), "연락처 형식을 확인해 주세요.");

export const buildingUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "건물명을 입력해 주세요."),
  roadAddress: z.string().trim(),
  lotAddress: z.string().trim(),
  addressDetail: z.string().trim(),
  postalCode: z.string().trim(),
  ownerPhone: phone,
}).refine((value) => Boolean(value.roadAddress || value.lotAddress), { message: "도로명 주소 또는 지번 주소 중 하나를 입력해 주세요.", path: ["roadAddress"] });

export const unitUpdateSchema = z.object({
  id: z.string().uuid(),
  buildingId: z.string().uuid(),
  unitNumber: z.string().trim().min(1, "호실을 입력해 주세요."),
  floor: z.string().trim().refine((value) => value === "" || /^-?\d+$/.test(value), "층은 정수로 입력해 주세요."),
  direction: z.string().trim(),
  optionsText: z.string().trim(),
  accessPassword: z.string().trim(),
  tenantPhone: phone,
});

export type BuildingUpdateInput = z.input<typeof buildingUpdateSchema>;
export type UnitUpdateInput = z.input<typeof unitUpdateSchema>;
