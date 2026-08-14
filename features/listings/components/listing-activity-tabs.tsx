"use client";

import { Megaphone, MessageSquareText, ScrollText } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "consultations", label: "상담 이력", count: "2건", icon: MessageSquareText },
  { id: "contracts", label: "계약 이력", count: "0건", icon: ScrollText },
  { id: "advertisements", label: "광고 현황", count: "2건", icon: Megaphone },
] as const;

export function ListingActivityTabs() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("consultations");
  return <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40"><div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/60 px-3">{tabs.map((tab) => { const Icon = tab.icon; const isActive = activeTab === tab.id; return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-semibold transition ${isActive ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}><Icon className="size-4" />{tab.label} ({tab.count})</button>; })}</div><div className="p-5 sm:p-6">{activeTab === "consultations" ? <div><h2 className="text-sm font-semibold text-slate-900">최근 상담 기록</h2><p className="mt-2 text-sm text-slate-500">실제 상담 기록은 아직 연결하지 않았습니다.</p></div> : activeTab === "contracts" ? <div><h2 className="text-sm font-semibold text-slate-900">과거 계약 기록</h2><p className="mt-2 text-sm text-slate-500">연결된 계약이 없습니다. 계약 완료 시 매물 상태는 자동으로 바뀌지 않습니다.</p></div> : <div><h2 className="text-sm font-semibold text-slate-900">광고 게시 현황</h2><p className="mt-2 text-sm text-slate-500">광고 채널별 상태는 광고 관리 화면에서 연결합니다.</p></div>}</div></section>;
}
