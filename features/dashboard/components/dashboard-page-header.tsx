import { ChevronRight } from "lucide-react";

export function DashboardPageHeader() {
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">대시보드</h1><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">가공 데이터 미리보기</span></div><p className="mt-2 text-sm text-slate-500">8월 15일 기준, 오늘의 업무 현황입니다.</p></div><button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-700">전체 업무 보기 <ChevronRight className="size-4" /></button></div>;
}
