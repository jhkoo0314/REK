import { AlertTriangle } from "lucide-react";

export function ContractExpiryAlert() {
  return <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5"><div className="flex items-center gap-4"><span className="grid size-10 place-items-center rounded-xl bg-rose-500 text-white"><AlertTriangle className="size-5" /></span><div><h2 className="text-sm font-semibold text-rose-900">30일 이내 계약 만기 대상 3건</h2><p className="mt-1 text-xs text-rose-700">퇴실 여부와 재계약 의사를 미리 확인하세요.</p></div></div><button type="button" disabled className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white opacity-60">만기 대상 보기</button></section>;
}
