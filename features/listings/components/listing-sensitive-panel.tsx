import { KeyRound } from "lucide-react";
import { SensitiveInfo } from "@/components/shared/sensitive-info";

export function ListingSensitivePanel() {
  return <SensitiveInfo title="출입 · 임대인 정보"><div className="space-y-4"><div className="rounded-xl bg-slate-900 p-4 text-white"><p className="flex items-center gap-2 text-xs text-slate-300"><KeyRound className="size-4" /> 출입 정보</p><p className="mt-2 font-mono text-lg font-bold tracking-widest text-blue-300">* * * * (비공개)</p><p className="mt-1 text-[11px] text-slate-400">실제 출입 정보는 DB 권한 연결 후 표시됩니다.</p></div><div className="grid gap-3 text-xs"><div><p className="text-slate-400">임대인</p><p className="mt-1 font-semibold text-slate-700">가공 임대인 정보</p></div><div><p className="text-slate-400">연락처</p><p className="mt-1 font-mono font-semibold text-slate-700">010-****-****</p></div><div><p className="text-slate-400">계좌 정보</p><p className="mt-1 font-mono font-semibold text-slate-700">비공개</p></div></div></div></SensitiveInfo>;
}
