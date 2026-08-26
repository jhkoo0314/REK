"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { ListingAccessPasswordButton } from "@/features/listings/components/listing-access-password-button";
import { ListingQuickUpdateButton } from "@/features/listings/components/listing-quick-update-button";
import type { ListingFilters, ListingListItem } from "@/features/listings/types";
import type { OrganizationContext } from "@/lib/auth/organization-context";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const statusLabels = { vacant: "공실", contract_in_progress: "계약 진행", contract_complete: "계약 완료", on_hold: "보류", ended: "종료" } as const;
const propertyTypeLabels = { one_room: "원룸", two_room: "투룸", two_bay: "투베이", three_room: "쓰리룸", owner_unit: "주인세대", apartment: "아파트", officetel: "오피스텔", retail: "상가", office: "사무실" } as const;
const transactionLabels = { monthly_rent: "월세", jeonse: "전세", sale: "매매", to_be_confirmed: "확인 필요" } as const;
const photoLabels = { not_available: "사진 없음", available: "사진 있음", needs_confirmation: "사진 확인 필요" } as const;

function money(value: number | null) { return value === null ? "—" : value.toLocaleString("ko-KR"); }
function listingNumber(value: number) { return `M-${String(value).padStart(6, "0")}`; }
function availableText(type: ListingListItem["availabilityType"], value: string | null) { return type === "immediate" ? "즉시 가능" : type === "date_specified" && value ? value.replaceAll("-", ".") : "입주 조건 확인 필요"; }
function priceTerms(listing: ListingListItem) {
  if (listing.transactionType === "sale") return `매매 ${money(listing.depositAmount)}`;
  if (listing.transactionType === "jeonse") return `${money(listing.depositAmount)} / 전세`;
  if (listing.transactionType === "monthly_rent") return `${money(listing.depositAmount)} / ${money(listing.monthlyRentAmount)}`;
  return "조건 확인 필요";
}

type ListingWorkspaceProps = { context: OrganizationContext; filters: ListingFilters; listings: ListingListItem[]; errorMessage?: string; consultationId?: string };

export function ListingWorkspace({ context, filters, listings, errorMessage, consultationId }: ListingWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showMoreFilters, setShowMoreFilters] = useState(Boolean(filters.minDeposit || filters.maxDeposit || filters.holdingSource || filters.photo !== "all" || filters.confirmedBefore));
  const filterKeys = ["q", "status", "transaction", "availability", "minDeposit", "maxDeposit", "holdingSource", "photo", "confirmedBefore"];

  if (errorMessage) return <WorkspaceNotice title="매물 목록을 불러오지 못했습니다" description={errorMessage} error />;
  if (context.kind === "no-active-organization") return <WorkspaceNotice title="선택된 업무 조직이 없습니다" description="매물 목록을 보려면 Clerk Development에서 사무실 조직을 선택해야 합니다. 개인 계정 상태에서는 업무 데이터를 불러오지 않습니다." />;
  if (context.kind === "no-active-membership") return <WorkspaceNotice title="개발용 업무 조직 연결이 아직 없습니다" description="현재 선택한 Clerk 조직과 로그인 사용자 정보를 Dev DB에 한 번 등록하면 매물 목록을 볼 수 있습니다." />;

  function applyFilters(formData: FormData) {
    const next = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => { const value = String(formData.get(key) ?? "").trim(); if (!value || (value === "all" && key !== "status")) next.delete(key); else next.set(key, value); });
    router.replace(next.size ? `${pathname}?${next.toString()}` : pathname);
  }
  function resetFilters() { const next = new URLSearchParams(searchParams.toString()); filterKeys.forEach((key) => next.delete(key)); router.replace(next.size ? `${pathname}?${next.toString()}` : pathname); }

  return <>
    <section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white">
      <form className="border-b border-[#e5e1db] p-3" onSubmit={(event) => { event.preventDefault(); applyFilters(new FormData(event.currentTarget)); }}>
        <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_150px_150px_170px_auto_auto]">
          <input name="q" defaultValue={filters.query} className="field mt-0" placeholder="건물명, 주소, 호실, 매물번호 검색" />
          <select name="status" defaultValue={filters.status} className="field mt-0"><option value="active">매물 상태</option><option value="all">전체 상태</option>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
          <select name="transaction" defaultValue={filters.transaction} className="field mt-0"><option value="all">전체 거래</option>{Object.entries(transactionLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
          <select name="availability" defaultValue={filters.availability} className="field mt-0"><option value="all">전체 입주 조건</option><option value="immediate">즉시 가능</option><option value="date_specified">날짜 지정</option><option value="needs_confirmation">확인 필요</option></select>
          <button type="submit" className="rounded-lg bg-[#3e3a37] px-3.5 text-xs font-bold text-white">검색</button><button type="button" onClick={() => setShowMoreFilters((value) => !value)} className="rounded-lg border border-[#e5e1db] px-3 text-xs font-bold text-[#655f59]">상세 필터</button>
        </div>
        {showMoreFilters && <div className="mt-2 grid gap-2 border-t border-[#eeeae5] pt-2 sm:grid-cols-2 xl:grid-cols-5"><input name="minDeposit" defaultValue={filters.minDeposit} inputMode="numeric" className="field mt-0" placeholder="최소 보증금·매매가 (만원)" /><input name="maxDeposit" defaultValue={filters.maxDeposit} inputMode="numeric" className="field mt-0" placeholder="최대 보증금·매매가 (만원)" /><input name="holdingSource" defaultValue={filters.holdingSource} className="field mt-0" placeholder="보유처" /><select name="photo" defaultValue={filters.photo} className="field mt-0"><option value="all">전체 사진 상태</option>{Object.entries(photoLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><label className="flex h-10 items-center gap-2 rounded-lg border border-[#e5e1db] px-3 text-[11px] text-[#7b7470]"><span className="shrink-0">재확인일 이전</span><input name="confirmedBefore" defaultValue={filters.confirmedBefore} className="min-w-0 bg-transparent text-xs outline-none" type="date" /></label></div>}
        <div className="mt-2 flex items-center justify-between text-xs text-[#7b7470]"><span>{context.organizationName} · 현재 매물 {listings.length}건</span><button type="button" onClick={resetFilters} className="font-bold underline underline-offset-4">필터 초기화</button></div>
      </form>
      <div className="hidden overflow-x-auto md:block"><table className="min-w-[1120px] w-full border-collapse text-left text-xs"><thead className="border-b border-[#e5e1db] bg-[#faf9f7] font-mono text-[10px] tracking-wide text-[#77736e]"><tr><th className="px-4 py-3">STATUS</th><th>PROPERTY</th><th>ROOM TYPE</th><th>TERMS</th><th>AVAILABLE</th><th>PHOTO / CHECK</th><th>HOLDING</th><th className="pr-4">ACTION</th></tr></thead><tbody>{listings.map((listing) => <tr className="border-b border-[#eeeae5] hover:bg-[#faf8f4]" key={listing.id}><td className="px-4 py-3"><StatusBadge tone={listing.status === "vacant" ? "active" : listing.status === "contract_in_progress" ? "notice" : "neutral"}>{statusLabels[listing.status]}</StatusBadge></td><td className="py-3"><b>{listing.buildingName} {listing.unitNumber}</b><span className="mt-0.5 block text-[11px] text-[#77736e]">{listing.address} · {listingNumber(listing.referenceNumber)}</span>{!consultationId && <div className="mt-2"><ListingQuickUpdateButton listing={listing} /></div>}</td><td>{propertyTypeLabels[listing.propertyType]}</td><td className="font-mono">{priceTerms(listing)} <span className="text-[#77736e]">+ {money(listing.maintenanceFeeAmount)}</span></td><td>{availableText(listing.availabilityType, listing.availableDate)}</td><td><StatusBadge tone={listing.photoStatus === "available" ? "active" : "notice"}>{photoLabels[listing.photoStatus]}</StatusBadge><span className="mt-1 block font-mono text-[10px] text-[#77736e]">{listing.lastConfirmedDate ?? "재확인일 없음"}</span></td><td>{listing.holdingSource ?? "—"}</td><td className="pr-4"><div className="flex items-center gap-2">{consultationId ? <Link className="rounded-lg border border-[#3e3a37] px-2.5 py-2 text-[11px] font-bold text-[#3e3a37]" href={`/consultations/${consultationId}`}>이 상담에 제안</Link> : <><Link className="rounded-lg border border-[#3e3a37] px-2.5 py-2 text-[11px] font-bold text-[#3e3a37]" href={`/listings/${listing.id}`}>상세 보기</Link><ListingAccessPasswordButton listingId={listing.id} /></>}</div></td></tr>)}</tbody></table></div>
      <div className="divide-y divide-[#eeeae5] md:hidden">{listings.map((listing) => <article className="p-4" key={listing.id}><div className="flex items-start justify-between gap-3"><div><b>{listing.buildingName} {listing.unitNumber}</b><p className="mt-1 text-[11px] text-[#77736e]">{listing.address} · {listingNumber(listing.referenceNumber)}</p></div><StatusBadge tone={listing.status === "vacant" ? "active" : "notice"}>{statusLabels[listing.status]}</StatusBadge></div><div className="mt-3 grid grid-cols-2 gap-y-2 text-xs"><span className="text-[#77736e]">조건</span><b className="font-mono">{priceTerms(listing)} + {money(listing.maintenanceFeeAmount)}</b><span className="text-[#77736e]">입주</span><b>{availableText(listing.availabilityType, listing.availableDate)}</b><span className="text-[#77736e]">보유처</span><b>{listing.holdingSource ?? "—"}</b></div>{!consultationId && <div className="mt-4 flex flex-wrap items-center gap-3"><Link className="text-xs font-bold underline underline-offset-4" href={`/listings/${listing.id}`}>상세 보기</Link><ListingQuickUpdateButton listing={listing} /><ListingAccessPasswordButton listingId={listing.id} /></div>}</article>)}</div>
      {listings.length === 0 && <div className="px-6 py-14 text-center"><b className="text-sm">조건에 맞는 현재 매물이 없습니다.</b><p className="mt-2 text-xs text-[#7b7470]">검색 조건을 초기화하거나, 가공 seed 입력과 새 매물 등록 기능을 확인해 주세요.</p></div>}
    </section>
    {consultationId && <p className="mt-3 text-xs text-[#77736e]">상담에서 가져온 조건을 기준으로 재고를 찾고 있습니다. 실제 제안 저장은 상담 기능 구현 단계에서 연결합니다.</p>}
  </>;
}

function WorkspaceNotice({ title, description, error = false }: { title: string; description: string; error?: boolean }) { return <section className="rounded-xl border border-[#e8e1db] bg-white px-6 py-14 text-center"><div className={`mx-auto grid h-10 w-10 place-items-center rounded-lg font-mono text-sm font-bold ${error ? "bg-[#fff0ec] text-[#b94a42]" : "bg-[#f3e4dc] text-[#a85f43]"}`}>!</div><h2 className="mt-4 text-base font-extrabold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#7b7470]">{description}</p></section>; }
