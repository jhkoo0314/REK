"use client";

import { RotateCcw, Search } from "lucide-react";
import { useState } from "react";

export function ConsultationFilterBar() {
  const [status, setStatus] = useState("전체 상태");
  return <section className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40"><div className="flex min-w-[260px] flex-1 flex-wrap gap-3"><label className="relative min-w-[220px] flex-1"><span className="sr-only">상담 검색</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input placeholder="고객명 또는 희망 조건 검색" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-blue-400"><option>전체 상태</option><option>신규 문의</option><option>방문 예정</option><option>상담 진행</option></select></div><button type="button" onClick={() => setStatus("전체 상태")} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"><RotateCcw className="size-3.5" /> 초기화</button></section>;
}
