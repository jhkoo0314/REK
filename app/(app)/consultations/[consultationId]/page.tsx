import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { consultations, listings } from "@/lib/mock-data/workspace";
import { StoredConsultationDetail } from "@/features/consultations/components/stored-consultation-detail";
import { getConsultationRegistrationOptions, getStoredConsultationDetail } from "@/features/consultations/server/consultation-registration";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ConsultationDetailPage({ params }: { params: Promise<{ consultationId: string }> }) {
  const { consultationId } = await params;
  const stored = await getStoredConsultationDetail(consultationId);
  if (stored.consultation) {
    const options = await getConsultationRegistrationOptions();
    return <StoredConsultationDetail consultation={stored.consultation} listingOptions={options.listings} />;
  }
  const consultation = consultations.find((item) => item.id === consultationId);
  if (!consultation) notFound();
  const proposed = listings.filter((item) => consultation.listingIds.includes(item.id));
  const query = new URLSearchParams({ consultation: consultation.id, area: consultation.area, layout: consultation.layout, budget: consultation.budget });
  return <><PageHeader title="상담 상세" description={`${consultation.id} · ${consultation.source} 문의`} action={<button className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white">상담 이력 추가</button>} /><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]"><section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><div className="p-5"><StatusBadge tone="late">{consultation.stage}</StatusBadge><h2 className="mt-3 text-xl font-extrabold tracking-[-0.06em]">{consultation.customerName} <span className="font-mono text-xs font-normal text-[#77736e]">{consultation.id}</span></h2><p className="mt-1 text-xs text-[#77736e]">다음 연락 {consultation.nextAction} · 담당 {consultation.owner}</p></div><div className="border-t border-[#e5e1db] p-5"><h3 className="font-bold">희망 조건</h3><div className="mt-3 grid gap-2 sm:grid-cols-3">{[["희망 지역", consultation.area], ["예산", consultation.budget], ["방 형태", consultation.layout], ["입주 희망", consultation.moveIn], ["유입 경로", consultation.source], ["담당자", consultation.owner]].map(([label, value]) => <div className="rounded-lg bg-[#faf9f7] p-3 text-[11px] text-[#77736e]" key={label}>{label}<b className="mt-1 block text-xs text-[#292827]">{value}</b></div>)}</div></div><div className="border-t border-[#e5e1db] p-5"><div className="flex items-center justify-between"><h3 className="font-bold">제안·관심 매물</h3><Link className="rounded-lg border border-[#3e3a37] px-3 py-2 text-xs font-bold text-[#3e3a37]" href={`/listings?${query}`}>조건으로 매물 찾기</Link></div><div className="mt-3 space-y-2">{proposed.map((listing) => <div className="rounded-lg border border-[#e5e1db] p-3" key={listing.id}><b className="text-sm">{listing.building} {listing.unit}</b><span className="ml-2 font-mono text-[11px] text-[#3e3a37]">{listing.terms}</span><p className="mt-1 text-[11px] text-[#77736e]">{listing.layout} · {listing.status} · {listing.available}</p></div>)}</div></div><div className="border-t border-[#e5e1db] p-5"><h3 className="font-bold">상담 타임라인</h3><div className="mt-4 space-y-4 border-l border-[#e5e1db] pl-4 text-xs"><div><b>08/25 · 전화 상담 완료</b><p className="mt-1 text-[#77736e]">주차 가능 여부와 9월 초 입주 가능 매물을 다시 안내하기로 했습니다.</p></div><div><b>08/23 · 매물 2건 제안</b><p className="mt-1 text-[#77736e]">대성빌 302호와 그린타운 202호를 관심 매물로 연결했습니다.</p></div><div><b>08/21 · 신규 전화 문의 등록</b><p className="mt-1 text-[#77736e]">배방읍 투룸, 보증금 500 / 월세 55 내외 조건입니다.</p></div></div></div></section><aside className="space-y-4"><section className="rounded-xl border border-[#e5e1db] bg-white p-5"><h3 className="font-bold">계약 결과</h3><p className="mt-2 text-xs text-[#77736e]">아직 연결된 계약이 없습니다.</p><Link className="mt-4 inline-block rounded-lg border border-[#3e3a37] px-3 py-2 text-xs font-bold text-[#3e3a37]" href={`/contracts?consultation=${consultation.id}`}>계약 생성</Link></section></aside></div></>;
}
