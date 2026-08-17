import { RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";

export function ListingListErrorState() {
  return <section className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/40 px-6 py-14 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"><TriangleAlert className="size-6" /></div><h2 className="mt-4 text-lg font-semibold text-slate-900">매물 목록을 불러오지 못했습니다.</h2><p className="mt-2 text-sm text-slate-600">잠시 후 다시 시도해 주세요. 계속되면 Supabase 개발 연결 정보를 확인해 주세요.</p><Link href="/listings" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><RefreshCw className="size-4" /> 다시 시도</Link></section>;
}
