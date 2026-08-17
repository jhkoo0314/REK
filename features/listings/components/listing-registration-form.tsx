"use client";

import { AlertCircle, Save, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { registerListing, type RegistrationActionState } from "@/features/listings/server/listing-registration-actions";
import type { RegistrationBuildingOption } from "@/features/listings/server/listing-registration-queries";

type FormValues = Record<string, string>;
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";
const statuses = ["확인 필요", "퇴실 예정", "공실", "광고 가능", "계약 진행 중", "계약 완료", "보류", "종료"];
const roomTypes = ["원룸", "투룸", "투베이", "쓰리룸", "쓰리베이", "주인세대", "기타", "확인 필요"];

function ErrorText({ name, errors }: { name: string; errors?: Record<string, string[]> }) {
  return errors?.[name]?.[0] ? <p className="mt-1 text-xs font-medium text-rose-600">{errors[name][0]}</p> : null;
}

export function ListingRegistrationForm({ buildings }: { buildings: RegistrationBuildingOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<RegistrationActionState>({});
  const alertedMessage = useRef<string | undefined>(undefined);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const { register, handleSubmit, watch, setValue } = useForm<FormValues>({ defaultValues: { buildingMode: "existing", unitMode: "existing", listingStatus: "공실", transactionType: "월세", availabilityType: "즉시입주", roomType: "원룸" } });
  const buildingMode = watch("buildingMode");
  const unitMode = watch("unitMode");
  const buildingId = watch("existingBuildingId");
  const transactionType = watch("transactionType");
  const availabilityType = watch("availabilityType");
  const building = buildings.find((item) => item.id === buildingId);

  useEffect(() => {
    if (buildingMode === "new") {
      setValue("unitMode", "new");
      setValue("existingBuildingId", "");
    }
  }, [buildingMode, setValue]);
  useEffect(() => setValue("existingUnitId", ""), [buildingId, setValue]);
  useEffect(() => { if (state.listingId) router.push(`/listings/${state.listingId}`); }, [router, state.listingId]);
  useEffect(() => {
    if (state.showDuplicateUnitAlert && state.message && alertedMessage.current !== state.message) {
      alertedMessage.current = state.message;
      setShowDuplicateDialog(true);
    }
  }, [state.message, state.showDuplicateUnitAlert]);

  const submit = handleSubmit((values) => {
    alertedMessage.current = undefined;
    setShowDuplicateDialog(false);
    setState({});
    startTransition(async () => setState(await registerListing(values)));
  });

  return <form onSubmit={submit} className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-semibold text-slate-900">1단계: 건물 선택 또는 등록</h2>
      <div className="mt-5 flex gap-5 text-sm"><label><input type="radio" value="existing" {...register("buildingMode")} /> 기존 건물 선택</label><label><input type="radio" value="new" {...register("buildingMode")} /> 새 건물 등록</label></div>
      {buildingMode === "existing" ? <label className="mt-5 block text-xs font-bold text-slate-700">건물 <span className="text-rose-500">*</span><select {...register("existingBuildingId")} className={inputClass}><option value="">건물을 선택하세요</option>{buildings.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.address}</option>)}</select><ErrorText name="existingBuildingId" errors={state.fieldErrors} /></label> : <div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-700">건물명<input {...register("buildingName")} className={inputClass} placeholder="예: 가람빌" /></label><label className="text-xs font-bold text-slate-700">지역 <span className="text-rose-500">*</span><input {...register("lotArea")} className={inputClass} /><ErrorText name="lotArea" errors={state.fieldErrors} /></label><label className="text-xs font-bold text-slate-700">지번 <span className="text-rose-500">*</span><input {...register("lotNumber")} className={inputClass} /><ErrorText name="lotNumber" errors={state.fieldErrors} /></label><label className="text-xs font-bold text-slate-700">주소 <span className="text-rose-500">*</span><input {...register("lotAddress")} className={inputClass} /><ErrorText name="lotAddress" errors={state.fieldErrors} /></label></div>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-semibold text-slate-900">2단계: 호실 선택 또는 등록</h2><p className="mt-1 text-xs text-slate-500">현재 매물이 있는 호실은 새 매물로 등록할 수 없습니다.</p>
      {buildingMode === "existing" && !building ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">1단계에서 건물을 선택해 주세요.</p> : null}
      {buildingMode === "existing" && building ? <><div className="mt-5 flex gap-5 text-sm"><label><input type="radio" value="existing" {...register("unitMode")} /> 기존 호실 선택</label><label><input type="radio" value="new" {...register("unitMode")} /> 새 호실 등록</label></div>{unitMode === "existing" ? <label className="mt-4 block text-xs font-bold text-slate-700">호실 <span className="text-rose-500">*</span><select {...register("existingUnitId")} className={inputClass}><option value="">호실을 선택하세요</option>{building.units.map((unit) => <option key={unit.id} value={unit.id} disabled={unit.hasCurrentListing}>{unit.unitNumber}{unit.roomType ? ` · ${unit.roomType}` : ""}{unit.hasCurrentListing ? " · 현재 매물 있음" : ""}</option>)}</select><ErrorText name="existingUnitId" errors={state.fieldErrors} /></label> : null}</> : null}
      {unitMode === "new" ? <div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-700">호실 <span className="text-rose-500">*</span><input {...register("unitNumber")} className={inputClass} placeholder="예: 302호" /><ErrorText name="unitNumber" errors={state.fieldErrors} /></label><label className="text-xs font-bold text-slate-700">구조<select {...register("roomType")} className={inputClass}>{roomTypes.map((type) => <option key={type}>{type}</option>)}</select></label></div> : null}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-semibold text-slate-900">3단계: 매물 조건 입력</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-bold text-slate-700">매물 보유처 <span className="text-rose-500">*</span><input {...register("listingHolder")} className={inputClass} /><ErrorText name="listingHolder" errors={state.fieldErrors} /></label><label className="text-xs font-bold text-slate-700">매물 상태<select {...register("listingStatus")} className={inputClass}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="text-xs font-bold text-slate-700">거래 유형<select {...register("transactionType")} className={inputClass}><option>월세</option><option>전세</option><option>확인 필요</option></select></label><label className="text-xs font-bold text-slate-700">{transactionType === "전세" ? "전세금" : "보증금"} (만 원)<input type="number" min="0" {...register("depositManwon")} className={inputClass} /><ErrorText name="depositManwon" errors={state.fieldErrors} /></label>{transactionType === "월세" ? <label className="text-xs font-bold text-slate-700">월세 (만 원)<input type="number" min="0" {...register("monthlyRentManwon")} className={inputClass} /><ErrorText name="monthlyRentManwon" errors={state.fieldErrors} /></label> : null}<label className="text-xs font-bold text-slate-700">관리비 (만 원)<input type="number" min="0" {...register("managementFeeManwon")} className={inputClass} /></label><label className="text-xs font-bold text-slate-700">입주 가능 유형<select {...register("availabilityType")} className={inputClass}><option>즉시입주</option><option>날짜 지정</option><option>퇴실 후 협의</option><option>확인 필요</option></select></label>{availabilityType === "날짜 지정" ? <label className="text-xs font-bold text-slate-700">입주 가능일<input type="date" {...register("availableFromDate")} className={inputClass} /><ErrorText name="availableFromDate" errors={state.fieldErrors} /></label> : null}<label className="text-xs font-bold text-slate-700 md:col-span-2">매물 메모<textarea rows={4} {...register("listingNote")} className={inputClass} /></label></div>
    </section>
    {state.message ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle className="mr-2 inline size-4" />{state.message}{state.existingListingId ? <Link href={`/listings/${state.existingListingId}`} className="ml-2 font-semibold underline">기존 매물 열기</Link> : null}</div> : null}
    {showDuplicateDialog ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5" role="dialog" aria-modal="true" aria-labelledby="duplicate-unit-title"><section className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-rose-600">등록할 수 없음</p><h2 id="duplicate-unit-title" className="mt-1 text-lg font-bold text-slate-950">중복된 호실입니다</h2></div><button type="button" onClick={() => setShowDuplicateDialog(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="팝업 닫기"><X className="size-5" /></button></div><p className="mt-4 text-sm leading-6 text-slate-600">{state.message}</p><div className="mt-6 flex justify-end gap-2">{state.existingListingId ? <Link href={`/listings/${state.existingListingId}`} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">기존 매물 열기</Link> : null}<button type="button" onClick={() => setShowDuplicateDialog(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">확인</button></div></section></div> : null}
    <div className="flex justify-end gap-2"><Link href="/listings" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">취소</Link><button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="size-4" />{isPending ? "저장 중..." : "매물 등록 완료"}</button></div>
  </form>;
}
