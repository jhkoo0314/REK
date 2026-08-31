import Link from "next/link";
import type { ReactNode } from "react";
import type { RevenueAnalysis } from "@/features/revenue/server/revenue-analysis";

const money = (value: number) => `${value.toLocaleString("ko-KR")}원`;
const propertyOptions = [["one_room", "원룸"], ["two_room", "투룸"], ["apartment", "아파트"], ["officetel", "오피스텔"], ["retail", "상가"], ["office", "사무실"]];
const statusOptions = [["in_progress", "진행"], ["balance_due", "잔금 예정"], ["completed", "계약 완료"], ["cancelled", "해지"], ["expired", "만료"]];

export function RevenueAnalysisWorkspace({ analysis }: { analysis: RevenueAnalysis }) {
  const { filters, role, summary } = analysis;
  const useStaffNet = role === "staff";
  const outstandingTotal = analysis.outstanding.reduce((sum, row) => sum + row.outstanding, 0);

  return <section className="space-y-5">
    <form className={`grid items-end gap-3 rounded-xl border border-[#e5e1db] bg-white p-4 md:grid-cols-2 ${role === "admin" ? "lg:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_auto]" : "lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"}`}>
      <Field label="시작일"><input className="w-full rounded-lg border px-3 py-2" name="start" type="date" defaultValue={filters.startDate} /></Field>
      <Field label="종료일"><input className="w-full rounded-lg border px-3 py-2" name="end" type="date" defaultValue={filters.endDate} /></Field>
      {role === "admin" && <Field label="담당자"><select className="w-full rounded-lg border px-3 py-2" name="responsible" defaultValue={filters.responsible ?? ""}><option value="">전체 담당자</option>{analysis.members.map((member) => <option key={member} value={member}>{member}</option>)}</select></Field>}
      <SelectField label="매물 형태" name="propertyType" value={filters.propertyType} options={propertyOptions} />
      <SelectField label="계약 상태" name="contractStatus" value={filters.contractStatus} options={statusOptions} />
      <div className="flex items-end"><button className="rounded-lg bg-[#a85f43] px-4 py-2 text-sm font-bold text-white">조회</button></div>
    </form>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><Card label="실제 수납" value={money(summary.receipts)} /><Card label="환불" value={money(summary.refunds)} /><Card label={role === "admin" ? "순매출" : "내 순매출"} value={money(summary.net)} /><Card label="계약 건수" value={`${summary.contractCount}건`} /><Card label="계약 1건당 평균" value={money(summary.average)} /></div>
    <div className={`grid gap-5 ${role === "admin" ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
      {role === "admin" && <SummaryList title="담당자별 성과" rows={analysis.byResponsible} netLabel="담당자 순매출" useStaffNet />}
      <SummaryList title="매물 형태별 성과" rows={analysis.byPropertyType} netLabel={useStaffNet ? "내 순매출" : "순매출"} useStaffNet={useStaffNet} />
      <SummaryList title="월별 매출 추이" rows={analysis.byMonth} netLabel={useStaffNet ? "내 순매출" : "순매출"} useStaffNet={useStaffNet} />
    </div>
    <section className="rounded-xl border border-[#ead8cf] bg-[#fffaf7] px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold">확인할 미수금</h2><p className="mt-1 text-xs text-[#77736e]">수납이 남은 계약만 따로 확인합니다.</p></div><p className="text-right"><b className="text-lg tabular-nums text-[#8f4e36]">{money(outstandingTotal)}</b><span className="ml-2 text-sm text-[#77736e]">{analysis.outstanding.length}건</span></p></div></section>
    <details className="group overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-bold">미수금 계약 목록 보기 <span className="text-[#77736e] group-open:hidden">▸</span><span className="hidden text-[#77736e] group-open:inline">▾</span></summary><div className="border-t p-5"><OutstandingTable rows={analysis.outstanding} role={role} /></div></details>
  </section>;
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) { return <label className={`grid gap-1 text-xs font-bold text-[#625c57] ${className ?? ""}`}><span>{label}</span>{children}</label>; }
function SelectField({ label, name, value, options, className }: { label: string; name: string; value?: string; options: string[][]; className?: string }) { return <Field className={className} label={label}><select className="w-full rounded-lg border px-2 py-2" name={name} defaultValue={value ?? ""}><option value="">전체</option>{options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></Field>; }
function Card({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-[#e5e1db] bg-white p-4"><p className="text-xs text-[#77736e]">{label}</p><b className="mt-2 block text-lg tabular-nums">{value}</b></div>; }
function SummaryList({ title, rows, netLabel, useStaffNet }: { title: string; rows: RevenueAnalysis["byMonth"]; netLabel: string; useStaffNet: boolean }) { return <section className="rounded-xl border border-[#e5e1db] bg-white"><div className="border-b px-5 py-4"><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-xs text-[#77736e]">전체 결과</p></div>{rows.length ? <ol className="divide-y">{rows.map((row, index) => <li className="flex items-center gap-3 px-5 py-3" key={row.key}><span className="w-5 text-xs font-bold text-[#a85f43]">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{row.label}</p><p className="mt-0.5 text-xs text-[#77736e]">계약 {row.contractCount}건</p></div><div className="text-right"><p className="text-[10px] text-[#77736e]">{netLabel}</p><b className="text-sm tabular-nums">{money(useStaffNet ? row.staffNet : row.net)}</b></div></li>)}</ol> : <p className="px-5 py-9 text-center text-sm text-[#77736e]">선택한 조건의 기록이 없습니다.</p>}</section>; }
function OutstandingTable({ rows, role }: { rows: RevenueAnalysis["outstanding"]; role: "admin" | "staff" }) { return <section className="overflow-hidden rounded-xl border border-[#e5e1db] bg-white"><h2 className="border-b px-5 py-4 text-sm font-bold">미수금 계약 목록</h2><div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left text-xs"><thead className="bg-[#faf9f7] text-[#77736e]"><tr><th className="px-4 py-3">계약</th>{role === "admin" && <th>담당자</th>}<th>상태</th><th>약정 수수료</th><th>누적 수납</th><th>환불</th><th>남은 미수금</th></tr></thead><tbody>{rows.map((row) => <tr className="border-t" key={row.contractId}><td className="px-4 py-3"><Link className="font-bold underline" href={`/contracts/${row.contractId}`}>{row.contractLabel}</Link></td>{role === "admin" && <td>{row.responsible ?? "담당자 미지정"}</td>}<td>{row.status}</td><td>{money(row.agreed)}</td><td>{money(row.received)}</td><td>{money(row.refunded)}</td><td className="font-bold">{money(row.outstanding)}</td></tr>)}</tbody></table></div>{rows.length === 0 && <p className="px-5 py-10 text-center text-sm text-[#77736e]">현재 남은 미수금이 없습니다.</p>}</section>; }
