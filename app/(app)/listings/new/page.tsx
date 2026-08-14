import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { ListingDetailsForm } from "@/features/listings/components/listing-details-form";
import { ListingRegistrationStepper } from "@/features/listings/components/listing-registration-stepper";
import { ListingSelectionSummary } from "@/features/listings/components/listing-selection-summary";

export default function NewListingPage() {
  return <main className="mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><Link href="/listings" className="mt-0.5 rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="size-5" /></Link><div><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">신규 매물 등록</h1><p className="mt-2 text-sm text-slate-500">건물 → 호실 → 매물 조건 순서로 안전하게 등록합니다.</p></div></div><div className="flex gap-2"><Link href="/listings" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">취소</Link><button type="button" disabled title="DB 연결 전에는 저장할 수 없습니다." className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60"><Save className="size-4" /> 매물 등록 완료</button></div></header><div className="space-y-5"><ListingRegistrationStepper /><ListingSelectionSummary type="building" /><ListingSelectionSummary type="unit" /><ListingDetailsForm /><p className="rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">현재는 승인된 디자인을 확인하는 단계입니다. 저장 버튼과 중복 확인은 Dev DB 연결 후 실제 업무 규칙에 맞춰 구현합니다.</p></div></main>;
}
