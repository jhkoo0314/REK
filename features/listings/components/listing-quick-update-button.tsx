"use client";

import { quickUpdateListing } from "@/features/listings/server/listing-registration";
import type { ListingListItem } from "@/features/listings/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

export function ListingQuickUpdateButton({ listing }: { listing: ListingListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(listing.status === "ended" ? "on_hold" : listing.status);
  const [photoStatus, setPhotoStatus] = useState(listing.photoStatus);
  const [lastConfirmedDate, setLastConfirmedDate] = useState(listing.lastConfirmedDate ?? "");
  const [holdingSource, setHoldingSource] = useState(listing.holdingSource ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (status === "contract_complete" && !window.confirm("계약 완료로 저장하면 현재 재고에서 종료되고 과거 매물 이력으로 남습니다. 이후 같은 호실에 새 매물을 등록할 수 있습니다. 계속할까요?")) return;
    setSaving(true);
    setMessage("");
    const result = await quickUpdateListing({ id: listing.id, listingStatus: status, photoStatus, lastConfirmedDate, holdingSource });
    setSaving(false);
    if (!result.ok) { setMessage(result.message); return; }
    setOpen(false);
    if (result.movedToHistory) router.push(`/listings/${listing.id}/history`);
    else router.refresh();
  }

  return <><button className="rounded-lg border border-[#d8d0c7] px-2.5 py-2 text-[11px] font-bold text-[#655f59]" onClick={() => setOpen(true)} type="button">빠른 수정</button>{open && <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#2d2926]/35 p-4" role="dialog"><section className="w-full max-w-md rounded-xl border border-[#e5e1db] bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-extrabold">빠른 수정</h2><p className="mt-1 text-xs text-[#7b7470]">{listing.buildingName} {listing.unitNumber} · 자주 바꾸는 항목만 수정합니다.</p></div><button aria-label="닫기" className="text-lg text-[#7b7470]" onClick={() => setOpen(false)} type="button">×</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><Label label="매물 상태"><select className="field" onChange={(event) => setStatus(event.target.value as typeof status)} value={status}><option value="vacant">공실</option><option value="contract_in_progress">계약 진행</option><option value="contract_complete">계약 완료</option><option value="on_hold">보류</option></select></Label><Label label="사진 상태"><select className="field" onChange={(event) => setPhotoStatus(event.target.value as typeof photoStatus)} value={photoStatus}><option value="not_available">사진 없음</option><option value="available">사진 있음</option><option value="needs_confirmation">사진 확인 필요</option></select></Label><Label label="마지막 재확인일"><input className="field" onChange={(event) => setLastConfirmedDate(event.target.value)} type="date" value={lastConfirmedDate} /></Label><Label label="보유처"><input className="field" onChange={(event) => setHoldingSource(event.target.value)} value={holdingSource} /></Label></div>{message && <p className="mt-4 rounded-lg bg-[#fff4f1] px-3 py-2 text-xs text-[#9c4437]">{message}</p>}<div className="mt-5 flex justify-end gap-2"><button className="rounded-lg border border-[#e5e1db] px-3 py-2 text-xs font-bold text-[#655f59]" onClick={() => setOpen(false)} type="button">취소</button><button className="rounded-lg bg-[#3e3a37] px-4 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={saving} onClick={save} type="button">{saving ? "저장 중…" : "저장"}</button></div></section></div>}</>;
}

function Label({ label, children }: { label: string; children: ReactNode }) { return <label><span className="label">{label}</span>{children}</label>; }
