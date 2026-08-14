import { CalendarRange, CircleCheckBig, FileClock, WalletCards } from "lucide-react";

export const contractMetrics = [
  { label: "현재 유효 계약", value: "42", icon: FileClock, tone: "blue" },
  { label: "이번 달 만기 예정", value: "3", icon: CalendarRange, tone: "amber" },
  { label: "재계약 확정", value: "5", icon: CircleCheckBig, tone: "emerald" },
  { label: "관리 중 총 보증금", value: "18.4억", unit: "", icon: WalletCards, tone: "violet" },
] as const;

export const contractRows = [
  { id: "contract-a", property: "테스트빌 101호", type: "투룸 · 월세", tenant: "가공 임차인 A", price: "2,000 / 65", period: "2025.09.20 ~ 2027.09.19", remaining: "D-15", status: "퇴실검토", urgent: true },
  { id: "contract-b", property: "샘플하우스 202호", type: "1.5룸 · 월세", tenant: "가공 임차인 B", price: "3,000 / 80", period: "2026.05.10 ~ 2028.05.09", remaining: "430일", status: "정상유효", urgent: false },
  { id: "contract-c", property: "데모레지던스 303호", type: "원룸 · 전세", tenant: "가공 임차인 C", price: "8,000", period: "2026.07.01 ~ 2028.06.30", remaining: "684일", status: "재계약확정", urgent: false },
] as const;
