import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ListingRegistrationForm } from "@/features/listings/components/listing-registration-form";
import { getRegistrationBuildingOptions } from "@/features/listings/server/listing-registration-queries";
import { findActiveOrganizationMember } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const member = await findActiveOrganizationMember(userId);
  if (!member) return null;
  const buildings = await getRegistrationBuildingOptions(member.organizationId);

  return <main className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><header className="mb-6 flex gap-3"><Link href="/listings" className="mt-0.5 rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="size-5" /></Link><div><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">신규 매물 등록</h1><p className="mt-2 text-sm text-slate-500">건물 → 호실 → 매물 조건 순서로 안전하게 등록합니다.</p></div></header><ListingRegistrationForm buildings={buildings} /></main>;
}
