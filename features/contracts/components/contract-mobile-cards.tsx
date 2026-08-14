import { StatusBadge } from "@/components/shared/status-badge";
import { contractRows } from "./contract-data";

export function ContractMobileCards() {
  return <div className="divide-y divide-slate-100 md:hidden">{contractRows.map((row) => <article key={row.id} className={`p-5 ${row.urgent ? "bg-rose-50/25" : ""}`}><div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold text-slate-800">{row.property}</h2><p className="mt-1 text-xs text-slate-400">{row.type} · {row.tenant}</p></div><StatusBadge label={row.status} /></div><div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs"><div><p className="text-slate-400">계약 조건</p><p className="mt-1 font-mono font-semibold text-slate-700">{row.price}</p></div><div><p className="text-slate-400">남은 기간</p><p className={`mt-1 font-semibold ${row.urgent ? "text-rose-700" : "text-slate-700"}`}>{row.remaining}</p></div></div></article>)}</div>;
}
