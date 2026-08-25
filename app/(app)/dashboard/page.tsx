import { PageHeader } from "@/components/shared/page-header";
import { TaskInbox } from "@/features/tasks/components/task-inbox";

export default function DashboardPage() {
  return <><PageHeader title="오늘 예정 업무" description="오늘·지연된 업무를 확인하고 원래 기록으로 이동합니다." /><TaskInbox /></>;
}
