import type { OrganizationContext } from "@/lib/auth/organization-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SensitiveAccess = { propertyContacts: boolean; unitAccess: boolean; consultationContacts: boolean };
const none: SensitiveAccess = { propertyContacts: false, unitAccess: false, consultationContacts: false };
const all: SensitiveAccess = { propertyContacts: true, unitAccess: true, consultationContacts: true };

export async function getSensitiveAccess(context: OrganizationContext): Promise<SensitiveAccess> {
  if (context.kind !== "ready") return none;
  if (context.role === "admin") return all;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("organization_member_sensitive_permissions").select("can_view_property_contacts, can_view_unit_access, can_view_consultation_contacts").eq("organization_id", context.organizationId).eq("clerk_user_id", context.clerkUserId).maybeSingle();
  if (error || !data) return none;
  return { propertyContacts: data.can_view_property_contacts, unitAccess: data.can_view_unit_access, consultationContacts: data.can_view_consultation_contacts };
}
