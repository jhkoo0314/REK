"use server";

import { advertisingCostSchema, platformFromInput, type AdvertisingCostInput } from "@/features/advertisements/schemas/advertising-cost";
import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AdvertisingCostItem = { id: string; platform: string; amount: number; memo: string | null; updatedAt: string };
export type AdvertisingCostSaveResult = { ok: true; mode: "created" | "updated" } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
function billingMonthDate(billingMonth: string) { return `${billingMonth}-01`; }
function databaseMessage(error: { code?: string; message?: string } | null, action: "load" | "save" | "delete") { if (error?.code === "42P01") return "광고비 저장 공간이 아직 준비되지 않았습니다. 20260827000100 migration을 Dev DB에 적용해 주세요."; if (error?.code === "23505") return "같은 월·플랫폼 광고비를 저장하지 못했습니다. 다시 시도해 주세요."; if (action === "load") return "광고비를 불러오지 못했습니다."; if (action === "delete") return "광고비 기록을 삭제하지 못했습니다."; return "광고비를 저장하지 못했습니다."; }

export async function getMonthlyAdvertisingCosts(billingMonth: string) {
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { context, costs: [] as AdvertisingCostItem[], errorMessage: null };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("monthly_advertising_costs").select("id, platform, amount, memo, updated_at").eq("organization_id", context.organizationId).eq("billing_month", billingMonthDate(billingMonth)).order("platform");
  if (error) return { context, costs: [] as AdvertisingCostItem[], errorMessage: databaseMessage(error, "load") };
  return { context, costs: (data ?? []).map((item) => ({ id: item.id, platform: item.platform, amount: item.amount, memo: item.memo, updatedAt: item.updated_at })), errorMessage: null };
}

export async function saveMonthlyAdvertisingCost(values: AdvertisingCostInput): Promise<AdvertisingCostSaveResult> {
  const parsed = advertisingCostSchema.safeParse(values); if (!parsed.success) return { ok: false, message: "입력 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const value = parsed.data; const platform = platformFromInput(value); const supabase = createSupabaseServerClient(); const billingMonth = billingMonthDate(value.billingMonth);
  const { data: sameMonthCosts, error: existingError } = await supabase.from("monthly_advertising_costs").select("id, platform").eq("organization_id", context.organizationId).eq("billing_month", billingMonth);
  if (existingError) return { ok: false, message: databaseMessage(existingError, "save") };
  const existing = (sameMonthCosts ?? []).find((item) => item.platform.toLocaleLowerCase("ko-KR") === platform.toLocaleLowerCase("ko-KR"));
  const payload = { platform, amount: Number(value.amount), memo: value.memo || null, updated_by_clerk_user_id: context.clerkUserId };
  const result = existing ? await supabase.from("monthly_advertising_costs").update(payload).eq("id", existing.id).eq("organization_id", context.organizationId) : await supabase.from("monthly_advertising_costs").insert({ ...payload, organization_id: context.organizationId, billing_month: billingMonth, created_by_clerk_user_id: context.clerkUserId });
  if (result.error) return { ok: false, message: databaseMessage(result.error, "save") };
  revalidatePath("/advertisements"); return { ok: true, mode: existing ? "updated" : "created" };
}

export async function deleteMonthlyAdvertisingCost(costId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient(); const { error } = await supabase.from("monthly_advertising_costs").delete().eq("id", costId).eq("organization_id", context.organizationId);
  if (error) return { ok: false, message: databaseMessage(error, "delete") }; revalidatePath("/advertisements"); return { ok: true };
}
