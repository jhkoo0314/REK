import { z } from "zod";

const optionalAmount = z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), "금액은 0 이상의 정수로 입력해 주세요.");
const phone = z.string().trim().regex(/^[0-9+()\-\s]{7,25}$/, "연락처 형식을 확인해 주세요.");

export const consultationCreateSchema = z.object({
  category: z.enum(["general", "listing"]),
  initialListingId: z.string(),
  customerName: z.string().trim(),
  customerPhone: phone,
  consultationDate: z.string().min(1, "상담일을 입력해 주세요."),
  inflowSource: z.string().trim().min(1, "유입 경로를 선택해 주세요."),
  consultationMethod: z.enum(["phone", "message", "visit", "other"]),
  consultationNote: z.string().trim(),
  desiredAreas: z.array(z.string().trim()).default([]),
  desiredAreasOther: z.string().trim(),
  desiredRoomTypes: z.array(z.string().trim()).default([]),
  desiredRoomTypesOther: z.string().trim(),
  desiredDepositBudget: optionalAmount,
  desiredMonthlyRentBudget: optionalAmount,
  desiredMoveInDate: z.string(),
  requiredFeaturesNote: z.string().trim(),
  status: z.enum(["in_progress", "on_hold", "ended", "needs_confirmation"]),
  progressStage: z.enum(["new_inquiry", "condition_check", "visit_scheduled", "visit_completed", "reviewing", "closed"]),
  nextContactDate: z.string(),
  closedReason: z.string().trim(),
}).superRefine((values, context) => {
  if (values.category === "listing" && !values.initialListingId) context.addIssue({ code: "custom", path: ["initialListingId"], message: "매물 상담은 최초 문의 매물을 선택해 주세요." });
  if (values.status === "ended" && !values.closedReason) context.addIssue({ code: "custom", path: ["closedReason"], message: "상담 종료 사유를 입력해 주세요." });
  if (values.status === "ended" && values.nextContactDate) context.addIssue({ code: "custom", path: ["nextContactDate"], message: "종료된 상담에는 다음 연락일을 지정할 수 없습니다." });
  if (values.status === "ended" && values.progressStage !== "closed") context.addIssue({ code: "custom", path: ["progressStage"], message: "종료된 상담의 진행 단계는 종료여야 합니다." });
});

export type ConsultationCreateInput = z.input<typeof consultationCreateSchema>;
