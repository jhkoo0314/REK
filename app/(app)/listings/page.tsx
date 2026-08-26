import { PageHeader } from "@/components/shared/page-header";
import { ListingWorkspace } from "@/features/listings/components/listing-workspace";
import { getListingList } from "@/features/listings/server/listing-queries";
import Link from "next/link";

type ListingsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const consultationId = typeof params.consultation === "string" ? params.consultation : undefined;
  const header = <PageHeader title="매물 관리" description="상담에 제시할 재고를 검색하고 비교합니다." action={<Link className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" href="/listings/new">＋ 새 매물 등록</Link>} />;
  let result: Awaited<ReturnType<typeof getListingList>> | null = null;
  let errorMessage: string | undefined;
  try {
    result = await getListingList(params);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
  }
  if (result) return <>{header}<ListingWorkspace context={result.context} filters={result.filters} listings={result.listings} consultationId={consultationId} /></>;
  return <>{header}<ListingWorkspace context={{ kind: "no-active-membership" }} filters={{ query: "", status: "active", transaction: "all", availability: "all", minDeposit: "", maxDeposit: "", holdingSource: "", photo: "all", confirmedBefore: "" }} listings={[]} errorMessage={errorMessage} /></>;
}
