import { Building2, DoorOpen } from "lucide-react";

type ListingSelectionSummaryProps = { type: "building" | "unit" };

const content = {
  building: { icon: Building2, iconClass: "bg-blue-50 text-blue-600", title: "테스트빌", badge: "주거용", detail: "가공 주소 · 총 120세대", action: "건물 변경" },
  unit: { icon: DoorOpen, iconClass: "bg-emerald-50 text-emerald-600", title: "101동 402호", badge: "등록 가능", detail: "4층 · 남향 · 전용면적 59.8㎡", action: "호실 변경" },
};

export function ListingSelectionSummary({ type }: ListingSelectionSummaryProps) {
  const item = content[type];
  const Icon = item.icon;
  return <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"><div className="flex items-center gap-4"><span className={`grid size-12 place-items-center rounded-xl ${item.iconClass}`}><Icon className="size-6" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{item.title}</h2><span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${type === "unit" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.badge}</span></div><p className="mt-1 text-xs text-slate-500">{item.detail}</p></div></div><button type="button" disabled className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 opacity-60">{item.action}</button></section>;
}
