import { PageHeader } from "@/components/shared/page-header";
import { ListingDetailState } from "@/features/listings/components/listing-detail-state";
import { ListingDetailView } from "@/features/listings/components/listing-detail-view";
import { getListingDetail } from "@/features/listings/server/listing-queries";

export default async function ListingDetailPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const header = <PageHeader title="매물 상세" description="현재 조건을 확인하고 필요한 경우 수정합니다." />;
  let result: Awaited<ReturnType<typeof getListingDetail>> | null = null;
  let errorMessage: string | undefined;
  try {
    result = await getListingDetail(listingId);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
  }
  if (errorMessage) return <>{header}<ListingDetailState title="매물 상세를 불러오지 못했습니다" description={errorMessage} /></>;
  if (result?.context.kind === "no-active-organization") return <>{header}<ListingDetailState title="선택된 업무 조직이 없습니다" description="업무 조직을 선택한 뒤 다시 확인해 주세요." /></>;
  if (result?.context.kind === "no-active-membership") return <>{header}<ListingDetailState title="개발용 업무 조직 연결이 아직 없습니다" description="현재 조직의 멤버십을 확인한 뒤 다시 시도해 주세요." /></>;
  if (!result?.listing) return <>{header}<ListingDetailState title="현재 매물을 찾지 못했습니다" description="삭제되었거나 다른 조직의 매물일 수 있습니다." /></>;
  return <>{header}<ListingDetailView listing={result.listing} /></>;
}
