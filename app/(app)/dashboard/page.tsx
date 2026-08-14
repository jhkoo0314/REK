import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { overviewCards } from "@/features/dashboard/components/dashboard-data";
import { DashboardPageHeader } from "@/features/dashboard/components/dashboard-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { RecentListingsCard } from "@/features/dashboard/components/recent-listings-card";
import { TodayTasksCard } from "@/features/dashboard/components/today-tasks-card";

export default function DashboardPage() {
  return <main className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><DashboardPageHeader /><DashboardHero /><section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{overviewCards.map((card) => <MetricCard key={card.label} {...card} />)}</section><section className="mt-7 grid gap-7 xl:grid-cols-[0.95fr_1.35fr]"><TodayTasksCard /><RecentListingsCard /></section></main>;
}
