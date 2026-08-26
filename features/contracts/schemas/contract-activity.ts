import { z } from "zod";

export const contractActivitySchema = z.object({
  contractId: z.string().uuid(),
  activityType: z.enum(["provisional_contract", "formal_contract", "balance_due", "completed", "cancelled", "expired"]),
  activityDate: z.string().min(1, "단계 처리일을 입력해 주세요."),
  note: z.string().trim(),
});

export type ContractActivityInput = z.input<typeof contractActivitySchema>;
