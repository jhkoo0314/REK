import { PageHeader } from "@/components/shared/page-header";
import { ContractRegistrationForm } from "@/features/contracts/components/contract-registration-form";
import { getContractRegistrationOptions } from "@/features/contracts/server/contract-registration";

export default async function NewContractPage({ searchParams }: { searchParams: Promise<{ sourceConsultation?: string }> }) { const [{ sourceConsultation }, options] = await Promise.all([searchParams, getContractRegistrationOptions()]); return <><PageHeader title="새 계약 등록" description="실제 계약 매물과 일정·금액을 기록합니다." /><ContractRegistrationForm listings={options.listings} consultations={options.consultations} sourceConsultationId={sourceConsultation} /></>; }
