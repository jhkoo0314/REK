import { ChevronLeft, ChevronRight } from "lucide-react";

export function ListingPagination() {
  return <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-xs text-slate-500"><p>가공 매물 <span className="font-semibold text-slate-800">4개</span> 표시 중</p><div className="flex items-center gap-1.5"><button type="button" disabled className="rounded-lg border border-slate-200 bg-white p-1.5 opacity-40"><ChevronLeft className="size-4" /></button><span className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white">1</span><button type="button" disabled className="rounded-lg border border-slate-200 bg-white p-1.5 opacity-40"><ChevronRight className="size-4" /></button></div></footer>;
}
