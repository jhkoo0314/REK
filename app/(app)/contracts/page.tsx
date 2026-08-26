import { PageHeader } from "@/components/shared/page-header";
import { ContractList } from "@/features/contracts/components/contract-list";
import { getContractList } from "@/features/contracts/server/contract-registration";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ sourceConsultation?: string }> }) { const { sourceConsultation } = await searchParams; if (sourceConsultation) redirect(`/contracts/new?sourceConsultation=${encodeURIComponent(sourceConsultation)}`); const { context, contracts } = await getContractList(); if (context.kind !== "ready") return <><PageHeader title="계약 관리" description="출처 상담과 실제 계약 매물을 구분해 관리합니다." /><p className="rounded-xl border border-[#e5e1db] bg-white px-5 py-10 text-center text-sm text-[#7b7470]">업무 조직을 확인한 뒤 계약을 관리할 수 있습니다.</p></>; return <><PageHeader title="계약 관리" description="출처 상담과 실제 계약 매물을 구분해 관리합니다." action={<Link href="/contracts/new" className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white">＋ 새 계약 등록</Link>} /><ContractList contracts={contracts} /></>; }
