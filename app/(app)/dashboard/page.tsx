import { PageHeader } from "@/components/shared/page-header";
import { TaskInbox } from "@/features/tasks/components/task-inbox";
import { getTodayTasks } from "@/features/tasks/server/task-queries";

function koreaToday() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams; const referenceDate = /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") ? date! : koreaToday(); const { tasks } = await getTodayTasks(referenceDate);
  return <><PageHeader title="중요업무알림" description="오늘·지연된 업무를 확인하고 원래 기록으로 이동합니다." /><TaskInbox tasks={tasks} referenceDate={referenceDate} /></>;
}
