import { PageHeader } from "@/components/shared/page-header";
import { ListingRegistrationForm } from "@/features/listings/components/listing-registration-form";
import { ListingRegistrationState } from "@/features/listings/components/listing-registration-state";
import { getListingRegistrationOptions } from "@/features/listings/server/listing-registration";

export default async function NewListingPage() {
  let options: Awaited<ReturnType<typeof getListingRegistrationOptions>> | null = null;
  let errorMessage: string | undefined;
  try {
    options = await getListingRegistrationOptions();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
  }
  const header = <PageHeader title="새 매물 등록" description="건물·호실·현재 매물을 한 번에 등록합니다." />;
  if (!options) return <>{header}<ListingRegistrationState title="등록 준비를 완료하지 못했습니다" description={errorMessage ?? "잠시 후 다시 시도해 주세요."} /></>;
  return <>{header}<ListingRegistrationForm options={options} /></>;
}
