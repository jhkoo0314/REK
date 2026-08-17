import { createClient } from "@supabase/supabase-js";

export type ActiveOrganizationMember = {
  id: string;
  organizationId: string;
  displayName: string | null;
  role: "admin" | "staff";
};

const developmentSeedAdminMemberId = "10000000-0000-4000-8000-000000000010";

function getSupabaseSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase 개발 연결 정보가 없습니다.");
  }

  return { url, publishableKey };
}

/** 서버에서 Dev Supabase의 공개 연결 정보로 조회할 때만 사용합니다. */
export function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabaseSettings();

  return createClient(url, publishableKey);
}

/**
 * Dev에서는 활성 멤버십을 확인하는 서버 전용 조회에 사용합니다.
 * Production에서는 Clerk-Supabase Native Integration과 RLS를 함께 적용합니다.
 */
export async function findActiveOrganizationMember(clerkUserId: string): Promise<ActiveOrganizationMember | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, organization_id, display_name, role")
    .eq("clerk_user_id", clerkUserId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error("활성 조직 멤버 정보를 확인하지 못했습니다.");
  }

  if (!data || (data.role !== "admin" && data.role !== "staff")) {
    return null;
  }

  return {
    id: data.id,
    organizationId: data.organization_id,
    displayName: data.display_name,
    role: data.role,
  };
}

/**
 * 개발 전용 편의 기능입니다. 실제 로그인 계정이 하나인 현재 Dev 환경에서만,
 * 가공 조직 A 관리자 멤버십을 그 계정에 다시 연결합니다. Production에서는 실행되지 않습니다.
 */
export async function relinkDevelopmentSeedAdmin(clerkUserId: string) {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ clerk_user_id: clerkUserId, display_name: "가공 A 관리자", role: "admin", status: "active" })
    .eq("id", developmentSeedAdminMemberId);

  if (error) {
    throw new Error("개발용 관리자 연결을 바로잡지 못했습니다.");
  }

  return true;
}
