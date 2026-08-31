"use client";

import { retireListing } from "@/features/listings/server/listing-registration";
import { useRouter } from "next/navigation";
import { useState } from "react";

function todayInKorea() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
}

export function ListingRetireButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [endReason, setEndReason] = useState<"other_broker_contract" | "other">("other_broker_contract");
  const [endDate, setEndDate] = useState(todayInKorea);
  const [confirmed, setConfirmed] = useState(false);
  async function retire() {
    setSaving(true); setMessage("");
    const result = await retireListing({ id: listingId, endReason, endDate });
    setSaving(false);
    if (!result.ok) { setMessage(result.message); return; }
    router.push(`/listings/${listingId}/history`);
  }
  return <><button className="rounded-lg border border-[#d9b8af] px-3 py-2.5 text-xs font-bold text-[#994d42]" onClick={() => setOpen(true)} type="button">관리 종료</button>{open && <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#2d2926]/35 p-4" role="dialog"><section className="w-full max-w-md rounded-xl border border-[#e5e1db] bg-white p-5 shadow-xl"><h2 className="text-base font-extrabold">매물 관리 종료</h2><p className="mt-2 text-sm text-[#655f59]">이 매물을 삭제하지 않습니다. 종료일과 사유를 기록한 뒤 현재 재고에서만 제외하고, 호실의 과거 매물 이력으로 보존합니다.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className="label">종료일</span><input className="field" onChange={(event) => setEndDate(event.target.value)} type="date" value={endDate} /></label><label><span className="label">관리 종료 사유</span><select className="field" onChange={(event) => setEndReason(event.target.value as typeof endReason)} value={endReason}><option value="other_broker_contract">타 부동산 계약</option><option value="other">기타</option></select></label></div><div className="mt-4 rounded-lg bg-[#faf6f2] p-3 text-xs text-[#6d6259]"><b>확인할 영향</b><ul className="mt-2 list-disc space-y-1 pl-4"><li>새 매물을 같은 호실에 등록할 수 있게 됩니다.</li><li>기존 가격·상태·종료일·종료 사유는 과거 이력에서 계속 확인할 수 있습니다.</li><li>계약이 성사된 경우에는 이 기능을 사용하지 않고 계약관리에서 처리합니다.</li></ul></div><label className="mt-4 flex items-start gap-2 text-xs text-[#655f59]"><input checked={confirmed} className="mt-0.5" onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /><span>이 매물을 종료 처리해 현재 매물 목록에서 제외하는 것을 확인했습니다.</span></label>{message && <p role="alert" className="mt-3 text-xs text-[#b94a42]">{message}</p>}<div className="mt-5 flex justify-end gap-2"><button className="rounded-lg border border-[#e5e1db] px-3 py-2 text-xs font-bold text-[#655f59]" onClick={() => setOpen(false)} type="button">취소</button><button className="rounded-lg bg-[#994d42] px-4 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={saving || !confirmed || !endDate} onClick={retire} type="button">{saving ? "종료 중…" : "관리 종료 확정"}</button></div></section></div>}</>;
}
