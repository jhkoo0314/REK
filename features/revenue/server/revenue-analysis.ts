"use server";

import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RevenueAnalysisFilters = { startDate: string; endDate: string; responsible?: string; propertyType?: string; transactionType?: string; contractStatus?: string };
type AggregateRow = { key: string; label: string; contractCount: number; receipts: number; refunds: number; net: number; staffNet: number };
export type RevenueAnalysis = { role: "admin" | "staff"; filters: RevenueAnalysisFilters; summary: { receipts: number; refunds: number; net: number; contractCount: number; average: number }; byResponsible: AggregateRow[]; byPropertyType: AggregateRow[]; byTransactionType: AggregateRow[]; byMonth: AggregateRow[]; outstanding: { contractId: string; contractLabel: string; responsible: string | null; status: string; agreed: number; received: number; refunded: number; outstanding: number }[]; members: string[] };

const propertyLabels: Record<string, string> = { one_room: "원룸", two_room: "투룸", apartment: "아파트", officetel: "오피스텔", retail: "상가", office: "사무실", two_bay: "투베이", three_room: "쓰리룸", owner_unit: "주인세대" };
const transactionLabels: Record<string, string> = { monthly_rent: "월세", jeonse: "전세", sale: "매매", to_be_confirmed: "확인 필요" };
const statusLabels: Record<string, string> = { in_progress: "진행", balance_due: "잔금 예정", completed: "계약 완료", cancelled: "해지", expired: "만료" };
const unwrap = <T,>(value: T | T[] | null | undefined) => Array.isArray(value) ? value[0] : value ?? null;

function labelFor(type: "property" | "transaction" | "status", value: string | null | undefined) { const source = type === "property" ? propertyLabels : type === "transaction" ? transactionLabels : statusLabels; return source[value ?? ""] ?? "미지정"; }
function addAggregate(target: Map<string, AggregateRow>, key: string, label: string, contractId: string, receipt: number, refund: number, staffNet: number) { const existing = target.get(key) ?? { key, label, contractCount: 0, receipts: 0, refunds: 0, net: 0, staffNet: 0 }; existing.receipts += receipt; existing.refunds += refund; existing.net += receipt - refund; existing.staffNet += staffNet; (existing as AggregateRow & { contractIds?: Set<string> }).contractIds ??= new Set<string>(); (existing as AggregateRow & { contractIds: Set<string> }).contractIds.add(contractId); existing.contractCount = (existing as AggregateRow & { contractIds: Set<string> }).contractIds.size; target.set(key, existing); }
function visibleAggregate(map: Map<string, AggregateRow>) { return [...map.values()].sort((a, b) => b.net - a.net || a.label.localeCompare(b.label, "ko")); }

export async function getRevenueAnalysis(filters: RevenueAnalysisFilters): Promise<{ context: Awaited<ReturnType<typeof getOrganizationContext>>; analysis: RevenueAnalysis | null }> {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, analysis: null };
  const supabase = createSupabaseServerClient();
  let entryQuery = supabase.from("contract_revenue_entries").select("contract_id, responsible_clerk_user_id, entry_type, entry_date, gross_amount, staff_share_amount, contracts!inner(id, contract_reference_number, transaction_type, status, responsible_clerk_user_id, listings!inner(property_type, units!inner(unit_number, buildings!inner(name))))").eq("organization_id", context.organizationId).gte("entry_date", filters.startDate).lte("entry_date", filters.endDate);
  if (context.role !== "admin") entryQuery = entryQuery.eq("responsible_clerk_user_id", context.clerkUserId); else if (filters.responsible) entryQuery = entryQuery.eq("responsible_clerk_user_id", filters.responsible);
  const [{ data: rawEntries }, { data: rawSettlements }, { data: rawMembers }] = await Promise.all([
    entryQuery,
    supabase.from("contract_revenue_settlements").select("contract_id, agreed_commission_amount, contracts!inner(id, contract_reference_number, status, responsible_clerk_user_id, transaction_type, listings!inner(property_type, units!inner(unit_number, buildings!inner(name))), contract_revenue_entries(entry_type, gross_amount))").eq("organization_id", context.organizationId),
    context.role === "admin" ? supabase.from("organization_members").select("clerk_user_id").eq("organization_id", context.organizationId).eq("status", "active").order("clerk_user_id") : Promise.resolve({ data: [] as { clerk_user_id: string }[] }),
  ]);

  const matches = (contract: any) => {
    const listing = unwrap(contract?.listings); const responsible = contract?.responsible_clerk_user_id ?? null;
    return (!filters.propertyType || listing?.property_type === filters.propertyType) && (!filters.transactionType || contract?.transaction_type === filters.transactionType) && (!filters.contractStatus || contract?.status === filters.contractStatus) && (context.role === "admin" || responsible === context.clerkUserId) && (!filters.responsible || responsible === filters.responsible);
  };
  const responsible = new Map<string, AggregateRow>(); const property = new Map<string, AggregateRow>(); const transaction = new Map<string, AggregateRow>(); const month = new Map<string, AggregateRow>(); const contractIds = new Set<string>();
  let receipts = 0; let refunds = 0; let staffNet = 0;
  for (const item of rawEntries ?? []) {
    const contract = unwrap((item as any).contracts); if (!matches(contract)) continue;
    const isReceipt = item.entry_type === "receipt"; const receipt = isReceipt ? Number(item.gross_amount) : 0; const refund = isReceipt ? 0 : Number(item.gross_amount); const signedStaff = (isReceipt ? 1 : -1) * Number(item.staff_share_amount); const listing = unwrap(contract.listings); const owner = item.responsible_clerk_user_id || "unassigned"; const monthKey = item.entry_date.slice(0, 7);
    receipts += receipt; refunds += refund; staffNet += signedStaff; contractIds.add(item.contract_id);
    addAggregate(responsible, owner, owner === "unassigned" ? "담당자 미지정" : owner, item.contract_id, receipt, refund, signedStaff);
    addAggregate(property, listing?.property_type ?? "unassigned", labelFor("property", listing?.property_type), item.contract_id, receipt, refund, signedStaff);
    addAggregate(transaction, contract.transaction_type ?? "unassigned", labelFor("transaction", contract.transaction_type), item.contract_id, receipt, refund, signedStaff);
    addAggregate(month, monthKey, monthKey, item.contract_id, receipt, refund, signedStaff);
  }
  const outstanding = (rawSettlements ?? []).flatMap((item: any) => { const contract = unwrap(item.contracts); if (!matches(contract)) return []; const entries = contract?.contract_revenue_entries ?? []; const received = entries.filter((entry: any) => entry.entry_type === "receipt").reduce((sum: number, entry: any) => sum + Number(entry.gross_amount), 0); const refunded = entries.filter((entry: any) => entry.entry_type === "refund").reduce((sum: number, entry: any) => sum + Number(entry.gross_amount), 0); const amount = Math.max(0, Number(item.agreed_commission_amount) - received + refunded); if (amount <= 0) return []; const listing = unwrap(contract?.listings); const unit = unwrap(listing?.units); const building = unwrap(unit?.buildings); return [{ contractId: item.contract_id, contractLabel: `C-${String(contract?.contract_reference_number ?? "").padStart(6, "0")} · ${building?.name ?? "건물"} ${unit?.unit_number ?? "호실"}`, responsible: contract?.responsible_clerk_user_id ?? null, status: labelFor("status", contract?.status), agreed: Number(item.agreed_commission_amount), received, refunded, outstanding: amount }]; }).sort((a, b) => b.outstanding - a.outstanding);
  const net = receipts - refunds; const visibleNet = context.role === "admin" ? net : staffNet;
  return { context, analysis: { role: context.role, filters, summary: { receipts, refunds, net: visibleNet, contractCount: contractIds.size, average: contractIds.size ? Math.round(visibleNet / contractIds.size) : 0 }, byResponsible: context.role === "admin" ? visibleAggregate(responsible) : [], byPropertyType: visibleAggregate(property), byTransactionType: visibleAggregate(transaction), byMonth: visibleAggregate(month).sort((a, b) => a.key.localeCompare(b.key)), outstanding, members: (rawMembers ?? []).map((member) => member.clerk_user_id) } };
}
