import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ListingFilterPanel } from "@/features/listings/components/listing-filter-panel";
import { ListingMobileCards } from "@/features/listings/components/listing-mobile-cards";
import { ListingPagination } from "@/features/listings/components/listing-pagination";
import { ListingTable } from "@/features/listings/components/listing-table";

export default function ListingsPage() {
  return <main className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><PageHeader title="매물 관리" description="가공 데이터로 구성한 목록 화면입니다. 실제 매물 조회·수정은 P0 데이터 연결 단계에서 시작합니다." badge={<span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">4개 예시 매물</span>} action={<Link href="/listings/new" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"><Plus className="size-4" /> 신규 매물 등록</Link>} /><ListingFilterPanel /><section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-950">매물 목록</h2><p className="mt-1 text-xs text-slate-400">목록에는 연락처·계좌·출입 정보 같은 민감 정보를 표시하지 않습니다.</p></div><ListingTable /><ListingMobileCards /><ListingPagination /></section></main>;
}
