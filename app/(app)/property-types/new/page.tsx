import { PageHeader } from "@/components/shared/page-header";
import { PropertyTypeRegistrationPreview } from "@/features/property-types/components/property-type-registration-preview";

export default async function PropertyTypeRegistrationPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) { const { type } = await searchParams; return <><PageHeader title="유형별 신규 등록" description="확장 전 입력 항목을 확인하는 가공 화면입니다." /><PropertyTypeRegistrationPreview selected={type ?? "apartment"} /></>; }
