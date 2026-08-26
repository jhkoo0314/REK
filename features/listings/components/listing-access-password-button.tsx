"use client";

import { getListingAccessPassword } from "@/features/listings/server/listing-registration";
import { useState } from "react";

export function ListingAccessPasswordButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function openPassword() {
    setLoading(true);
    setPassword("");
    setMessage("");
    const result = await getListingAccessPassword(listingId);
    setLoading(false);
    if (result.ok) setPassword(result.password);
    else setMessage(result.message);
    setOpen(true);
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setMessage("비밀번호를 복사했습니다.");
    } catch {
      setMessage("복사하지 못했습니다. 비밀번호를 직접 선택해 복사해 주세요.");
    }
  }

  return <><button className="rounded-lg border border-[#d8d0c7] px-2.5 py-2 text-[11px] font-bold text-[#655f59] disabled:opacity-60" disabled={loading} onClick={openPassword} type="button">{loading ? "불러오는 중" : "비밀번호 보기"}</button>{open && <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#2d2926]/35 p-4" role="dialog"><section className="w-full max-w-sm rounded-xl border border-[#e5e1db] bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-extrabold">세대 비밀번호</h2><p className="mt-1 text-xs text-[#7b7470]">확인 후 필요한 곳에만 사용해 주세요.</p></div><button aria-label="닫기" className="text-lg text-[#7b7470]" onClick={() => setOpen(false)} type="button">×</button></div>{password ? <><div className="mt-5 rounded-lg bg-[#f7f4f0] px-4 py-3 font-mono text-lg font-bold tracking-[0.14em] text-[#3e3a37]">{password}</div><button className="mt-3 w-full rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" onClick={copyPassword} type="button">복사하기</button></> : <p className="mt-5 rounded-lg bg-[#fff4f1] px-4 py-3 text-sm text-[#9c4437]">{message}</p>}{message && password && <p className="mt-2 text-center text-xs text-[#657660]">{message}</p>}</section></div>}</>;
}
