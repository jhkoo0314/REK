import { getOrganizationContext } from "@/lib/auth/organization-context";
import { getSensitiveAccess } from "@/lib/auth/sensitive-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getContractDetail(contractId: string) {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { context, contract: null };
  const sensitiveAccess = await getSensitiveAccess(context);
  const supabase = createSupabaseServerClient();
  const { data: contract, error } = await supabase.from("contracts").select("id, contract_reference_number, listing_id, source_consultation_id, transaction_type, contract_kind, brokerage_type, status, contract_started_date, official_contract_date, move_in_date, end_date, total_contract_deposit_amount, provisional_deposit_amount, additional_deposit_due_date, balance_amount, balance_due_date, note").eq("id", contractId).eq("organization_id", context.organizationId).maybeSingle();
  if (error || !contract) return { context, contract: null };
  const [{ data: listing }, { data: consultation }, { data: activities }] = await Promise.all([
    supabase.from("listings").select("id, listing_reference_number, units!inner(unit_number, buildings!inner(name))").eq("id", contract.listing_id).eq("organization_id", context.organizationId).maybeSingle(),
    contract.source_consultation_id ? supabase.from("consultations").select("id, consultation_reference_number, customer_name, customer_phone").eq("id", contract.source_consultation_id).eq("organization_id", context.organizationId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("contract_activities").select("id, activity_type, activity_date, note").eq("contract_id", contract.id).eq("organization_id", context.organizationId).order("activity_date", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  const unit = Array.isArray(listing?.units) ? listing?.units[0] : listing?.units; const building = Array.isArray(unit?.buildings) ? unit?.buildings[0] : unit?.buildings;
  return { context, contract: { ...contract, listingLabel: listing ? `M-${String(listing.listing_reference_number).padStart(6, "0")} · ${building?.name ?? "건물"} ${unit?.unit_number ?? "호실"}` : "연결 매물 확인 필요", sourceLabel: consultation ? `S-${String(consultation.consultation_reference_number).padStart(6, "0")} · ${consultation.customer_name ?? "이름 미입력"}${sensitiveAccess.consultationContacts ? ` · ${consultation.customer_phone}` : ""}` : null, activities: activities ?? [] } };
}
