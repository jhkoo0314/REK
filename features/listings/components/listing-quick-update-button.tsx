"use client";

import { ListingRetireButton } from "@/features/listings/components/listing-retire-button";
import { quickUpdateListing } from "@/features/listings/server/listing-registration";
import type { ListingListItem } from "@/features/listings/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

export function ListingQuickUpdateButton({ listing }: { listing: ListingListItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(listing.status === "ended" ? "on_hold" : listing.status);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("");
    const result = await quickUpdateListing({ id: listing.id, listingStatus: status, holdingSource: listing.holdingSource ?? "" });
    setSaving(false);
    if (!result.ok) { setMessage(result.message); return; }
    setOpen(false);
    router.refresh();
  }

  return <><button className="rounded-lg border border-[#d8d0c7] px-2.5 py-2 text-[11px] font-bold text-[#655f59]" onClick={() => setOpen(true)} type="button">빠른 수정</button>{open && <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#2d2926]/35 p-4" role="dialog"><section className="w-full max-w-md rounded-xl border border-[#e5e1db] bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-extrabold">빠른 수정</h2><p className="mt-1 text-xs text-[#7b7470]">{listing.buildingName} {listing.unitNumber} · 상태를 빠르게 수정하거나 관리를 종료합니다.</p></div><button aria-label="닫기" className="text-lg text-[#7b7470]" onClick={() => setOpen(false)} type="button">×</button></div><div className="mt-5">{listing.status === "contract_in_progress" || listing.status === "contract_complete" ? <Label label="매물 상태"><p className="field bg-[#faf8f4]">{listing.status === "contract_in_progress" ? "계약 진행" : "계약 완료"}</p><span className="mt-1 block text-[11px] text-[#7b7470]">계약 상태는 계약관리에서만 바꿉니다.</span></Label> : <Label label="매물 상태"><select className="field" onChange={(event) => setStatus(event.target.value as typeof status)} value={status}><option value="vacant">공실</option><option value="on_hold">보류</option></select><span className="mt-1 block text-[11px] text-[#7b7470]">계약 상태는 계약관리에서만 바꿉니다.</span></Label>}</div>{message && <p className="mt-4 rounded-lg bg-[#fff4f1] px-3 py-2 text-xs text-[#9c4437]">{message}</p>}<div className="mt-5 flex items-center justify-between gap-3 border-t border-[#eeeae5] pt-4"><ListingRetireButton listingId={listing.id} /><div className="flex justify-end gap-2"><button className="rounded-lg border border-[#e5e1db] px-3 py-2 text-xs font-bold text-[#655f59]" onClick={() => setOpen(false)} type="button">취소</button><button className="rounded-lg bg-[#3e3a37] px-4 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={saving} onClick={save} type="button">{saving ? "저장 중…" : "저장"}</button></div></div></section></div>}</>;
}

function Label({ label, children }: { label: string; children: ReactNode }) { return <label><span className="label">{label}</span>{children}</label>; }
