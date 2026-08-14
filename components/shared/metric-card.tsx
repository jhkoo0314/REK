import { ArrowUpRight, type LucideIcon } from "lucide-react";

type MetricCardProps = { label: string; value: string; unit?: string; detail?: string; icon: LucideIcon; tone: "blue" | "violet" | "amber" | "emerald" };
const tones = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600" };

export function MetricCard({ label, value, unit = "건", detail, icon: Icon, tone }: MetricCardProps) {
  return <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}{unit ? <span className="ml-1 text-base font-medium text-slate-400">{unit}</span> : null}</p></div><span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span></div>{detail ? <p className="mt-5 flex items-center gap-1 text-xs text-slate-400"><ArrowUpRight className="size-3.5 text-emerald-500" /> {detail}</p> : null}</article>;
}
