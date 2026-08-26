"use client";

import { retireListing } from "@/features/listings/server/listing-registration";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingRetireButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [endReason, setEndReason] = useState<"other_broker_contract" | "other">("other_broker_contract");
  async function retire() {
    setSaving(true); setMessage("");
    const result = await retireListing({ id: listingId, endReason });
    setSaving(false);
    if (!result.ok) { setMessage(result.message); return; }
    router.push(`/listings/${listingId}/history`);
  }
  return <><button className="rounded-lg border border-[#d9b8af] px-3 py-2.5 text-xs font-bold text-[#994d42]" onClick={() => setOpen(true)} type="button">관리 종료</button>{open && <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#2d2926]/35 p-4" role="dialog"><section className="w-full max-w-md rounded-xl border border-[#e5e1db] bg-white p-5 shadow-xl"><h2 className="text-base font-extrabold">매물 관리 종료</h2><p className="mt-2 text-sm text-[#655f59]">이 매물을 삭제하지 않습니다. 종료 사유와 함께 현재 재고에서만 종료하고, 호실의 과거 매물 이력으로 보존합니다.</p><label className="mt-4 block"><span className="label">관리 종료 사유</span><select className="field" onChange={(event) => setEndReason(event.target.value as typeof endReason)} value={endReason}><option value="other_broker_contract">타 부동산 계약</option><option value="other">기타</option></select></label><div className="mt-4 rounded-lg bg-[#faf6f2] p-3 text-xs text-[#6d6259]"><b>확인할 영향</b><ul className="mt-2 list-disc space-y-1 pl-4"><li>새 매물을 같은 호실에 등록할 수 있게 됩니다.</li><li>기존 가격·상태·종료 사유는 과거 이력에서 계속 확인할 수 있습니다.</li><li>상담·계약 연결 기능은 P1에서 추가되며, 그때 연결 건수와 영향도 함께 안내합니다.</li></ul></div><p className="mt-3 text-xs text-[#7b7470]">계약이 성사된 경우에는 취소하고 매물 상태를 <b>계약 완료</b>로 저장해 주세요.</p>{message && <p role="alert" className="mt-3 text-xs text-[#b94a42]">{message}</p>}<div className="mt-5 flex justify-end gap-2"><button className="rounded-lg border border-[#e5e1db] px-3 py-2 text-xs font-bold text-[#655f59]" onClick={() => setOpen(false)} type="button">취소</button><button className="rounded-lg bg-[#994d42] px-4 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={saving} onClick={retire} type="button">{saving ? "종료 중…" : "관리 종료 확정"}</button></div></section></div>}</>;
}
