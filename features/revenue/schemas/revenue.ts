import { z } from "zod";

const money = z.string().trim().regex(/^\d+$/, "금액은 0 이상의 정수로 입력해 주세요.");
const rate = z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "비율은 숫자로 입력해 주세요.").refine((value) => Number(value) >= 0 && Number(value) <= 100, "비율은 0~100 사이여야 합니다.");

export const revenueSettlementSchema = z.object({ contractId: z.string().uuid(), tenantCommissionAmount: money, landlordCommissionAmount: money, settlementNote: z.string().trim().max(500) });
export const revenueEntrySchema = z.object({ contractId: z.string().uuid(), entryType: z.enum(["receipt", "refund"]), entryDate: z.string().min(1, "수납일 또는 환불일을 입력해 주세요."), grossAmount: money, memo: z.string().trim().max(500) });
export type RevenueSettlementInput = z.input<typeof revenueSettlementSchema>;
export type RevenueEntryInput = z.input<typeof revenueEntrySchema>;
