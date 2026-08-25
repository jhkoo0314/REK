import { AppShell } from "@/components/shared/app-shell";
import { auth } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  await auth.protect();

  return <AppShell>{children}</AppShell>;
}
