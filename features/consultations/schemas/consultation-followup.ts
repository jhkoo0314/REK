import { z } from "zod";

export const consultationFollowupSchema = z.object({
  consultationId: z.string().uuid(),
  followupDate: z.string().min(1, "후속 연락일을 입력해 주세요."),
  followupMethod: z.enum(["phone", "message", "visit", "other"]),
  progressStage: z.enum(["new_inquiry", "condition_check", "visit_scheduled", "visit_completed", "reviewing", "closed"]).optional(),
  visitResult: z.string().trim(),
  closedReason: z.string().trim(),
  nextContactDate: z.string(),
  note: z.string().trim(),
}).superRefine((values, context) => {
  if (values.progressStage === "closed" && !values.closedReason) context.addIssue({ code: "custom", path: ["closedReason"], message: "종료 단계에는 종료 사유를 입력해 주세요." });
  if (values.progressStage === "closed" && values.nextContactDate) context.addIssue({ code: "custom", path: ["nextContactDate"], message: "종료 단계에는 다음 연락일을 지정할 수 없습니다." });
});

export const consultationFollowupUpdateSchema = consultationFollowupSchema.extend({ id: z.string().uuid() });
export const consultationFollowupDeleteSchema = z.object({ id: z.string().uuid(), consultationId: z.string().uuid() });

export type ConsultationFollowupInput = z.input<typeof consultationFollowupSchema>;
export type ConsultationFollowupUpdateInput = z.input<typeof consultationFollowupUpdateSchema>;
