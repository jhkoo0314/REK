"use server";

import { getOrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTaskCompletion(taskKey: string, completed: boolean) {
  const context = await getOrganizationContext();
  if (context.kind !== "ready") return { ok: false, message: "활성 조직 멤버십을 확인할 수 없습니다." };
  const supabase = createSupabaseServerClient();
  const result = completed
    ? await supabase.from("task_completions").upsert({ organization_id: context.organizationId, task_key: taskKey, completed_by_clerk_user_id: context.clerkUserId }, { onConflict: "organization_id,task_key" })
    : await supabase.from("task_completions").delete().eq("organization_id", context.organizationId).eq("task_key", taskKey);
  if (result.error) return { ok: false, message: "업무 완료 상태를 저장하지 못했습니다. 20260826001800 migration 적용 여부를 확인해 주세요." };
  revalidatePath("/dashboard");
  return { ok: true };
}
