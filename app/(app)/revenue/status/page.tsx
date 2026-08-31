import { PageHeader } from "@/components/shared/page-header";
import { RevenueAnalysisWorkspace } from "@/features/revenue/components/revenue-analysis-workspace";
import { getRevenueAnalysis, type RevenueAnalysisFilters } from "@/features/revenue/server/revenue-analysis";

const validDate = (value: string | undefined, fallback: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
const today = new Date().toISOString().slice(0, 10);
const firstDay = `${today.slice(0, 7)}-01`;
export default async function RevenueStatusPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) { const params = await searchParams; const filters: RevenueAnalysisFilters = { startDate: validDate(params.start, firstDay), endDate: validDate(params.end, today), responsible: params.responsible || undefined, propertyType: params.propertyType || undefined, contractStatus: params.contractStatus || undefined }; if (filters.endDate < filters.startDate) filters.endDate = filters.startDate; const { context, analysis } = await getRevenueAnalysis(filters); if (context.kind !== "ready" || !analysis) return <><PageHeader title="매출 현황" description="중개수수료 수납과 환불 현황을 조회합니다." /><p className="rounded-xl border bg-white p-10 text-center text-sm text-[#77736e]">업무 조직을 확인한 뒤 매출 현황을 볼 수 있습니다.</p></>; return <><PageHeader title="매출 현황" description={analysis.role === "admin" ? "담당자·매물 형태·월별 중개수수료 현황을 조회합니다." : "내가 담당한 계약의 내 매출 현황만 조회합니다."} /><RevenueAnalysisWorkspace analysis={analysis} /></>; }
