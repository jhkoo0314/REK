import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OrganizationContext =
  | { kind: "ready"; organizationId: string; organizationName: string; clerkUserId: string; role: "admin" | "staff" }
  | { kind: "no-active-organization" }
  | { kind: "no-active-membership" };

export async function getOrganizationContext(): Promise<OrganizationContext> {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return { kind: "no-active-organization" };
  }

  const supabase = createSupabaseServerClient();
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("clerk_organization_id", orgId)
    .maybeSingle();

  if (organizationError) {
    if (organizationError.code === "42501") {
      throw new Error("Dev DB 테이블 접근 권한이 없습니다. 20260826000400 grant migration을 적용해 주세요.");
    }
    throw new Error("조직 정보를 확인하지 못했습니다.");
  }

  if (!organization) {
    return { kind: "no-active-membership" };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("organization_members")
    .select("role, status")
    .eq("organization_id", organization.id)
    .eq("clerk_user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw new Error("조직 멤버십을 확인하지 못했습니다.");
  }

  if (!membership || (membership.role !== "admin" && membership.role !== "staff")) {
    return { kind: "no-active-membership" };
  }

  return {
    kind: "ready",
    organizationId: organization.id,
    organizationName: organization.name,
    clerkUserId: userId,
    role: membership.role,
  };
}
