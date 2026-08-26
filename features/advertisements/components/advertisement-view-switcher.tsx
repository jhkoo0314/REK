import Link from "next/link";

const views = [{ id: "cost", label: "월별 광고비" }, { id: "copy", label: "광고 문구" }] as const;

export function AdvertisementViewSwitcher({ activeView }: { activeView: "cost" | "copy" }) {
  return <nav aria-label="광고 관리 업무 전환" className="flex w-fit rounded-lg border border-[#e5e1db] bg-white p-1">{views.map((view) => <Link key={view.id} href={`/advertisements?view=${view.id}`} className={`rounded-md px-4 py-2 text-xs font-bold ${activeView === view.id ? "bg-[#f3e4dc] text-[#8f4e36]" : "text-[#655f59] hover:bg-[#faf8f4]"}`}>{view.label}</Link>)}</nav>;
}
