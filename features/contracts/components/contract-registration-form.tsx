"use client";

import { createContract, type ContractOption } from "@/features/contracts/server/contract-registration";
import { contractCreateSchema, type ContractCreateInput } from "@/features/contracts/schemas/contract-create";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const empty: ContractCreateInput = { listingId: "", sourceConsultationId: "", transactionType: "to_be_confirmed", contractKind: "new_contract", brokerageType: "direct", contractStartedDate: "", officialContractDate: "", moveInDate: "", endDate: "", totalContractDepositAmount: "", provisionalDepositAmount: "", additionalDepositDueDate: "", balanceAmount: "", balanceDueDate: "", note: "" };

export function ContractRegistrationForm({ listings, consultations, sourceConsultationId = "", selectedListingId = "" }: { listings: ContractOption[]; consultations: ContractOption[]; sourceConsultationId?: string; selectedListingId?: string }) {
  const router = useRouter();
  const form = useForm<ContractCreateInput>({ resolver: zodResolver(contractCreateSchema), defaultValues: { ...empty, sourceConsultationId, listingId: selectedListingId ?? "" } });
  const listingField = form.register("listingId");
  async function submit(values: ContractCreateInput) {
    const result = await createContract(values);
    if (!result.ok) { form.setError("root", { message: result.message }); return; }
    router.push("/contracts");
  }
  return <form className="mx-auto max-w-5xl space-y-5" onSubmit={form.handleSubmit(submit)}>
    <section className="rounded-xl border bg-white"><header className="border-b px-5 py-4"><h2 className="font-extrabold">계약 기본 정보</h2></header><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
      <Field label="실제 계약 매물">{selectedListingId && <p className="mb-2 rounded-lg bg-[#faf8f4] px-3 py-2 text-xs font-bold">선택한 매물로 계약을 작성합니다. <Link className="ml-2 underline" href="/contracts">매물 변경</Link></p>}<select className="field" disabled={Boolean(selectedListingId)} {...listingField} onChange={(event) => { listingField.onChange(event); const selected = listings.find((item) => item.id === event.target.value); if (selected?.transactionType) form.setValue("transactionType", selected.transactionType, { shouldDirty: true }); }}><option value="">매물 선택</option>{listings.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
      <Field label="출처 상담"><select className="field" {...form.register("sourceConsultationId")}><option value="">연결 안 함</option>{consultations.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
      <Field label="거래 방식"><select className="field" {...form.register("transactionType")}><option value="monthly_rent">월세</option><option value="jeonse">전세</option><option value="sale">매매</option><option value="to_be_confirmed">확인 필요</option></select></Field>
      <Field label="계약 구분"><select className="field" {...form.register("contractKind")}><option value="new_contract">신규 계약</option><option value="renewal">재계약</option></select></Field>
      <Field label="중개 방식"><select className="field" {...form.register("brokerageType")}><option value="direct">단독 중개</option><option value="co_brokerage">공동 중개</option><option value="other">기타</option></select></Field>
      <Field label="계약 진행일"><input className="field" type="date" {...form.register("contractStartedDate")} /></Field><Field label="정식 계약일"><input className="field" type="date" {...form.register("officialContractDate")} /></Field><Field label="입주일"><input className="field" type="date" {...form.register("moveInDate")} /></Field><Field label="만료일"><input className="field" type="date" {...form.register("endDate")} /></Field>
    </div></section>
    <section className="rounded-xl border bg-white"><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3"><Field label="전체 계약금"><input className="field" {...form.register("totalContractDepositAmount")} /></Field><Field label="가계약금"><input className="field" {...form.register("provisionalDepositAmount")} /></Field><Field label="추가 수령 예정일"><input className="field" type="date" {...form.register("additionalDepositDueDate")} /></Field><Field label="잔금"><input className="field" {...form.register("balanceAmount")} /></Field><Field label="잔금 예정일"><input className="field" type="date" {...form.register("balanceDueDate")} /></Field><label className="md:col-span-2 xl:col-span-3"><span className="label">메모</span><textarea className="field min-h-24" {...form.register("note")} /></label></div></section>
    {form.formState.errors.root?.message && <p className="text-sm text-red-600">{form.formState.errors.root.message}</p>}
    <div className="flex justify-between"><Link href="/contracts">취소</Link><button className="rounded-lg bg-[#3e3a37] px-5 py-3 text-sm font-bold text-white">계약 저장</button></div>
  </form>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="label">{label}</span>{children}</label>; }
