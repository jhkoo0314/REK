import Link from "next/link";

const groups = [
  { id: "all", label: "전체" }, { id: "residential", label: "원룸·투룸" }, { id: "apartment", label: "아파트" }, { id: "officetel", label: "오피스텔" }, { id: "commercial", label: "상가·사무실" },
] as const;

export function ListingPropertySwitcher({ selected }: { selected: string }) {
  return <div className="mb-4 flex flex-wrap gap-2">{groups.map((group) => <Link className={`rounded-full border px-3 py-1.5 text-xs font-bold ${group.id === selected ? "border-[#3e3a37] bg-[#3e3a37] text-white" : "border-[#ded7d0] bg-white text-[#655f59]"}`} href={group.id === "all" ? "/listings" : `/listings?type=${group.id}`} key={group.id}>{group.label}{group.id !== "all" && group.id !== "residential" && <span className="ml-1 text-[10px] opacity-75">미리보기</span>}</Link>)}</div>;
}
