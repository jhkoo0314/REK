import { ArrowLeft, Copy, FilePenLine } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { listingDetails } from "./listing-detail-data";

export function ListingDetailHeader() {
  return <header className="mb-6 flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><Link href="/listings" className="mt-0.5 rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="size-5" /></Link><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">{listingDetails.building} {listingDetails.unit}</h1><StatusBadge label="공실" /><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">광고 중</span></div><p className="mt-2 text-sm text-slate-500">{listingDetails.address} · 가공 데이터 미리보기</p></div></div><div className="flex flex-wrap gap-2"><button type="button" className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"><Copy className="size-3.5" /> 브리핑 복사</button><button type="button" disabled className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white opacity-60"><FilePenLine className="size-3.5" /> 정보 수정</button></div></header>;
}
