import { PageHeader } from "@/components/shared/page-header";
import { ListingWorkspace } from "@/features/listings/components/listing-workspace";
import { ListingPropertySwitcher } from "@/features/listings/components/listing-property-switcher";
import { getListingList } from "@/features/listings/server/listing-queries";
import { PropertyTypePreviewWorkspace } from "@/features/property-types/components/property-type-preview-workspace";
import Link from "next/link";

type ListingsPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const consultationId = typeof params.consultation === "string" ? params.consultation : undefined;
  const type = typeof params.type === "string" ? params.type : "all";
  const mockType = type === "apartment" || type === "officetel" || type === "commercial";
  const header = <PageHeader title="매물 관리" description={mockType ? "확장 유형의 가공 매물을 목록·상세·등록 흐름으로 확인합니다." : "상담에 제시할 재고를 검색하고 비교합니다."} action={<Link className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" href={mockType ? `/listings/new?type=${type}` : "/listings/new"}>＋ 새 매물 등록</Link>} />;
  if (mockType) return <>{header}<PropertyTypePreviewWorkspace selected={type} basePath="/listings" /></>;
  let result: Awaited<ReturnType<typeof getListingList>> | null = null;
  let errorMessage: string | undefined;
  try {
    result = await getListingList(params);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
  }
  if (result) return <>{header}<ListingPropertySwitcher selected={type} /><ListingWorkspace context={result.context} filters={result.filters} listings={result.listings} consultationId={consultationId} /></>;
  return <>{header}<ListingPropertySwitcher selected={type} /><ListingWorkspace context={{ kind: "no-active-membership" }} filters={{ query: "", scope: "current", status: "all", propertyType: "all", transaction: "all", availability: "all", receivedStart: "", receivedEnd: "", minDeposit: "", maxDeposit: "", minMonthlyRent: "", maxMonthlyRent: "", holdingSource: "" }} listings={[]} errorMessage={errorMessage} /></>;
}
