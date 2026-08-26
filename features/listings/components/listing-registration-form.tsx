"use client";

import { createListing, type ListingRegistrationOptions } from "@/features/listings/server/listing-registration";
import { BuildingSearchPicker } from "@/features/listings/components/building-search-picker";
import { listingCreateSchema, type ListingCreateInput } from "@/features/listings/schemas/listing-create";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";

const emptyValues: ListingCreateInput = {
  buildingMode: "new", buildingId: "", buildingName: "", roadAddress: "", lotAddress: "", addressDetail: "", postalCode: "",
  unitMode: "new", unitId: "", unitNumber: "", floor: "", layoutType: "", direction: "", optionsText: "", accessPassword: "", ownerPhone: "", tenantPhone: "",
  propertyType: "one_room", listingStatus: "vacant", transactionType: "monthly_rent", depositAmount: "", monthlyRentAmount: "", maintenanceFeeAmount: "",
  availabilityType: "immediate", availableDate: "", moveOutDate: "", photoStatus: "not_available", lastConfirmedDate: "", holdingSource: "",
};

function inferFloorFromUnitNumber(value: string) {
  const numericUnit = value.trim().replace(/호$/, "");
  if (!/^\d{3,}$/.test(numericUnit)) return "";
  return String(Number(numericUnit.slice(0, -2)));
}

export function ListingRegistrationForm({ options }: { options: ListingRegistrationOptions }) {
  const [successNumber, setSuccessNumber] = useState<number | null>(null);
  const form = useForm<ListingCreateInput>({ resolver: zodResolver(listingCreateSchema), defaultValues: emptyValues });
  const buildingMode = useWatch({ control: form.control, name: "buildingMode" });
  const unitMode = useWatch({ control: form.control, name: "unitMode" });
  const buildingId = useWatch({ control: form.control, name: "buildingId" });
  const transactionType = useWatch({ control: form.control, name: "transactionType" });
  const availabilityType = useWatch({ control: form.control, name: "availabilityType" });
  const availableUnits = useMemo(() => options.units.filter((unit) => unit.buildingId === buildingId), [buildingId, options.units]);
  const unitNumberField = form.register("unitNumber");

  if (options.context.kind !== "ready") return <RegistrationNotice title={options.context.kind === "no-active-organization" ? "선택된 업무 조직이 없습니다" : "개발용 업무 조직 연결이 아직 없습니다"} description="현재 선택한 REK_test 조직과 로그인 사용자 정보를 Dev DB에 한 번 등록하면 매물을 등록할 수 있습니다." />;

  async function submit(values: ListingCreateInput) {
    setSuccessNumber(null);
    const result = await createListing(values);
    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => form.setError(name as keyof ListingCreateInput, { message: messages[0] }));
      form.setError("root", { message: result.message });
      return;
    }
    setSuccessNumber(result.listingReferenceNumber);
    form.reset(emptyValues);
  }

  return <form className="mx-auto max-w-5xl space-y-5" onSubmit={form.handleSubmit(submit)}>
    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <SectionHeader title="1. 건물 선택" description="기존 건물을 선택하거나, 새 건물과 주소를 함께 등록합니다." />
      <div className="p-5">
        <ModeButtons value={buildingMode} onExisting={() => form.setValue("buildingMode", "existing")} onNew={() => { form.setValue("buildingMode", "new"); form.setValue("buildingId", ""); form.setValue("unitMode", "new"); form.setValue("unitId", ""); }} existingLabel="기존 건물 선택" newLabel="새 건물 입력" />
        {buildingMode === "existing" ? <div className="mt-4 space-y-4"><BuildingSearchPicker buildings={options.buildings} onSelect={(buildingId) => { form.setValue("buildingId", buildingId, { shouldDirty: true, shouldValidate: true }); form.setValue("unitId", ""); form.setValue("unitMode", "new"); }} selectedId={buildingId} /><FieldError message={form.formState.errors.buildingId?.message} /><OwnerPhoneField form={form} /></div> : <div className="mt-4 grid gap-4 md:grid-cols-2"><label><span className="label">건물명</span><input className="field" placeholder="예: 햇살하우스" {...form.register("buildingName")} /><FieldError message={form.formState.errors.buildingName?.message} /></label><label><span className="label">도로명 주소</span><input className="field" placeholder="도로명 주소가 없으면 지번 주소를 입력" {...form.register("roadAddress")} /><FieldError message={form.formState.errors.roadAddress?.message} /></label><label><span className="label">지번 주소</span><input className="field" placeholder="예: 배방읍 ○○리 123-4" {...form.register("lotAddress")} /></label><label><span className="label">상세 주소 / 우편번호</span><div className="mt-1.5 flex gap-2"><input className="field mt-0" placeholder="동·층 등" {...form.register("addressDetail")} /><input className="field mt-0 w-28" placeholder="우편번호" {...form.register("postalCode")} /></div></label><div className="md:col-span-2"><OwnerPhoneField form={form} /></div></div>}
      </div>
    </section>

    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <SectionHeader title="2. 호실 선택" description="기존 건물의 호실을 고르거나, 새 호실의 고정 정보를 입력합니다." />
      <div className="p-5">
        <ModeButtons disabled={buildingMode === "new"} value={unitMode} onExisting={() => form.setValue("unitMode", "existing")} onNew={() => { form.setValue("unitMode", "new"); form.setValue("unitId", ""); }} existingLabel="기존 호실 선택" newLabel="새 호실 입력" />
        {buildingMode === "new" && <p className="mt-3 text-xs text-[#7b7470]">새 건물을 등록할 때는 새 호실을 함께 입력합니다.</p>}
        {unitMode === "existing" && buildingMode === "existing" ? <div className="mt-4 space-y-4"><label className="block"><span className="label">기존 호실</span><select className="field" {...form.register("unitId")}><option value="">호실 선택</option>{availableUnits.map((unit) => <option value={unit.id} key={unit.id}>{unit.unitNumber}</option>)}</select>{buildingId && availableUnits.length === 0 && <span className="mt-1 block text-xs text-[#a85f43]">선택한 건물에 등록된 호실이 없습니다. 새 호실을 입력해 주세요.</span>}<FieldError message={form.formState.errors.unitId?.message} /></label><AccessPasswordField register={form.register("accessPassword")} /><TenantPhoneField form={form} /></div> : <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><label><span className="label">호실</span><input className="field" placeholder="예: 302호" {...unitNumberField} onChange={(event) => { unitNumberField.onChange(event); const floor = inferFloorFromUnitNumber(event.target.value); if (floor) form.setValue("floor", floor, { shouldDirty: true }); }} /><FieldError message={form.formState.errors.unitNumber?.message} /></label><label><span className="label">층</span><input className="field" inputMode="numeric" placeholder="호실 입력 시 자동 입력" {...form.register("floor")} /><span className="mt-1 block text-[11px] text-[#7b7470]">예: 302호 → 3층. 필요하면 직접 바꿀 수 있습니다.</span></label><label><span className="label">방향</span><select className="field" {...form.register("direction")}><option value="">선택 안 함</option><option value="동향">동향</option><option value="서향">서향</option><option value="남향">남향</option><option value="북향">북향</option><option value="남동향">남동향</option><option value="남서향">남서향</option><option value="북동향">북동향</option><option value="북서향">북서향</option></select></label><label className="md:col-span-2 xl:col-span-3"><span className="label">고정 옵션</span><input className="field" placeholder="예: 엘리베이터, 주차, 에어컨 (쉼표로 구분)" {...form.register("optionsText")} /></label><div className="md:col-span-2 xl:col-span-3"><AccessPasswordField register={form.register("accessPassword")} /><TenantPhoneField form={form} /></div></div>}
      </div>
    </section>

    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <SectionHeader title="3. 현재 매물 조건" description="가격과 상태는 새 매물에 저장됩니다. 같은 호실의 현재 매물은 한 건만 만들 수 있습니다." />
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><label><span className="label">방 구조</span><select className="field" {...form.register("propertyType")}><option value="one_room">원룸</option><option value="two_room">투룸</option><option value="two_bay">투베이</option><option value="three_room">쓰리룸</option><option value="owner_unit">주인세대</option></select></label><label><span className="label">매물 상태</span><select className="field" {...form.register("listingStatus")}><option value="vacant">공실</option><option value="contract_in_progress">계약 진행</option><option value="on_hold">보류</option></select></label><label><span className="label">거래 방식</span><select className="field" {...form.register("transactionType")}><option value="monthly_rent">월세</option><option value="jeonse">전세</option><option value="to_be_confirmed">확인 필요</option></select></label>
        <label><span className="label">보증금 (만원)</span><input className="field" inputMode="numeric" placeholder={transactionType === "jeonse" ? "필수" : "선택 입력"} {...form.register("depositAmount")} /><FieldError message={form.formState.errors.depositAmount?.message} /></label><label><span className="label">월세 (만원)</span><input className="field" inputMode="numeric" disabled={transactionType === "jeonse"} placeholder={transactionType === "monthly_rent" ? "필수" : "전세는 비움"} {...form.register("monthlyRentAmount")} /><FieldError message={form.formState.errors.monthlyRentAmount?.message} /></label><label><span className="label">관리비 (만원)</span><input className="field" inputMode="numeric" placeholder="선택 입력" {...form.register("maintenanceFeeAmount")} /></label><label><span className="label">입주 가능 조건</span><select className="field" {...form.register("availabilityType")}><option value="immediate">즉시 가능</option><option value="date_specified">날짜 지정</option><option value="needs_confirmation">확인 필요</option></select></label>
        {availabilityType === "date_specified" && <label><span className="label">입주 가능일</span><input className="field" type="date" {...form.register("availableDate")} /><FieldError message={form.formState.errors.availableDate?.message} /></label>}<label><span className="label">퇴실 예정일</span><input className="field" type="date" {...form.register("moveOutDate")} /></label><label><span className="label">사진 상태</span><select className="field" {...form.register("photoStatus")}><option value="not_available">사진 없음</option><option value="available">사진 있음</option><option value="needs_confirmation">사진 확인 필요</option></select></label><label><span className="label">마지막 재확인일</span><input className="field" type="date" {...form.register("lastConfirmedDate")} /></label><label className="md:col-span-2 xl:col-span-3"><span className="label">보유처</span><input className="field" placeholder="예: 개인매물, 주택관리" {...form.register("holdingSource")} /></label></div>
    </section>

    {form.formState.errors.root?.message && <div role="alert" className="rounded-lg border border-[#e4b9ad] bg-[#fff4f1] px-4 py-3 text-sm text-[#9c4437]">{form.formState.errors.root.message}</div>}
    {successNumber && <div role="status" className="rounded-lg border border-[#b8c9b1] bg-[#f5faf2] px-4 py-3 text-sm text-[#49613e]"><b>매물을 등록했습니다.</b> 매물번호는 M-{String(successNumber).padStart(6, "0")}입니다. <Link className="font-bold underline underline-offset-4" href="/listings">목록에서 확인하기</Link></div>}
    <div className="flex flex-wrap items-center justify-between gap-3 pb-8"><Link className="text-xs font-bold text-[#655f59] underline underline-offset-4" href="/listings">목록으로 돌아가기</Link><button className="rounded-lg bg-[#3e3a37] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60" disabled={form.formState.isSubmitting} type="submit">{form.formState.isSubmitting ? "저장 중…" : "건물·호실·현재 매물 등록"}</button></div>
  </form>;
}

function SectionHeader({ title, description }: { title: string; description: string }) { return <div className="border-b border-[#e5e1db] px-5 py-4"><h2 className="text-base font-extrabold">{title}</h2><p className="mt-1 text-xs text-[#7b7470]">{description}</p></div>; }
function FieldError({ message }: { message?: string }) { return message ? <span className="mt-1 block text-xs text-[#b94a42]">{message}</span> : null; }
function AccessPasswordField({ register }: { register: UseFormRegisterReturn<"accessPassword"> }) { return <label className="block"><span className="label">세대 비밀번호 <em className="not-italic text-[#a85f43]">(제한 정보)</em></span><input className="field" autoComplete="new-password" placeholder="필요한 경우에만 입력" type="password" {...register} /><span className="mt-1 block text-[11px] text-[#7b7470]">목록과 일반 상세에는 표시하지 않습니다.</span></label>; }
function OwnerPhoneField({ form }: { form: ReturnType<typeof useForm<ListingCreateInput>> }) { return <label className="block"><span className="label">임대인 연락처 <em className="not-italic text-[#a85f43]">(건물 제한 정보)</em></span><input className="field" inputMode="tel" placeholder="예: 010-1234-5678" type="tel" {...form.register("ownerPhone")} /><FieldError message={form.formState.errors.ownerPhone?.message} /></label>; }
function TenantPhoneField({ form }: { form: ReturnType<typeof useForm<ListingCreateInput>> }) { return <label className="block"><span className="label">세입자 연락처 <em className="not-italic text-[#a85f43]">(호실 제한 정보)</em></span><input className="field" inputMode="tel" placeholder="예: 010-1234-5678" type="tel" {...form.register("tenantPhone")} /><FieldError message={form.formState.errors.tenantPhone?.message} /></label>; }
function ModeButtons({ value, onExisting, onNew, existingLabel, newLabel, disabled = false }: { value: "existing" | "new"; onExisting: () => void; onNew: () => void; existingLabel: string; newLabel: string; disabled?: boolean }) { return <div className="flex flex-wrap gap-2"><button className={`rounded-lg border px-4 py-2 text-xs font-bold ${value === "existing" ? "border-[#3e3a37] bg-[#3e3a37] text-white" : "border-[#e5e1db] text-[#655f59]"}`} disabled={disabled} onClick={onExisting} type="button">{existingLabel}</button><button className={`rounded-lg border px-4 py-2 text-xs font-bold ${value === "new" ? "border-[#3e3a37] bg-[#3e3a37] text-white" : "border-[#e5e1db] text-[#655f59]"}`} onClick={onNew} type="button">{newLabel}</button></div>; }
function RegistrationNotice({ title, description }: { title: string; description: string }) { return <section className="rounded-xl border border-[#e8e1db] bg-white px-6 py-14 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-[#f3e4dc] font-mono text-sm font-bold text-[#a85f43]">!</div><h2 className="mt-4 text-base font-extrabold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#7b7470]">{description}</p></section>; }
