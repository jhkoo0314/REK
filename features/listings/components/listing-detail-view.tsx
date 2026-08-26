import { StatusBadge } from "@/components/shared/status-badge";
import type { ListingDetail } from "@/features/listings/types";
import Link from "next/link";
import type { ReactNode } from "react";

const statusLabels = { vacant: "공실", contract_in_progress: "계약 진행", contract_complete: "계약 완료", on_hold: "보류", ended: "종료" } as const;
const propertyTypeLabels = { one_room: "원룸", two_room: "투룸", two_bay: "투베이", three_room: "쓰리룸", owner_unit: "주인세대", apartment: "아파트", officetel: "오피스텔", retail: "상가", office: "사무실" } as const;
const transactionLabels = { monthly_rent: "월세", jeonse: "전세", to_be_confirmed: "확인 필요" } as const;
const photoLabels = { not_available: "사진 없음", available: "사진 있음", needs_confirmation: "사진 확인 필요" } as const;
function money(value: number | null) { return value === null ? "—" : `${value.toLocaleString("ko-KR")}만원`; }
function date(value: string | null) { return value ? value.replaceAll("-", ".") : "확인 필요"; }
function availabilityText(type: ListingDetail["availabilityType"], value: string | null) { return type === "immediate" ? "즉시 가능" : type === "date_specified" && value ? `${date(value)}부터 가능` : "확인 필요"; }

export function ListingDetailView({ listing }: { listing: ListingDetail }) {
  const address = [listing.roadAddress ?? listing.lotAddress, listing.addressDetail].filter(Boolean).join(" ") || "주소 미입력";
  const statusTone = listing.status === "vacant" ? "active" : listing.status === "contract_in_progress" ? "notice" : "neutral";
  return <div className="mx-auto max-w-5xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link className="text-xs font-bold text-[#655f59] underline underline-offset-4" href="/listings">← 매물 목록</Link><Link className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" href={`/listings/${listing.id}/edit`}>현재 매물 조건 수정</Link></div>
    <section className="rounded-xl border border-[#e5e1db] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs font-bold text-[#8b8279]">M-{String(listing.referenceNumber).padStart(6, "0")}</p><h2 className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">{listing.buildingName} {listing.unitNumber}</h2><p className="mt-2 text-sm text-[#7b7470]">{address}</p></div><StatusBadge tone={statusTone}>{statusLabels[listing.status]}</StatusBadge></div><div className="mt-6 grid gap-3 border-t border-[#eeeae5] pt-5 sm:grid-cols-3"><Summary label="방 구조" value={propertyTypeLabels[listing.propertyType]} /><Summary label="거래 방식" value={transactionLabels[listing.transactionType]} /><Summary label="입주 가능" value={availabilityText(listing.availabilityType, listing.availableDate)} /></div></section>
    <div className="grid gap-5 lg:grid-cols-2"><InfoCard title="가격 조건"><InfoRow label="보증금" value={money(listing.depositAmount)} /><InfoRow label="월세" value={listing.transactionType === "jeonse" ? "전세" : money(listing.monthlyRentAmount)} /><InfoRow label="관리비" value={money(listing.maintenanceFeeAmount)} /></InfoCard><InfoCard title="확인 상태"><InfoRow label="퇴실 예정일" value={date(listing.moveOutDate)} /><InfoRow label="사진 상태" value={photoLabels[listing.photoStatus]} /><InfoRow label="마지막 재확인일" value={date(listing.lastConfirmedDate)} /><InfoRow label="보유처" value={listing.holdingSource ?? "—"} /></InfoCard><InfoCard title="건물·호실 고정 정보"><InfoRow label="층" value={listing.floor === null ? "—" : `${listing.floor}층`} /><InfoRow label="방향" value={listing.direction || "—"} /><InfoRow label="고정 옵션" value={listing.options.length ? listing.options.join(", ") : "—"} /></InfoCard></div>
    <section className="rounded-xl border border-dashed border-[#ded8d0] bg-[#fcfbf9] px-5 py-4 text-xs text-[#77736e]"><b className="text-[#514b45]">연결 업무</b><p className="mt-1">상담·계약 연결 요약은 해당 기능을 구현한 뒤 이곳에 표시합니다. 연락처·출입 정보는 이 상세 화면에 표시하지 않습니다.</p></section>
  </div>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div><p className="text-[11px] font-bold text-[#8b8279]">{label}</p><p className="mt-1 text-sm font-extrabold">{value}</p></div>; }
function InfoCard({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-xl border border-[#e5e1db] bg-white"><h3 className="border-b border-[#eeeae5] px-5 py-4 text-sm font-extrabold">{title}</h3><dl className="divide-y divide-[#f0ece7] px-5">{children}</dl></section>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-5 py-3 text-sm"><dt className="text-[#7b7470]">{label}</dt><dd className="text-right font-bold">{value}</dd></div>; }
