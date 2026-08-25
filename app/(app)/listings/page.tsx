import { PageHeader } from "@/components/shared/page-header";
import { ListingWorkspace } from "@/features/listings/components/listing-workspace";

export default function ListingsPage() {
  return <><PageHeader title="매물 관리" description="상담에 제시할 재고를 검색하고 비교합니다." action={<button className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white">＋ 새 매물 등록</button>} /><ListingWorkspace /></>;
}
