import { PageHeader } from "@/components/shared/page-header";
import { ConsultationList } from "@/features/consultations/components/consultation-list";
import Link from "next/link";

export default function ConsultationsPage() {
  return (
    <>
      <PageHeader
        description="리드부터 다음 행동, 매물 제안과 계약 결과까지 관리합니다."
        title="상담 관리"
        action={<Link className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" href="/consultations/new">＋ 새 상담 등록</Link>}
      />
      <ConsultationList />
    </>
  );
}
