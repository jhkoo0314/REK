import { PageHeader } from "@/components/shared/page-header";
import { ConsultationRegistrationForm } from "@/features/consultations/components/consultation-registration-form";
import { getConsultationRegistrationOptions } from "@/features/consultations/server/consultation-registration";

export default async function NewConsultationPage() {
  const options = await getConsultationRegistrationOptions();
  return <>
    <PageHeader title="새 상담 등록" description="고객 조건과 다음 행동을 기록합니다. 계약 진행·완료는 계약관리에서 처리합니다." />
    <ConsultationRegistrationForm options={options} />
  </>;
}
