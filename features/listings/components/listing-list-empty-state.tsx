import { Building2, Plus } from "lucide-react";
import Link from "next/link";

export function ListingListEmptyState({ hasFilters }: { hasFilters: boolean }) {
  return <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm shadow-slate-200/30"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Building2 className="size-6" /></div><h2 className="mt-4 text-lg font-semibold text-slate-900">{hasFilters ? "조건에 맞는 매물이 없습니다." : "표시할 현재 매물이 없습니다."}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{hasFilters ? "검색어 또는 필터를 바꾸거나 전체 목록으로 돌아가 보세요." : "새 매물을 등록하면 이 조직의 목록에 표시됩니다. 종료된 매물은 현재 목록에서 제외됩니다."}</p>{hasFilters ? <Link href="/listings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">필터 초기화</Link> : <Link href="/listings/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"><Plus className="size-4" /> 신규 매물 등록</Link>}</section>;
}
