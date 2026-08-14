type StatusBadgeProps = {
  label: "광고중" | "상담중" | "확인필요" | "공실" | "입주예정" | "계약진행" | "계약완료" | "신규문의" | "방문예정" | "상담진행" | "만기임박" | "정상유효" | "퇴실검토" | "재계약확정";
};

const styles = {
  광고중: "bg-blue-50 text-blue-700 ring-blue-100",
  상담중: "bg-violet-50 text-violet-700 ring-violet-100",
  확인필요: "bg-amber-50 text-amber-700 ring-amber-100",
  공실: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  입주예정: "bg-amber-50 text-amber-700 ring-amber-100",
  계약진행: "bg-violet-50 text-violet-700 ring-violet-100",
  계약완료: "bg-slate-100 text-slate-600 ring-slate-200",
  신규문의: "bg-amber-50 text-amber-700 ring-amber-100",
  방문예정: "bg-blue-50 text-blue-700 ring-blue-100",
  상담진행: "bg-violet-50 text-violet-700 ring-violet-100",
  만기임박: "bg-rose-50 text-rose-700 ring-rose-100",
  정상유효: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  퇴실검토: "bg-amber-50 text-amber-700 ring-amber-100",
  재계약확정: "bg-blue-50 text-blue-700 ring-blue-100",
};

export function StatusBadge({ label }: StatusBadgeProps) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[label]}`}>{label}</span>;
}
