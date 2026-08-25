import { PageHeader } from "@/components/shared/page-header";
import { ConsultationList } from "@/features/consultations/components/consultation-list";
import { TaskInbox } from "@/features/tasks/components/task-inbox";

export default function ConsultationsPage() {
  return (
    <>
      <PageHeader description="리드부터 다음 행동, 매물 제안과 계약 결과까지 관리합니다." title="상담 관리" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
        <ConsultationList />
        <aside className="hidden xl:block"><TaskInbox compact /></aside>
      </div>
    </>
  );
}
