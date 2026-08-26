import { PageHeader } from "@/components/shared/page-header";
import { ListingDetailState } from "@/features/listings/components/listing-detail-state";
import { ListingEditForm } from "@/features/listings/components/listing-edit-form";
import { getListingEditData } from "@/features/listings/server/listing-queries";

export default async function EditListingPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const header = <PageHeader title="현재 매물 조건 수정" description="일반 수정은 같은 현재 매물에 바로 반영됩니다." />;
  let result: Awaited<ReturnType<typeof getListingEditData>> | null = null;
  let errorMessage: string | undefined;
  try {
    result = await getListingEditData(listingId);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
  }
  if (errorMessage) return <>{header}<ListingDetailState title="수정 화면을 준비하지 못했습니다" description={errorMessage} /></>;
  if (result?.context.kind !== "ready" || !result.editData) return <>{header}<ListingDetailState title="수정할 현재 매물을 찾지 못했습니다" description="업무 조직과 매물 상태를 확인해 주세요." /></>;
  return <>{header}<ListingEditForm editData={result.editData} /></>;
}
