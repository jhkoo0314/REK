import { z } from "zod";

export const propertyGroups = ["residential", "apartment", "officetel", "commercial"] as const;
export type PropertyGroup = (typeof propertyGroups)[number];
export const propertyGroupLabels: Record<PropertyGroup, string> = { residential: "원룸·투룸", apartment: "아파트", officetel: "오피스텔", commercial: "상가·사무실" };
export const allowedPlaceholders = ["주소", "매물유형", "거래조건", "관리비", "입주가능일", "특징"] as const;

const sensitivePattern = /(비밀번호|출입\s*메모|내부\s*메모|연락처|전화번호|휴대폰|계좌)/i;
const phonePattern = /(?:01[016789]|0\d{1,2})[-\s]?\d{3,4}[-\s]?\d{4}/;
function hasOnlyAllowedPlaceholders(value: string) {
  const matches = [...value.matchAll(/\{\{([^{}]+)\}\}/g)];
  const hasOnlyAllowed = matches.every((match) => allowedPlaceholders.includes(match[1].trim() as (typeof allowedPlaceholders)[number]));
  const remainingBraces = value.replace(/\{\{([^{}]+)\}\}/g, "");
  return hasOnlyAllowed && !remainingBraces.includes("{{") && !remainingBraces.includes("}}");
}
function isSafeTemplateText(value: string) { return !sensitivePattern.test(value) && !phonePattern.test(value) && hasOnlyAllowedPlaceholders(value); }

const safeText = (max: number, label: string) => z.string().trim().min(1, `${label}을 입력해 주세요.`).max(max, `${label}은 ${max}자 이내로 입력해 주세요.`).refine(isSafeTemplateText, "연락처·비밀번호·내부 메모와 허용되지 않은 {{항목}}은 넣을 수 없습니다.");

export const advertisingCopyTemplateSchema = z.object({
  templateId: z.string().uuid().optional(),
  propertyGroup: z.enum(propertyGroups),
  templateName: z.string().trim().min(1, "템플릿 이름을 입력해 주세요.").max(50, "템플릿 이름은 50자 이내로 입력해 주세요.").refine((value) => !sensitivePattern.test(value) && !phonePattern.test(value), "템플릿 이름에 민감정보를 넣을 수 없습니다."),
  titleTemplate: safeText(120, "제목 템플릿"),
  bodyTemplate: safeText(2000, "본문 템플릿"),
  isActive: z.boolean(),
});
export type AdvertisingCopyTemplateInput = z.infer<typeof advertisingCopyTemplateSchema>;
export const templateIdSchema = z.string().uuid();
export function hasSensitiveCopy(value: string) { return sensitivePattern.test(value) || phonePattern.test(value); }
