import { PageHeader } from "@/components/shared/page-header";
import { AdvertisingCostWorkspace } from "@/features/advertisements/components/advertising-cost-workspace";
import { AdvertisingCopyWorkspace } from "@/features/advertisements/components/advertising-copy-workspace";
import { getAdvertisingCopyTemplates } from "@/features/advertisements/server/advertising-copy-templates";
import { getMonthlyAdvertisingCosts } from "@/features/advertisements/server/advertising-costs";

function currentMonth() {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}`;
}

function validMonth(value: string | undefined) { return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : currentMonth(); }

export default async function AdvertisementsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month } = await searchParams; const billingMonth = validMonth(month); const { context, costs, errorMessage } = await getMonthlyAdvertisingCosts(billingMonth); const copyData = context.kind === "ready" ? await getAdvertisingCopyTemplates() : null;
  if (context.kind !== "ready") return <><PageHeader title="광고 관리" description="월별 플랫폼 광고비를 기록합니다." /><p className="rounded-xl border border-[#e5e1db] bg-white px-5 py-10 text-center text-sm text-[#7b7470]">업무 조직을 확인한 뒤 광고비를 관리할 수 있습니다.</p></>;
  return <><PageHeader title="광고 관리" description="플랫폼별 월 총 광고비와 유형별 고정 문구 템플릿을 관리합니다." /><div className="space-y-6"><AdvertisingCostWorkspace billingMonth={billingMonth} costs={costs} loadError={errorMessage} /><AdvertisingCopyWorkspace templates={copyData?.templates ?? []} role={context.role} loadError={copyData?.errorMessage ?? null} /></div></>;
}
