import { PageHeader } from "@/components/shared/page-header";
import { ConsultationRegistrationPreview } from "@/features/consultations/components/consultation-registration-preview";

export default function NewConsultationPage() {
  return <>
    <PageHeader title="새 상담 등록" description="등록 화면과 입력 순서를 먼저 확인합니다. 현재는 저장되지 않습니다." />
    <ConsultationRegistrationPreview />
  </>;
}
