import { PageHeader } from "@/components/shared/page-header";
import { BuildingExplorer } from "@/features/listings/components/building-explorer";

export default function BuildingsPage() {
  return <><PageHeader title="건물·호실" description="건물에서 호실, 현재 매물과 이력까지 확인합니다." action={<button className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white">＋ 새 매물 등록</button>} /><BuildingExplorer /></>;
}
