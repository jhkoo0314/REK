import { UserRoundPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { ConsultationFilterBar } from "@/features/consultations/components/consultation-filter-bar";
import { ConsultationMobileCards } from "@/features/consultations/components/consultation-mobile-cards";
import { consultationMetrics } from "@/features/consultations/components/consultation-data";
import { ConsultationTable } from "@/features/consultations/components/consultation-table";

export default function ConsultationsPage() {
  return <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><PageHeader title="상담 관리" description="문의, 매물 추천, 현장 방문 일정을 한 흐름으로 확인합니다." action={<button type="button" disabled className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60"><UserRoundPlus className="size-4" /> 신규 상담 등록</button>} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{consultationMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</section><div className="mt-6"><ConsultationFilterBar /></div><section className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-950">상담 목록</h2><p className="mt-1 text-xs text-slate-400">연락처 등 민감 정보는 목록에 표시하지 않습니다.</p></div><ConsultationTable /><ConsultationMobileCards /></section></main>;
}
