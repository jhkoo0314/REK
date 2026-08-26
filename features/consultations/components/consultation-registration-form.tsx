"use client";

import { consultationCreateSchema, type ConsultationCreateInput } from "@/features/consultations/schemas/consultation-create";
import { createConsultation, type ConsultationRegistrationOptions } from "@/features/consultations/server/consultation-registration";
import { formatPhoneNumber } from "@/lib/phone-format";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";

const sources = ["미입력", "직방", "다방", "당근", "네이버", "워크인", "타부동산 연계"];
const areaOptions = ["배방읍", "탕정면", "장재리", "아산 시내"];
const roomOptions = ["원룸", "투룸", "투베이", "쓰리룸", "주인세대"];

const defaults: ConsultationCreateInput = {
  category: "general", initialListingId: "", customerName: "", customerPhone: "", consultationDate: new Date().toISOString().slice(0, 10), inflowSource: "미입력", consultationMethod: "phone", consultationNote: "",
  desiredAreas: [], desiredAreasOther: "", desiredRoomTypes: [], desiredRoomTypesOther: "", desiredDepositBudget: "", desiredMonthlyRentBudget: "", desiredMoveInDate: "", requiredFeaturesNote: "",
  status: "in_progress", progressStage: "new_inquiry", nextContactDate: "", closedReason: "",
};

export function ConsultationRegistrationForm({ options }: { options: ConsultationRegistrationOptions }) {
  const router = useRouter();
  const form = useForm<ConsultationCreateInput>({ resolver: zodResolver(consultationCreateSchema), defaultValues: defaults });
  const category = useWatch({ control: form.control, name: "category" });
  const status = useWatch({ control: form.control, name: "status" });
  const desiredAreas = useWatch({ control: form.control, name: "desiredAreas" });
  const desiredRoomTypes = useWatch({ control: form.control, name: "desiredRoomTypes" });

  if (options.context.kind !== "ready") return <RegistrationNotice title={options.context.kind === "no-active-organization" ? "선택된 업무 조직이 없습니다" : "개발용 업무 조직 연결이 아직 없습니다"} description="현재 선택한 Clerk 조직과 로그인 사용자를 Dev DB의 활성 멤버로 연결하면 상담을 등록할 수 있습니다." />;

  async function submit(values: ConsultationCreateInput) {
    const result = await createConsultation(values);
    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => form.setError(name as keyof ConsultationCreateInput, { message: messages[0] }));
      form.setError("root", { message: result.message });
      return;
    }
    router.push(`/consultations/${result.consultationId}`);
    router.refresh();
  }

  function toggleValue(field: "desiredAreas" | "desiredRoomTypes", value: string) {
    const current = form.getValues(field) ?? [];
    form.setValue(field, current.includes(value) ? current.filter((item) => item !== value) : [...current, value], { shouldDirty: true });
  }

  return <form className="mx-auto max-w-5xl space-y-5" onSubmit={form.handleSubmit(submit)}>
    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <SectionHeader title="상담 기본 정보" description="일반 문의는 매물 없이 시작할 수 있습니다. 매물 문의는 최초 문의 매물을 연결해 기록합니다." />
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        <label><span className="label">상담 구분</span><select className="field" {...form.register("category")}><option value="general">일반 상담</option><option value="listing">매물 상담</option></select></label>
        {category === "listing" && <label className="xl:col-span-2"><span className="label">최초 문의 매물</span><select className="field" {...form.register("initialListingId")}><option value="">매물 선택</option>{options.listings.map((listing) => <option key={listing.id} value={listing.id}>{listing.label}</option>)}</select><FieldError message={form.formState.errors.initialListingId?.message} /></label>}
        <label><span className="label">고객 이름 또는 식별명 <em className="not-italic font-normal text-[#7b7470]">(선택)</em></span><input className="field" placeholder="예: 김○○ 또는 별칭" {...form.register("customerName")} /><FieldError message={form.formState.errors.customerName?.message} /></label>
        <label><span className="label">고객 연락처</span><input className="field" inputMode="tel" placeholder="010-1234-5678" {...form.register("customerPhone", { onChange: (event) => { event.target.value = formatPhoneNumber(event.target.value); } })} /><FieldError message={form.formState.errors.customerPhone?.message} /></label>
        <label><span className="label">상담일</span><input className="field" type="date" {...form.register("consultationDate")} /><FieldError message={form.formState.errors.consultationDate?.message} /></label>
        <label><span className="label">유입 경로</span><select className="field" {...form.register("inflowSource")}>{sources.map((source) => <option key={source} value={source}>{source}</option>)}</select></label>
        <label><span className="label">상담 방식</span><select className="field" {...form.register("consultationMethod")}><option value="phone">전화</option><option value="message">문자</option><option value="visit">방문</option><option value="other">기타</option></select></label>
        <label><span className="label">상담 상태</span><select className="field" {...form.register("status")}><option value="in_progress">진행 중</option><option value="on_hold">보류</option><option value="needs_confirmation">확인 필요</option><option value="ended">종료</option></select></label>
        <label><span className="label">진행 단계</span><select className="field" {...form.register("progressStage")}><option value="new_inquiry">신규 문의</option><option value="condition_check">조건 확인</option><option value="visit_scheduled">방문 예정</option><option value="visit_completed">방문 완료</option><option value="reviewing">검토 중</option><option value="closed">종료</option></select><span className="mt-1 block text-[11px] text-[#7b7470]">계약 진행·계약 완료는 계약관리에서만 처리합니다.</span><FieldError message={form.formState.errors.progressStage?.message} /></label>
      </div>
    </section>

    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <SectionHeader title="희망 조건" description="여러 지역과 방 구조를 함께 선택할 수 있습니다. 아직 정해지지 않은 항목은 비워 둘 수 있습니다." />
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <ChoiceGroup label="희망 지역" options={areaOptions} values={desiredAreas ?? []} onToggle={(value) => toggleValue("desiredAreas", value)} otherRegister={form.register("desiredAreasOther")} otherPlaceholder="목록에 없는 지역 직접 입력" />
        <ChoiceGroup label="희망 방 구조" options={roomOptions} values={desiredRoomTypes ?? []} onToggle={(value) => toggleValue("desiredRoomTypes", value)} otherRegister={form.register("desiredRoomTypesOther")} otherPlaceholder="예: 복층, 분리형" />
      </div>
      <div className="grid gap-4 border-t border-[#eeeae5] p-5 md:grid-cols-2 xl:grid-cols-4">
        <label><span className="label">희망 보증금 (만원)</span><input className="field" inputMode="numeric" {...form.register("desiredDepositBudget")} /><FieldError message={form.formState.errors.desiredDepositBudget?.message} /></label>
        <label><span className="label">희망 월세 (만원)</span><input className="field" inputMode="numeric" {...form.register("desiredMonthlyRentBudget")} /><FieldError message={form.formState.errors.desiredMonthlyRentBudget?.message} /></label>
        <label><span className="label">희망 입주일</span><input className="field" type="date" {...form.register("desiredMoveInDate")} /></label>
        <label className="xl:col-span-1"><span className="label">필수 조건</span><input className="field" placeholder="예: 주차, 반려동물" {...form.register("requiredFeaturesNote")} /></label>
      </div>
    </section>

    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <SectionHeader title="다음 행동" description="후속 전화·문자·방문 이력은 상담을 등록한 다음 상세 화면에서 추가합니다." />
      <div className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
        <label><span className="label">상담 내용</span><textarea className="field min-h-28 resize-y" placeholder="원하는 지역·입주 시기·안내한 내용 등을 기록합니다." {...form.register("consultationNote")} /></label>
        <div className="space-y-4"><label className="block"><span className="label">다음 연락일</span><input className="field" disabled={status === "ended"} type="date" {...form.register("nextContactDate")} /><FieldError message={form.formState.errors.nextContactDate?.message} /></label>{status === "ended" && <label className="block"><span className="label">종료 사유</span><input className="field" placeholder="예: 조건 불일치" {...form.register("closedReason")} /><FieldError message={form.formState.errors.closedReason?.message} /></label>}</div>
      </div>
    </section>

    {form.formState.errors.root?.message && <div role="alert" className="rounded-lg border border-[#e4b9ad] bg-[#fff4f1] px-4 py-3 text-sm text-[#9c4437]">{form.formState.errors.root.message}</div>}
    <div className="flex flex-wrap items-center justify-between gap-3 pb-8"><Link className="text-xs font-bold text-[#655f59] underline underline-offset-4" href="/consultations">목록으로 돌아가기</Link><button className="rounded-lg bg-[#3e3a37] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60" disabled={form.formState.isSubmitting} type="submit">{form.formState.isSubmitting ? "저장 중…" : "상담 등록"}</button></div>
  </form>;
}

function SectionHeader({ title, description }: { title: string; description: string }) { return <div className="border-b border-[#e5e1db] px-5 py-4"><h2 className="text-base font-extrabold">{title}</h2><p className="mt-1 text-xs text-[#7b7470]">{description}</p></div>; }
function FieldError({ message }: { message?: string }) { return message ? <span className="mt-1 block text-xs text-[#b94a42]">{message}</span> : null; }
function RegistrationNotice({ title, description }: { title: string; description: string }) { return <section className="rounded-xl border border-[#e8e1db] bg-white px-6 py-14 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#f3e4dc] font-mono text-sm font-bold text-[#a85f43]">!</div><h2 className="mt-4 text-base font-extrabold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#7b7470]">{description}</p></section>; }
function ChoiceGroup({ label, options, values, onToggle, otherRegister, otherPlaceholder }: { label: string; options: string[]; values: string[]; onToggle: (value: string) => void; otherRegister: ReturnType<typeof useForm<ConsultationCreateInput>>["register"] extends (name: "desiredAreasOther") => infer T ? T : never; otherPlaceholder: string }) { return <section><h3 className="label">{label}</h3><div className="mt-2 flex flex-wrap gap-2">{options.map((option) => <button className={`rounded-lg border px-3 py-2 text-xs font-bold ${values.includes(option) ? "border-[#3e3a37] bg-[#3e3a37] text-white" : "border-[#e5e1db] text-[#655f59]"}`} key={option} onClick={() => onToggle(option)} type="button">{option}</button>)}</div><input className="field mt-3" placeholder={otherPlaceholder} {...otherRegister} /></section>; }
