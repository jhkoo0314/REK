import { Check } from "lucide-react";

const steps = [
  { number: 1, title: "건물 선택/등록", description: "가공 건물 선택됨", completed: true },
  { number: 2, title: "호실 선택", description: "101동 402호", completed: true },
  { number: 3, title: "매물 조건 입력", description: "입력 진행 중", completed: false },
];

export function ListingRegistrationStepper() {
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6"><ol className="grid gap-5 md:grid-cols-3">{steps.map((step, index) => <li key={step.number} className={`flex items-center gap-3 ${index > 0 ? "md:border-l md:border-slate-100 md:pl-5" : ""}`}><span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${step.completed ? "bg-emerald-500 text-white" : "bg-blue-600 text-white ring-4 ring-blue-100"}`}>{step.completed ? <Check className="size-5" /> : step.number}</span><span><span className={`block text-[11px] font-bold uppercase tracking-wider ${step.completed ? "text-emerald-600" : "text-blue-600"}`}>STEP {step.number}</span><strong className="mt-0.5 block text-sm text-slate-800">{step.title}</strong><span className={`mt-0.5 block text-xs ${step.completed ? "text-slate-400" : "font-medium text-blue-600"}`}>{step.description}</span></span></li>)}</ol></section>;
}
