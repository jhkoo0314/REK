import { PageHeader } from "@/components/shared/page-header";
import { BuildingManagementWorkspace } from "@/features/listings/components/building-management-workspace";
import { getBuildingManagementData } from "@/features/listings/server/building-management";
import Link from "next/link";

export default async function BuildingsPage() {
  const data = await getBuildingManagementData();
  return <><PageHeader title="건물·호실" description="건물 공통 정보와 호실 고정 정보를 관리하고, 현재·과거 매물을 구분해 확인합니다." action={<Link className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" href="/listings/new">＋ 새 매물 등록</Link>} /><BuildingManagementWorkspace data={data} /></>;
}
