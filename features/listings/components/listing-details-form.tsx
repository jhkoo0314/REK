"use client";

import { useState } from "react";

const options = ["에어컨", "세탁기", "냉장고", "인덕션/가스레인지", "붙박이장", "엘리베이터"];
const defaultOptions = new Set(["에어컨", "세탁기", "냉장고", "인덕션/가스레인지"]);

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return <label className="mb-1.5 block text-xs font-bold text-slate-700">{children}{required ? <span className="ml-1 text-rose-500">*</span> : null}</label>;
}

export function ListingDetailsForm() {
  const [transaction, setTransaction] = useState("월세");
  const [selectedOptions, setSelectedOptions] = useState(defaultOptions);
  const toggleOption = (option: string) => setSelectedOptions((current) => {
    const next = new Set(current);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }
    return next;
  });
  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-7"><header className="border-b border-slate-100 pb-4"><h2 className="font-semibold text-slate-900">3단계: 매물 조건 및 단가 입력</h2><p className="mt-1 text-xs text-slate-500">매물 상태, 임대 금액, 입주 가능일을 작성합니다.</p></header><div className="mt-6 grid gap-5 md:grid-cols-2"><div><FieldLabel required>매물 구조 유형</FieldLabel><select className={inputClass} defaultValue="투룸 (방2/욕1)"><option>투룸 (방2/욕1)</option><option>원룸 (오픈형)</option><option>1.5룸 (분리형)</option><option>쓰리룸</option></select></div><div><FieldLabel required>거래 방식</FieldLabel><div className="grid grid-cols-2 gap-2">{["월세", "전세"].map((type) => <button key={type} type="button" onClick={() => setTransaction(type)} className={`rounded-xl py-2.5 text-sm font-semibold transition ${transaction === type ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{type}</button>)}</div></div><div><FieldLabel required>보증금 (만 원)</FieldLabel><input className={`${inputClass} font-mono font-semibold`} type="number" defaultValue="3000" /><p className="mt-1 text-[11px] font-medium text-blue-600">3,000만 원</p></div><div><FieldLabel required>{transaction === "월세" ? "월세 (만 원)" : "전세금 (만 원)"}</FieldLabel><input className={`${inputClass} font-mono font-semibold`} type="number" defaultValue={transaction === "월세" ? "80" : "8000"} /><p className="mt-1 text-[11px] font-medium text-blue-600">{transaction === "월세" ? "80만 원" : "8,000만 원"}</p></div><div><FieldLabel>관리비 (만 원)</FieldLabel><input className={`${inputClass} font-mono`} type="number" defaultValue="10" /></div><div><FieldLabel required>입주 가능일</FieldLabel><select className={inputClass} defaultValue="즉시 입주 가능"><option>즉시 입주 가능</option><option>날짜 지정</option><option>협의 가능</option></select></div></div><div className="mt-6 border-t border-slate-100 pt-5"><FieldLabel>포함 옵션</FieldLabel><div className="flex flex-wrap gap-x-5 gap-y-3">{options.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={selectedOptions.has(option)} onChange={() => toggleOption(option)} className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />{option}</label>)}</div></div><div className="mt-6 border-t border-slate-100 pt-5"><FieldLabel>내부 중개 특이사항 메모</FieldLabel><textarea rows={4} className={inputClass} placeholder="예: 입주 청소비 협의 필요 등 내부 확인용 메모를 작성합니다." /><p className="mt-1.5 text-[11px] text-slate-400">이 메모는 목록에 표시되지 않습니다.</p></div></section>;
}
