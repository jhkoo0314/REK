import { PageHeader } from "@/components/shared/page-header";
import { ContractListingPicker } from "@/features/contracts/components/contract-listing-picker";
import { ContractRegistrationForm } from "@/features/contracts/components/contract-registration-form";
import { getContractRegistrationOptions } from "@/features/contracts/server/contract-registration";

export default async function NewContractPage({ searchParams }: { searchParams: Promise<{ sourceConsultation?: string; listingId?: string }> }) { const [{ sourceConsultation, listingId }, options] = await Promise.all([searchParams, getContractRegistrationOptions()]); return <><PageHeader title={listingId ? "새 계약 등록" : "계약할 매물 찾기"} description={listingId ? "선택한 실제 계약 매물의 일정·금액을 기록합니다." : "먼저 실제 계약 매물을 검색하고 선택합니다."} />{listingId ? <ContractRegistrationForm listings={options.listings} consultations={options.consultations} sourceConsultationId={sourceConsultation} selectedListingId={listingId} /> : <ContractListingPicker listings={options.listings} sourceConsultationId={sourceConsultation} />}</>; }
