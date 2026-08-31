"use server";

import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type StaffPermission = { clerkUserId: string; role: "admin" | "staff"; status: "active" | "inactive"; propertyContacts: boolean; unitAccess: boolean; consultationContacts: boolean; staffRevenueRate: number };
export async function getStaffPermissions() {
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { context, members: [] as StaffPermission[], errorMessage: null, revenueRateAvailable: false };
  if (context.role !== "admin") return { context, members: [] as StaffPermission[], errorMessage: "민감정보 권한 설정은 관리자만 할 수 있습니다.", revenueRateAvailable: false };
  const supabase = createSupabaseServerClient(); const [{ data: members, error: membersError }, { data: permissions, error: permissionError }, { data: rates, error: rateError }] = await Promise.all([supabase.from("organization_members").select("clerk_user_id, role, status").eq("organization_id", context.organizationId).order("role").order("clerk_user_id"), supabase.from("organization_member_sensitive_permissions").select("clerk_user_id, can_view_property_contacts, can_view_unit_access, can_view_consultation_contacts").eq("organization_id", context.organizationId), supabase.from("organization_member_revenue_rates").select("clerk_user_id, staff_share_rate").eq("organization_id", context.organizationId)]);
  if (membersError || permissionError) return { context, members: [] as StaffPermission[], errorMessage: "직원 권한 설정 정보를 불러오지 못했습니다. 관련 Dev DB migration 적용 여부를 확인해 주세요.", revenueRateAvailable: false };
  const permissionByUser = new Map((permissions ?? []).map((item) => [item.clerk_user_id, item])); const rateByUser = new Map((rates ?? []).map((item) => [item.clerk_user_id, Number(item.staff_share_rate)]));
  return { context, members: (members ?? []).map((member) => { const permission = permissionByUser.get(member.clerk_user_id); const isAdmin = member.role === "admin"; return { clerkUserId: member.clerk_user_id, role: member.role, status: member.status, propertyContacts: isAdmin || permission?.can_view_property_contacts === true, unitAccess: isAdmin || permission?.can_view_unit_access === true, consultationContacts: isAdmin || permission?.can_view_consultation_contacts === true, staffRevenueRate: rateByUser.get(member.clerk_user_id) ?? 50 }; }), errorMessage: rateError ? "기본 수수료 비율 DB 변경 파일(20260901000200) 적용이 필요합니다. 멤버 목록과 기존 권한은 계속 확인할 수 있습니다." : null, revenueRateAvailable: !rateError };
}

export async function saveStaffRevenueRate(values: { clerkUserId: string; staffRevenueRate: string }) { const context = await getOrganizationContext(); if (context.kind !== "ready" || context.role !== "admin") return { ok: false as const, message: "담당자 수수료 비율은 관리자만 설정할 수 있습니다." }; const rate = Number(values.staffRevenueRate); if (!Number.isFinite(rate) || rate < 0 || rate > 100) return { ok: false as const, message: "담당자 비율은 0~100 사이여야 합니다." }; const supabase = createSupabaseServerClient(); const { data: member } = await supabase.from("organization_members").select("id").eq("organization_id", context.organizationId).eq("clerk_user_id", values.clerkUserId).eq("status", "active").maybeSingle(); if (!member) return { ok: false as const, message: "활성 직원만 설정할 수 있습니다." }; const { error } = await supabase.from("organization_member_revenue_rates").upsert({ organization_id: context.organizationId, clerk_user_id: values.clerkUserId, staff_share_rate: rate, updated_by_clerk_user_id: context.clerkUserId }, { onConflict: "organization_id,clerk_user_id" }); if (error) return { ok: false as const, message: "담당자 수수료 비율을 저장하지 못했습니다. Dev DB migration 적용 상태를 확인해 주세요." }; revalidatePath("/members"); return { ok: true as const }; }

export async function saveStaffSensitivePermissions(values: { clerkUserId: string; propertyContacts: boolean; unitAccess: boolean; consultationContacts: boolean }) {
  const context = await getOrganizationContext(); if (context.kind !== "ready" || context.role !== "admin") return { ok: false as const, message: "민감정보 권한 설정은 관리자만 할 수 있습니다." };
  if (!values.clerkUserId.trim()) return { ok: false as const, message: "직원 정보를 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient(); const { data: member } = await supabase.from("organization_members").select("role").eq("organization_id", context.organizationId).eq("clerk_user_id", values.clerkUserId).maybeSingle();
  if (!member || member.role !== "staff") return { ok: false as const, message: "staff 멤버만 별도로 제한할 수 있습니다." };
  const { error } = await supabase.from("organization_member_sensitive_permissions").upsert({ organization_id: context.organizationId, clerk_user_id: values.clerkUserId, can_view_property_contacts: values.propertyContacts, can_view_unit_access: values.unitAccess, can_view_consultation_contacts: values.consultationContacts, updated_by_clerk_user_id: context.clerkUserId }, { onConflict: "organization_id,clerk_user_id" });
  if (error) return { ok: false as const, message: "권한 설정을 저장하지 못했습니다. 20260827000300 migration 적용 여부를 확인해 주세요." };
  revalidatePath("/members"); revalidatePath("/listings"); revalidatePath("/consultations"); revalidatePath("/dashboard"); return { ok: true as const };
}
