import { PageHeader } from "@/components/shared/page-header";
import { AdvertisingCostWorkspace } from "@/features/advertisements/components/advertising-cost-workspace";
import { AdvertisingCopyWorkspace } from "@/features/advertisements/components/advertising-copy-workspace";
import { AdvertisementViewSwitcher } from "@/features/advertisements/components/advertisement-view-switcher";
import { getAdvertisingCopyTemplates } from "@/features/advertisements/server/advertising-copy-templates";
import { getMonthlyAdvertisingCosts } from "@/features/advertisements/server/advertising-costs";
import { getOrganizationContext } from "@/lib/auth/organization-context";

function currentMonth() {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" });
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}`;
}

function validMonth(value: string | undefined) { return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : currentMonth(); }
function validView(value: string | undefined): "cost" | "copy" { return value === "copy" ? "copy" : "cost"; }

export default async function AdvertisementsPage({ searchParams }: { searchParams: Promise<{ month?: string; view?: string }> }) {
  const { month, view } = await searchParams; const billingMonth = validMonth(month); const activeView = validView(view); const context = await getOrganizationContext();
  if (context.kind !== "ready") return <><PageHeader title="광고 관리" description="월별 플랫폼 광고비를 기록합니다." /><p className="rounded-xl border border-[#e5e1db] bg-white px-5 py-10 text-center text-sm text-[#7b7470]">업무 조직을 확인한 뒤 광고비를 관리할 수 있습니다.</p></>;
  const headerDescription = activeView === "cost" ? "플랫폼별 월 총 광고비를 기록해 향후 가성비 분석의 기준으로 사용합니다." : "매물 유형별 고정 템플릿에 확인한 값만 넣어 문구를 만듭니다.";
  if (activeView === "cost") { const { costs, errorMessage } = await getMonthlyAdvertisingCosts(billingMonth); return <><PageHeader title="광고 관리" description={headerDescription} /><div className="space-y-6"><AdvertisementViewSwitcher activeView={activeView} /><AdvertisingCostWorkspace billingMonth={billingMonth} costs={costs} loadError={errorMessage} /></div></>; }
  const copyData = await getAdvertisingCopyTemplates();
  return <><PageHeader title="광고 관리" description={headerDescription} /><div className="space-y-6"><AdvertisementViewSwitcher activeView={activeView} /><AdvertisingCopyWorkspace templates={copyData.templates} loadError={copyData.errorMessage} /></div></>;
}
