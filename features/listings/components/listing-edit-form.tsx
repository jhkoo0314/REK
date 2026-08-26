"use client";

import { updateListing } from "@/features/listings/server/listing-registration";
import { listingUpdateSchema, type ListingUpdateInput } from "@/features/listings/schemas/listing-update";
import type { ListingDetail, ListingEditData } from "@/features/listings/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

function valuesFromListing(listing: ListingDetail, accessPassword: string, ownerPhone: string, tenantPhone: string): ListingUpdateInput {
  return { id: listing.id, accessPassword, ownerPhone, tenantPhone, propertyType: listing.propertyType as ListingUpdateInput["propertyType"], listingStatus: listing.status as ListingUpdateInput["listingStatus"], transactionType: listing.transactionType, depositAmount: listing.depositAmount?.toString() ?? "", monthlyRentAmount: listing.monthlyRentAmount?.toString() ?? "", maintenanceFeeAmount: listing.maintenanceFeeAmount?.toString() ?? "", availabilityType: listing.availabilityType, availableDate: listing.availableDate ?? "", moveOutDate: listing.moveOutDate ?? "", photoStatus: listing.photoStatus, lastConfirmedDate: listing.lastConfirmedDate ?? "", holdingSource: listing.holdingSource ?? "" };
}

export function ListingEditForm({ editData }: { editData: ListingEditData }) {
  const { listing, accessPassword, ownerPhone, tenantPhone, sensitiveAccess } = editData;
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const form = useForm<ListingUpdateInput>({ resolver: zodResolver(listingUpdateSchema), defaultValues: valuesFromListing(listing, accessPassword, ownerPhone, tenantPhone) });
  const transactionType = useWatch({ control: form.control, name: "transactionType" });
  const availabilityType = useWatch({ control: form.control, name: "availabilityType" });

  async function submit(values: ListingUpdateInput) {
    setSaved(false);
    if (values.listingStatus === "contract_complete" && !window.confirm("계약 완료로 저장하면 현재 재고에서 종료되고 과거 매물 이력으로 남습니다. 이후 같은 호실에 새 매물을 등록할 수 있습니다. 계속할까요?")) return;
    const result = await updateListing(values);
    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([name, messages]) => form.setError(name as keyof ListingUpdateInput, { message: messages[0] }));
      form.setError("root", { message: result.message });
      return;
    }
    if (result.movedToHistory) router.push(`/listings/${listing.id}/history`);
    else setSaved(true);
  }

  return <form className="mx-auto max-w-5xl space-y-5" onSubmit={form.handleSubmit(submit)}>
    <section className="rounded-xl border border-[#e5e1db] bg-white">
      <div className="border-b border-[#e5e1db] px-5 py-4"><p className="font-mono text-[11px] font-bold text-[#8b8279]">M-{String(listing.referenceNumber).padStart(6, "0")}</p><h2 className="mt-1 text-base font-extrabold">{listing.buildingName} {listing.unitNumber}</h2><p className="mt-1 text-xs text-[#7b7470]">건물·호실의 고정 정보는 건물·호실 관리에서 수정합니다.</p></div>
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="방 구조"><select className="field" {...form.register("propertyType")}><option value="one_room">원룸</option><option value="two_room">투룸</option><option value="two_bay">투베이</option><option value="three_room">쓰리룸</option><option value="owner_unit">주인세대</option></select></Field>
        <Field label="매물 상태"><select className="field" {...form.register("listingStatus")}><option value="vacant">공실</option><option value="contract_in_progress">계약 진행</option><option value="contract_complete">계약 완료</option><option value="on_hold">보류</option></select></Field>
        <Field label="거래 방식"><select className="field" {...form.register("transactionType")}><option value="monthly_rent">월세</option><option value="jeonse">전세</option><option value="sale">매매</option><option value="to_be_confirmed">확인 필요</option></select></Field>
        <Field label={`${transactionType === "sale" ? "매매가" : "보증금"} (만원)`} error={form.formState.errors.depositAmount?.message}><input className="field" inputMode="numeric" {...form.register("depositAmount")} /></Field>
        <Field label="월세 (만원)" error={form.formState.errors.monthlyRentAmount?.message}><input className="field" disabled={transactionType === "jeonse" || transactionType === "sale"} inputMode="numeric" {...form.register("monthlyRentAmount")} /></Field>
        <Field label="관리비 (만원)"><input className="field" inputMode="numeric" {...form.register("maintenanceFeeAmount")} /></Field>
        <Field label="입주 가능 조건"><select className="field" {...form.register("availabilityType")}><option value="immediate">즉시 가능</option><option value="date_specified">날짜 지정</option><option value="needs_confirmation">확인 필요</option></select></Field>
        {availabilityType === "date_specified" && <Field error={form.formState.errors.availableDate?.message} label="입주 가능일"><input className="field" type="date" {...form.register("availableDate")} /></Field>}
        <Field label="퇴실 예정일"><input className="field" type="date" {...form.register("moveOutDate")} /></Field>
        <Field label="사진 상태"><select className="field" {...form.register("photoStatus")}><option value="not_available">사진 없음</option><option value="available">사진 있음</option><option value="needs_confirmation">사진 확인 필요</option></select></Field>
        <Field label="마지막 재확인일"><input className="field" type="date" {...form.register("lastConfirmedDate")} /></Field>
        <label className="md:col-span-2 xl:col-span-3"><span className="label">보유처</span><input className="field" {...form.register("holdingSource")} /></label>
        {sensitiveAccess.unitAccess && <Field label="세대 비밀번호 (제한 정보)"><input className="field" autoComplete="new-password" type="password" {...form.register("accessPassword")} /><span className="mt-1 block text-[11px] text-[#7b7470]">이 수정 화면에서만 확인·변경할 수 있습니다.</span></Field>}
        {sensitiveAccess.propertyContacts && <><Field label="임대인 연락처 (제한 정보)" error={form.formState.errors.ownerPhone?.message}><input className="field" inputMode="tel" type="tel" {...form.register("ownerPhone")} /></Field><Field label="세입자 연락처 (제한 정보)" error={form.formState.errors.tenantPhone?.message}><input className="field" inputMode="tel" type="tel" {...form.register("tenantPhone")} /></Field></>}
      </div>
    </section>
    {form.formState.errors.root?.message && <div role="alert" className="rounded-lg border border-[#e4b9ad] bg-[#fff4f1] px-4 py-3 text-sm text-[#9c4437]">{form.formState.errors.root.message}</div>}
    {saved && <div role="status" className="rounded-lg border border-[#b8c9b1] bg-[#f5faf2] px-4 py-3 text-sm text-[#49613e]"><b>현재 매물 조건을 수정했습니다.</b> 목록과 상세 화면에 바로 반영됩니다.</div>}
    <div className="flex flex-wrap items-center justify-between gap-3 pb-8"><Link className="text-xs font-bold text-[#655f59] underline underline-offset-4" href={`/listings/${listing.id}`}>수정 취소</Link><button className="rounded-lg bg-[#3e3a37] px-5 py-3 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60" disabled={form.formState.isSubmitting} type="submit">{form.formState.isSubmitting ? "저장 중…" : "현재 매물 조건 저장"}</button></div>
  </form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label><span className="label">{label}</span>{children}{error && <span className="mt-1 block text-xs text-[#b94a42]">{error}</span>}</label>; }
