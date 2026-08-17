import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shared/app-shell";
import { MembershipAccessState } from "@/features/members/components/membership-access-state";
import { findActiveOrganizationMember, relinkDevelopmentSeedAdmin } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  try {
    let member = await findActiveOrganizationMember(userId as string);

    if (!member && await relinkDevelopmentSeedAdmin(userId as string)) {
      member = await findActiveOrganizationMember(userId as string);
    }

    if (!member) {
      return <MembershipAccessState type="not-member" clerkUserId={userId as string} />;
    }

    return <AppShell>{children}</AppShell>;
  } catch {
    return <MembershipAccessState type="lookup-error" clerkUserId={userId as string} />;
  }
}
