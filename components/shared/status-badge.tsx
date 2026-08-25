import type { ReactNode } from "react";

const colors = {
  neutral: "bg-[#f0eeea] text-[#716d67]",
  active: "bg-[#eef2eb] text-[#657660]",
  notice: "bg-[#fff2e8] text-[#9b6030]",
  late: "bg-[#fff0ed] text-[#b64c43]",
  planned: "bg-[#f1efeb] text-[#746c65]",
} as const;

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof colors }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${colors[tone]}`}><i className="h-1 w-1 rounded-full bg-current" />{children}</span>;
}
