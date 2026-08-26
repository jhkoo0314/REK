import { z } from "zod";

export const advertisingPlatforms = ["당근", "네이버", "직방", "기타"] as const;
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export const advertisingCostSchema = z.object({
  billingMonth: z.string().regex(monthPattern, "기준월을 선택해 주세요."),
  platformPreset: z.enum(advertisingPlatforms),
  customPlatform: z.string().trim().max(50, "기타 플랫폼명은 50자 이내로 입력해 주세요."),
  amount: z.string().trim().regex(/^\d+$/, "광고비는 0 이상의 정수로 입력해 주세요.").refine((value) => Number(value) <= 2_147_483_647, "광고비가 너무 큽니다."),
  memo: z.string().trim().max(500, "메모는 500자 이내로 입력해 주세요."),
}).superRefine((value, context) => {
  if (value.platformPreset === "기타" && !value.customPlatform) context.addIssue({ code: "custom", path: ["customPlatform"], message: "기타 플랫폼명을 입력해 주세요." });
});

export type AdvertisingCostInput = z.infer<typeof advertisingCostSchema>;
export function platformFromInput(value: Pick<AdvertisingCostInput, "platformPreset" | "customPlatform">) { return value.platformPreset === "기타" ? value.customPlatform.trim() : value.platformPreset; }
