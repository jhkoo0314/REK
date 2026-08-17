import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ListingFilterPanel } from "@/features/listings/components/listing-filter-panel";
import { ListingListEmptyState } from "@/features/listings/components/listing-list-empty-state";
import { ListingListErrorState } from "@/features/listings/components/listing-list-error-state";
import { ListingMobileCards } from "@/features/listings/components/listing-mobile-cards";
import { ListingPagination } from "@/features/listings/components/listing-pagination";
import { ListingTable } from "@/features/listings/components/listing-table";
import { getCurrentListings, parseListingListFilters } from "@/features/listings/server/listing-queries";
import { findActiveOrganizationMember } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ListingsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const { userId } = await auth();
  const filters = parseListingListFilters(await searchParams);
  const hasFilters = Object.keys(filters).length > 0;

  if (!userId) return null;

  try {
    const member = await findActiveOrganizationMember(userId);

    if (!member) return null;

    const listings = await getCurrentListings(member.organizationId, filters);

    return <main className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><PageHeader title="매물 관리" description="로그인한 사용자의 조직에 등록된 현재 매물입니다." badge={<span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{hasFilters ? "검색 결과" : "현재 매물"} {listings.length}개</span>} action={<Link href="/listings/new" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"><Plus className="size-4" /> 신규 매물 등록</Link>} /><ListingFilterPanel filters={filters} />{listings.length === 0 ? <ListingListEmptyState hasFilters={hasFilters} /> : <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-950">매물 목록</h2><p className="mt-1 text-xs text-slate-400">목록에는 연락처·계좌·출입 정보 같은 민감 정보를 표시하지 않습니다.</p></div><ListingTable listings={listings} /><ListingMobileCards listings={listings} /><ListingPagination count={listings.length} /></section>}</main>;
  } catch {
    return <main className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><PageHeader title="매물 관리" description="로그인한 사용자의 조직에 등록된 현재 매물입니다." action={<Link href="/listings/new" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"><Plus className="size-4" /> 신규 매물 등록</Link>} /><ListingFilterPanel filters={filters} /><ListingListErrorState /></main>;
  }
}
