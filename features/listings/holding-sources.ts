export const holdingSourcePresets = ["크린주택관리", "삼성주택관리", "한빛주택관리", "국제주택관리", "개인매물"] as const;

export const customHoldingSourceValue = "직접입력";

export function isHoldingSourcePreset(value: string) {
  return holdingSourcePresets.includes(value as (typeof holdingSourcePresets)[number]);
}
