import { StatusBadge } from "@/components/shared/status-badge";
import { consultationRows } from "./consultation-data";

export function ConsultationMobileCards() {
  return <div className="divide-y divide-slate-100 md:hidden">{consultationRows.map((row) => <article key={row.id} className="p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${row.accent}`}>{row.initials}</span><div><h2 className="text-sm font-semibold text-slate-800">{row.customer}</h2><p className="mt-1 text-xs text-slate-400">{row.category}</p></div></div><StatusBadge label={row.status} /></div><div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-700">{row.preference}</p><p className="mt-1 text-xs text-slate-400">{row.listing} · {row.schedule}</p></div></article>)}</div>;
}
