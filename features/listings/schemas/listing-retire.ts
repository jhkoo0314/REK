import { z } from "zod";

export const listingRetireSchema = z.object({
  id: z.string().uuid(),
  endReason: z.enum(["other_broker_contract", "other"]),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "종료일을 입력해 주세요."),
});
export type ListingRetireInput = z.input<typeof listingRetireSchema>;
