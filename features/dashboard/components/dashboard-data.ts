import { Building2, CalendarClock, ClipboardCheck, FilePenLine } from "lucide-react";

export const overviewCards = [
  { label: "관리 중 매물", value: "24", detail: "이번 주 3건 등록", icon: Building2, tone: "blue" },
  { label: "오늘 상담", value: "6", detail: "오후 일정 4건", icon: CalendarClock, tone: "violet" },
  { label: "계약 진행", value: "3", detail: "확인 대기 1건", icon: FilePenLine, tone: "amber" },
  { label: "광고 게시 중", value: "18", detail: "채널 점검 필요", icon: ClipboardCheck, tone: "emerald" },
] as const;

export const todayTasks = [
  { title: "테스트빌 A호 입주 가능일 확인", category: "매물 확인", time: "10:30", done: false },
  { title: "신규 상담 2건 배정", category: "상담 관리", time: "13:00", done: false },
  { title: "광고 게시 상태 점검", category: "광고 관리", time: "16:00", done: false },
  { title: "계약서 초안 검토", category: "계약 관리", time: "완료", done: true },
] as const;

export const latestListings = [
  { name: "테스트빌 101호", type: "원룸 · 월세", price: "500 / 45", status: "광고중", date: "오늘" },
  { name: "샘플하우스 202호", type: "투룸 · 월세", price: "1,000 / 70", status: "상담중", date: "오늘" },
  { name: "데모레지던스 303호", type: "원룸 · 전세", price: "8,000", status: "확인필요", date: "어제" },
  { name: "테스트빌 205호", type: "투룸 · 월세", price: "1,000 / 65", status: "광고중", date: "어제" },
] as const;
