import { PageHeader } from "@/components/shared/page-header";
import { ConsultationList } from "@/features/consultations/components/consultation-list";

export default function ConsultationsPage() {
  return (
    <>
      <PageHeader description="리드부터 다음 행동, 매물 제안과 계약 결과까지 관리합니다." title="상담 관리" />
      <ConsultationList />
    </>
  );
}
