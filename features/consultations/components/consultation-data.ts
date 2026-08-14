import { CalendarDays, CircleDotDashed, MessageCircleMore, ShieldCheck } from "lucide-react";

export const consultationMetrics = [
  { label: "오늘 예정 방문", value: "4", icon: CalendarDays, tone: "blue" },
  { label: "신규 미처리 문의", value: "3", icon: MessageCircleMore, tone: "amber" },
  { label: "진행 중 상담", value: "12", icon: CircleDotDashed, tone: "violet" },
  { label: "이번 달 계약 전환", value: "8", icon: ShieldCheck, tone: "emerald" },
] as const;

export const consultationRows = [
  { id: "consultation-a", initials: "A", accent: "bg-blue-100 text-blue-700", customer: "가공 고객 A", category: "임차 문의 · 월세", preference: "투룸 / 월세 3,000 / 80 이하", preferenceDetail: "배방읍 선호 · 즉시 입주", listing: "테스트빌 101호", schedule: "오늘 14:30", scheduleDetail: "현장 방문 예정", status: "방문예정" },
  { id: "consultation-b", initials: "B", accent: "bg-amber-100 text-amber-700", customer: "가공 고객 B", category: "임차 문의 · 전세", preference: "원룸 / 전세 7,000 이하", preferenceDetail: "주차 필수 · 입주일 협의", listing: "샘플하우스 202호 등 2건", schedule: "9월 4일 11:00", scheduleDetail: "전화 상담 완료", status: "상담진행" },
  { id: "consultation-c", initials: "C", accent: "bg-slate-100 text-slate-600", customer: "가공 고객 C", category: "임차 문의 · 월세", preference: "원룸 / 월세 500 / 50 이하", preferenceDetail: "대중교통 접근성 선호", listing: "매칭 전", schedule: "다음 연락일 미정", scheduleDetail: "신규 문의", status: "신규문의" },
] as const;
