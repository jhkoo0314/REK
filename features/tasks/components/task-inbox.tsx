import Link from "next/link";

const tasks = [{ label: "김○○ · 다음 연락", detail: "상담 S-000024 · 오늘 14:00", href: "/consultations/S-000024", state: "지연" }, { label: "대성빌 302호 · 재확인", detail: "매물 M-000042 · 마지막 확인 8일 전", href: "/listings", state: "8일" }, { label: "이○○ · 방문 전 확인", detail: "상담 S-000025 · 오늘 16:00", href: "/consultations/S-000025", state: "오늘" }, { label: "C-000008 · 잔금 전 확인", detail: "계약 · 내일 잔금 예정", href: "/contracts", state: "D-1" }];

export function TaskInbox({ compact = false }: { compact?: boolean }) {
  return <section className="rounded-xl border border-[#e5e1db] bg-white"><div className="flex items-center justify-between px-4 py-4"><h2 className="font-extrabold tracking-[-0.04em]">업무 인박스</h2><span className="font-mono text-[10px] text-[#77736e]">04 OPEN</span></div><div className="border-t border-[#e5e1db] p-2">{tasks.slice(0, compact ? 3 : 4).map((task) => <Link className="block rounded-lg px-3 py-3 hover:bg-[#faf8f4]" href={task.href} key={task.label}><b className="text-xs">{task.label}<em className="float-right font-mono text-[10px] not-italic text-[#b64c43]">{task.state}</em></b><span className="mt-1 block text-[11px] text-[#77736e]">{task.detail}</span></Link>)}</div></section>;
}
