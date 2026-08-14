"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

export function ContractFilter() {
  const [filter, setFilter] = useState("전체 상태");
  return <div className="flex items-center gap-2"><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400"><option>전체 상태</option><option>유효 계약</option><option>만기 임박</option><option>재계약 확정</option></select><button type="button" onClick={() => setFilter("전체 상태")} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" aria-label="필터 초기화"><RotateCcw className="size-4" /></button></div>;
}
