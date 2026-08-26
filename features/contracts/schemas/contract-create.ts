import { z } from "zod";

const amount = z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), "금액은 0 이상의 정수로 입력해 주세요.");

export const contractCreateSchema = z.object({
  listingId: z.string().uuid("실제 계약 매물을 선택해 주세요."),
  sourceConsultationId: z.string().uuid().or(z.literal("")),
  transactionType: z.enum(["monthly_rent", "jeonse", "sale", "to_be_confirmed"]),
  contractKind: z.enum(["new_contract", "renewal"]),
  brokerageType: z.enum(["direct", "co_brokerage", "other"]),
  contractStartedDate: z.string(),
  officialContractDate: z.string(),
  moveInDate: z.string(),
  endDate: z.string(),
  totalContractDepositAmount: amount,
  provisionalDepositAmount: amount,
  additionalDepositDueDate: z.string(),
  balanceAmount: amount,
  balanceDueDate: z.string(),
  note: z.string().trim(),
}).superRefine((values, context) => {
  const total = values.totalContractDepositAmount ? Number(values.totalContractDepositAmount) : null;
  const provisional = values.provisionalDepositAmount ? Number(values.provisionalDepositAmount) : null;
  if (total !== null && provisional !== null && provisional > total) context.addIssue({ code: "custom", path: ["provisionalDepositAmount"], message: "가계약금은 전체 계약금보다 클 수 없습니다." });
  if (values.contractStartedDate && values.officialContractDate && values.officialContractDate < values.contractStartedDate) context.addIssue({ code: "custom", path: ["officialContractDate"], message: "정식 계약일은 계약 진행일보다 빠를 수 없습니다." });
  if (values.officialContractDate && values.moveInDate && values.moveInDate < values.officialContractDate) context.addIssue({ code: "custom", path: ["moveInDate"], message: "입주일은 정식 계약일보다 빠를 수 없습니다." });
  if (values.moveInDate && values.endDate && values.endDate <= values.moveInDate) context.addIssue({ code: "custom", path: ["endDate"], message: "만료일은 입주일보다 뒤여야 합니다." });
});

export type ContractCreateInput = z.input<typeof contractCreateSchema>;
