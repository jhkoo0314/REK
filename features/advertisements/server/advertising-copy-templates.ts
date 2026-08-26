"use server";

import { advertisingCopyTemplateSchema, templateIdSchema, type AdvertisingCopyTemplateInput, type PropertyGroup } from "@/features/advertisements/schemas/advertising-copy-template";
import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AdvertisingCopyTemplate = { id: string; propertyGroup: PropertyGroup; templateName: string; titleTemplate: string; bodyTemplate: string; isActive: boolean; updatedAt: string };
type Result = { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
function messageFor(error: { code?: string } | null) { if (error?.code === "42P01") return "문구 템플릿 저장 공간이 아직 준비되지 않았습니다. 20260827000200 migration을 Dev DB에 적용해 주세요."; if (error?.code === "23505") return "같은 유형에 같은 이름의 템플릿이 이미 있습니다."; return "문구 템플릿을 저장하지 못했습니다."; }

export async function getAdvertisingCopyTemplates() {
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { context, templates: [] as AdvertisingCopyTemplate[], errorMessage: null };
  const supabase = createSupabaseServerClient(); const { data, error } = await supabase.from("advertising_copy_templates").select("id, property_group, template_name, title_template, body_template, is_active, updated_at").eq("organization_id", context.organizationId).order("property_group").order("template_name");
  if (error) return { context, templates: [] as AdvertisingCopyTemplate[], errorMessage: messageFor(error) };
  return { context, templates: (data ?? []).map((item) => ({ id: item.id, propertyGroup: item.property_group as PropertyGroup, templateName: item.template_name, titleTemplate: item.title_template, bodyTemplate: item.body_template, isActive: item.is_active, updatedAt: item.updated_at })), errorMessage: null };
}

export async function saveAdvertisingCopyTemplate(values: AdvertisingCopyTemplateInput): Promise<Result> {
  const parsed = advertisingCopyTemplateSchema.safeParse(values); if (!parsed.success) return { ok: false, message: "템플릿 입력 내용을 확인해 주세요.", fieldErrors: parsed.error.flatten().fieldErrors };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const value = parsed.data; const supabase = createSupabaseServerClient(); const payload = { property_group: value.propertyGroup, template_name: value.templateName, title_template: value.titleTemplate, body_template: value.bodyTemplate, is_active: value.isActive, updated_by_clerk_user_id: context.clerkUserId };
  const result = value.templateId ? await supabase.from("advertising_copy_templates").update(payload).eq("id", value.templateId).eq("organization_id", context.organizationId) : await supabase.from("advertising_copy_templates").insert({ ...payload, organization_id: context.organizationId, created_by_clerk_user_id: context.clerkUserId });
  if (result.error) return { ok: false, message: messageFor(result.error) }; revalidatePath("/advertisements"); return { ok: true };
}

export async function deleteAdvertisingCopyTemplate(templateId: string): Promise<Result> {
  const parsed = templateIdSchema.safeParse(templateId); if (!parsed.success) return { ok: false, message: "삭제할 템플릿 정보를 확인할 수 없습니다." };
  const context = await getOrganizationContext(); if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient(); const { error } = await supabase.from("advertising_copy_templates").delete().eq("id", parsed.data).eq("organization_id", context.organizationId);
  if (error) return { ok: false, message: "문구 템플릿을 삭제하지 못했습니다." }; revalidatePath("/advertisements"); return { ok: true };
}
