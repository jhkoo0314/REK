import { FilePlus2 } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { ContractExpiryAlert } from "@/features/contracts/components/contract-expiry-alert";
import { ContractFilter } from "@/features/contracts/components/contract-filter";
import { contractMetrics } from "@/features/contracts/components/contract-data";
import { ContractMobileCards } from "@/features/contracts/components/contract-mobile-cards";
import { ContractTable } from "@/features/contracts/components/contract-table";

export default function ContractsPage() {
  return <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><PageHeader title="계약 관리" description="임대차 계약 현황과 만기 예정 일정을 확인합니다." action={<button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60"><FilePlus2 className="size-4" /> 신규 계약 작성</button>} /><ContractExpiryAlert /><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{contractMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section><section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-950">임대차 계약 목록</h2><p className="mt-1 text-xs text-slate-400">계약 처리 시 매물 상태 변경 여부는 반드시 별도로 확인합니다.</p></div><ContractFilter /></header><ContractTable /><ContractMobileCards /></section></main>;
}
