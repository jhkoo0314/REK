import { PageHeader } from "@/components/shared/page-header";
import { PropertyTypePreviewDetail } from "@/features/property-types/components/property-type-preview-detail";
import { getPropertyPreview } from "@/features/property-types/mock-data";
import Link from "next/link";

export default async function PropertyTypeDetailPage({ params }: { params: Promise<{ previewId: string }> }) { const { previewId } = await params; const item = getPropertyPreview(previewId); if (!item) return <><PageHeader title="유형별 매물 미리보기" description="가공 매물을 찾을 수 없습니다." /><Link href="/property-types" className="text-sm font-bold underline">목록으로</Link></>; return <><PageHeader title={`${item.typeLabel} 매물 상세`} description="가공 화면입니다. 실제 매물 데이터에는 영향을 주지 않습니다." /><PropertyTypePreviewDetail item={item} /></>; }
