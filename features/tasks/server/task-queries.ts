import { getOrganizationContext } from "@/lib/auth/organization-context";
import { getSensitiveAccess } from "@/lib/auth/sensitive-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TodayTask = { id: string; group: "지연" | "오늘" | "이번 주"; category: "상담" | "계약" | "퇴실"; title: string; detail: string; dueDate: string; href: string; customerPhone?: string; completed: boolean; sourceId: string; quickField?: "next_contact_date" | "official_contract_date" | "additional_deposit_due_date" | "balance_due_date" | "end_date"; consultationStatus?: "in_progress" | "on_hold" | "needs_confirmation" };
const dateText = (value: string) => value.replaceAll("-", ".");
export async function getTodayTasks(referenceDate: string) {
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { context, tasks: [] as TodayTask[] };
  const sensitiveAccess = await getSensitiveAccess(context);
  const supabase = createSupabaseServerClient(); const today = referenceDate; const week = new Date(`${referenceDate}T00:00:00`); week.setDate(week.getDate() + 7); const weekText = week.toISOString().slice(0, 10); const groupFor = (dueDate: string): TodayTask["group"] => dueDate < today ? "지연" : dueDate === today ? "오늘" : "이번 주";
  const [{ data: consultations }, { data: contracts }, { data: listings }] = await Promise.all([
    supabase.from("consultations").select("id, consultation_reference_number, customer_name, customer_phone, next_contact_date, status").eq("organization_id", context.organizationId).neq("status", "ended").not("next_contact_date", "is", null).lte("next_contact_date", weekText),
    supabase.from("contracts").select("id, contract_reference_number, status, listing_id, official_contract_date, additional_deposit_due_date, balance_due_date, end_date").eq("organization_id", context.organizationId).not("status", "in", "(cancelled,expired)"),
    supabase.from("listings").select("id, listing_reference_number, move_out_date, units!inner(unit_number, buildings!inner(name))").eq("organization_id", context.organizationId).eq("is_current", true).not("move_out_date", "is", null).gte("move_out_date", today).lte("move_out_date", weekText),
  ]);
  const listingIds = (contracts ?? []).map((item) => item.listing_id); const { data: contractListings } = listingIds.length ? await supabase.from("listings").select("id, listing_reference_number, units!inner(unit_number, buildings!inner(name))").eq("organization_id", context.organizationId).in("id", listingIds) : { data: [] };
  const label = (item: any) => { const unit = Array.isArray(item.units) ? item.units[0] : item.units; const building = Array.isArray(unit?.buildings) ? unit?.buildings[0] : unit?.buildings; return `M-${String(item.listing_reference_number).padStart(6, "0")} · ${building?.name ?? "건물"} ${unit?.unit_number ?? "호실"}`; };
  const listingMap = new Map((contractListings ?? []).map((item) => [item.id, label(item)])); const tasks: TodayTask[] = [];
  (consultations ?? []).forEach((item) => tasks.push({ id: `consultation:${item.id}:${item.next_contact_date}`, group: groupFor(item.next_contact_date!), category: "상담", title: `${item.customer_name ?? "이름 미입력"} · 다음 연락`, detail: `S-${String(item.consultation_reference_number).padStart(6, "0")} · ${dateText(item.next_contact_date!)}`, dueDate: item.next_contact_date!, href: `/consultations/${item.id}`, customerPhone: sensitiveAccess.consultationContacts ? item.customer_phone : undefined, completed: false, sourceId: item.id, quickField: "next_contact_date", consultationStatus: item.status }));
  (listings ?? []).forEach((item) => { const days = Math.round((new Date(`${item.move_out_date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000); tasks.push({ id: `moveout:${item.id}:${item.move_out_date}`, group: groupFor(item.move_out_date!), category: "퇴실", title: `${label(item)} · 퇴실 예정 확인`, detail: days === 0 ? "오늘 퇴실 예정" : `퇴실 예정 D-${days}`, dueDate: item.move_out_date!, href: `/listings/${item.id}`, completed: false, sourceId: item.id }); });
  const schedules: ["official_contract_date" | "additional_deposit_due_date" | "balance_due_date" | "end_date", string][] = [["official_contract_date", "정식 계약"], ["additional_deposit_due_date", "계약금 추가 수령"], ["balance_due_date", "잔금 예정"], ["end_date", "임대차 종료"]];
  (contracts ?? []).forEach((item) => schedules.forEach(([field, name]) => { const due = item[field] as string | null; if (due && due <= weekText) tasks.push({ id: `contract:${item.id}:${field}:${due}`, group: groupFor(due), category: "계약", title: `C-${String(item.contract_reference_number).padStart(6, "0")} · ${name}`, detail: `${listingMap.get(item.listing_id) ?? "연결 매물"} · ${dateText(due)}`, dueDate: due, href: `/contracts/${item.id}`, completed: false, sourceId: item.id, quickField: field }); }));
  const { data: completions } = await supabase.from("task_completions").select("task_key").eq("organization_id", context.organizationId).in("task_key", tasks.map((task) => task.id));
  const completedKeys = new Set((completions ?? []).map((item) => item.task_key));
  tasks.forEach((task) => { task.completed = completedKeys.has(task.id); });
  tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.category.localeCompare(b.category)); return { context, tasks };
}
