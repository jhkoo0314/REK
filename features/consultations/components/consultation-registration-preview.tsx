"use client";

import Link from "next/link";
import { useState } from "react";

const sources = ["미입력", "직방", "다방", "당근", "네이버", "워크인", "타부동산 연계"];
const stages = ["신규 문의", "조건 확인", "방문 예정", "방문 완료", "검토 중", "종료"];

export function ConsultationRegistrationPreview() {
  const [category, setCategory] = useState<"일반 상담" | "매물 상담">("일반 상담");
  const [notice, setNotice] = useState(false);
  const isListingConsultation = category === "매물 상담";

  return <section className="mx-auto max-w-5xl rounded-xl border border-[#e5e1db] bg-white">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e5e1db] px-5 py-4">
      <div>
        <h2 className="text-base font-extrabold">상담 기본 정보</h2>
        <p className="mt-1 text-xs text-[#7b7470]">Streamlit의 일반 상담·매물 상담 구분과 후속 연락 중심 입력 흐름을 반영했습니다.</p>
      </div>
      <span className="rounded-full bg-[#eeeae3] px-3 py-1.5 text-xs font-bold text-[#655f59]">저장 기능 준비 중</span>
    </div>

    <form className="space-y-6 p-5" onSubmit={(event) => { event.preventDefault(); setNotice(true); }}>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">상담 구분</legend>
        <div className="flex flex-wrap gap-2">
          {(["일반 상담", "매물 상담"] as const).map((item) => <button type="button" key={item} onClick={() => { setCategory(item); setNotice(false); }} className={`rounded-lg border px-4 py-2.5 text-xs font-bold ${category === item ? "border-[#3e3a37] bg-[#3e3a37] text-white" : "border-[#e5e1db] text-[#655f59]"}`}>{item}</button>)}
        </div>
        <p className="mt-2 text-xs text-[#7b7470]">{isListingConsultation ? "문의 당시의 매물을 먼저 연결합니다. 이후 제안 매물은 상담 상세에서 더 추가할 수 있습니다." : "아직 연결할 매물이 없거나, 여러 매물을 함께 찾는 문의를 먼저 기록합니다."}</p>
      </fieldset>

      {isListingConsultation && <label className="block"><span className="mb-2 block text-sm font-bold">최초 문의 매물</span><select className="field"><option>매물 선택 (목업)</option><option>M-000042 · 대성빌 302호 · 투룸 · 500 / 55</option><option>M-000040 · 그린타운 202호 · 투룸 · 500 / 52</option></select><span className="mt-1 block text-[11px] text-[#7b7470]">실제 매물 검색·선택은 매물 DB 연결 단계에서 구현합니다.</span></label>}

      <div className="grid gap-4 md:grid-cols-2">

        <label><span className="label">고객 연락처</span><input className="field" inputMode="tel" placeholder="예: 010-1234-5678" /></label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label><span className="label">상담일</span><input className="field" type="date" /></label>
        <label><span className="label">상담 방식</span><select className="field"><option>전화</option><option>문자</option><option>방문</option><option>기타</option></select></label>
        <label><span className="label">진행 단계</span><select className="field">{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
        <label><span className="label">유입 경로</span><select className="field">{sources.map((source) => <option key={source}>{source}</option>)}</select></label>
      </div>

      <section className="rounded-lg bg-[#faf9f7] p-4">
        <h3 className="text-sm font-bold">희망 조건 <span className="font-normal text-[#7b7470]">(선택)</span></h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label><span className="label">희망 지역</span><input className="field" placeholder="예: 배방읍, 탕정면" /></label>
          <label><span className="label">희망 방 유형</span><select className="field"><option>선택 안 함</option><option>원룸</option><option>투룸</option><option>쓰리룸 이상</option></select></label>
          <label><span className="label">희망 보증금 (만원)</span><input className="field" inputMode="numeric" placeholder="예: 500" /></label>
          <label><span className="label">희망 월세 (만원)</span><input className="field" inputMode="numeric" placeholder="예: 55" /></label>
          <label><span className="label">희망 입주 가능일</span><input className="field" type="date" /></label>
          <label className="md:col-span-1 xl:col-span-3"><span className="label">필수 조건</span><input className="field" placeholder="예: 엘리베이터, 주차, 반려동물" /></label>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <label><span className="label">상담 내용</span><textarea className="field min-h-28 resize-y" placeholder="원하는 지역·입주 시기·안내한 내용 등" /></label>
        <label><span className="label">다음 연락일</span><input className="field" type="date" /><span className="mt-1 block text-[11px] leading-4 text-[#7b7470]">종료 단계에서는 다음 연락일을 비우는 규칙이 실제 저장 단계에 적용됩니다.</span></label>
      </div>

      {notice && <div role="status" className="rounded-lg border border-[#d7cabe] bg-[#fffaf6] px-4 py-3 text-sm text-[#655f59]"><b>저장 기능 준비 중입니다.</b><span className="ml-1">입력한 내용은 아직 DB에 저장되지 않았습니다.</span></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e1db] pt-5">
        <Link className="text-xs font-bold text-[#655f59] underline underline-offset-4" href="/consultations">목록으로 돌아가기</Link>
        <button className="rounded-lg bg-[#3e3a37] px-4 py-2.5 text-xs font-bold text-white" type="submit">상담 등록 준비 중</button>
      </div>
    </form>
  </section>;
}
