"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { type ReactNode, useState } from "react";

type SensitiveInfoProps = { children: ReactNode; title?: string };

export function SensitiveInfo({ children, title = "민감 정보" }: SensitiveInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"><header className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><LockKeyhole className="size-4 text-slate-500" />{title}</h2><button type="button" onClick={() => setIsOpen((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">{isOpen ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}{isOpen ? "숨기기" : "보기"}</button></header>{isOpen ? <div className="pt-4">{children}</div> : <div className="pt-4 text-xs leading-5 text-slate-400">연락처·계좌·출입 정보는 기본으로 숨깁니다. 필요한 경우에만 확인하세요.</div>}</section>;
}
