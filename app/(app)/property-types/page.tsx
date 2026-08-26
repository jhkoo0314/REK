import { PageHeader } from "@/components/shared/page-header";
import { PropertyTypePreviewWorkspace } from "@/features/property-types/components/property-type-preview-workspace";
import Link from "next/link";

export default async function PropertyTypesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) { const { type } = await searchParams; return <><PageHeader title="유형별 관리 미리보기" description="아파트·오피스텔·상가·사무실 확장 시의 화면과 업무 연결을 가공 데이터로 확인합니다." action={<Link className="rounded-lg border border-[#3e3a37] px-4 py-2.5 text-xs font-bold text-[#3e3a37]" href="/listings">현재 매물 관리</Link>} /><PropertyTypePreviewWorkspace selected={type ?? "all"} /></>; }
