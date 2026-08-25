export type ConsultationStage = "신규" | "연락 예정" | "상담 진행" | "방문 예정" | "계약 검토" | "계약 완료" | "종료";

export type Consultation = {
  id: string;
  customerName: string;
  source: string;
  stage: ConsultationStage;
  area: string;
  budget: string;
  layout: string;
  moveIn: string;
  lastActivity: string;
  lastActivityType: string;
  nextAction: string;
  nextActionState: "지연" | "오늘" | "예정";
  owner: string;
  listingIds: string[];
};

export type Listing = {
  id: string;
  building: string;
  unit: string;
  address: string;
  layout: string;
  terms: string;
  available: string;
  status: "공실" | "계약 진행" | "확인 필요";
  check: string;
};

export const consultations: Consultation[] = [
  { id: "S-000024", customerName: "김○○", source: "전화", stage: "연락 예정", area: "배방읍", budget: "500 / 55 내외", layout: "투룸", moveIn: "9월 초", lastActivity: "08/25", lastActivityType: "통화", nextAction: "08/26 · 14:00", nextActionState: "지연", owner: "김민수", listingIds: ["M-000042", "M-000040"] },
  { id: "S-000025", customerName: "이○○", source: "소개", stage: "방문 예정", area: "탕정면", budget: "300 / 42 내외", layout: "원룸", moveIn: "즉시 입주", lastActivity: "08/25", lastActivityType: "문자", nextAction: "오늘 · 16:00", nextActionState: "오늘", owner: "김민수", listingIds: ["M-000041"] },
  { id: "S-000021", customerName: "박○○", source: "방문", stage: "상담 진행", area: "배방읍", budget: "500 / 52 내외", layout: "투룸", moveIn: "9월 중", lastActivity: "08/24", lastActivityType: "방문", nextAction: "08/28", nextActionState: "예정", owner: "정하늘", listingIds: ["M-000040"] },
  { id: "S-000019", customerName: "최○○", source: "전화", stage: "계약 검토", area: "장재리", budget: "300 / 40 내외", layout: "원룸", moveIn: "9월 초", lastActivity: "08/23", lastActivityType: "통화", nextAction: "08/29", nextActionState: "예정", owner: "김민수", listingIds: ["M-000039"] },
];

export const listings: Listing[] = [
  { id: "M-000042", building: "대성빌", unit: "302호", address: "배방읍 북수리", layout: "투룸", terms: "500 / 55 + 5", available: "즉시 입주", status: "공실", check: "재확인 필요" },
  { id: "M-000040", building: "그린타운", unit: "202호", address: "배방읍 장재리", layout: "투룸", terms: "500 / 52 + 4", available: "9월 2일", status: "공실", check: "—" },
  { id: "M-000041", building: "햇살하우스", unit: "201호", address: "탕정면 공수리", layout: "원룸", terms: "300 / 42 + 4", available: "즉시 입주", status: "계약 진행", check: "사진 확인" },
  { id: "M-000039", building: "그린타운", unit: "101호", address: "배방읍 장재리", layout: "원룸", terms: "300 / 38 + 3", available: "즉시 입주", status: "공실", check: "—" },
  { id: "M-000037", building: "한솔빌", unit: "103호", address: "배방읍 공수리", layout: "투룸", terms: "300 / 50 + 5", available: "확인 필요", status: "확인 필요", check: "정보 지연" },
];

export const buildings = [
  { name: "대성빌", address: "배방읍 북수리 123-4", units: ["302호", "301호", "202호", "201호"] },
  { name: "햇살하우스", address: "탕정면 공수리 51-2", units: ["201호", "101호"] },
  { name: "그린타운", address: "배방읍 장재리 84-1", units: ["202호", "101호"] },
];

export const contracts = [
  { id: "C-000008", status: "잔금 예정", listing: "햇살하우스 201호", source: "이○○ · S-000025", contractDate: "2026.08.20", moveIn: "09.01 / 27.08.31", balance: "내일" },
  { id: "C-000007", status: "정식 계약", listing: "그린타운 101호", source: "박○○ · S-000021", contractDate: "2026.08.18", moveIn: "09.05 / 27.09.04", balance: "08.30" },
];

export type InboxTask = {
  id: string;
  group: "지연됨" | "오늘" | "이번 주";
  category: "상담" | "매물" | "퇴실" | "계약" | "확인";
  title: string;
  detail: string;
  due: string;
  href: string;
};

export const inboxTasks: InboxTask[] = [
  { id: "task-1", group: "지연됨", category: "상담", title: "김○○에게 다음 연락", detail: "S-000024 · 투룸 500 / 55 · 전화 상담 후 재연락", due: "어제 14:00", href: "/consultations/S-000024" },
  { id: "task-2", group: "지연됨", category: "매물", title: "대성빌 302호 상태 재확인", detail: "M-000042 · 마지막 매물 확인 8일 전", due: "8일 지연", href: "/listings" },
  { id: "task-3", group: "오늘", category: "상담", title: "이○○ 방문 전 확인", detail: "S-000025 · 햇살하우스 201호 · 방문 예정", due: "16:00", href: "/consultations/S-000025" },
  { id: "task-4", group: "오늘", category: "계약", title: "C-000008 잔금 전 확인", detail: "햇살하우스 201호 · 잔금 예정일 전 서류·입금 확인", due: "오늘", href: "/contracts" },
  { id: "task-5", group: "오늘", category: "확인", title: "그린타운 202호 사진 보유 여부", detail: "M-000040 · 광고·제안 전 사진 확인 필요", due: "오늘", href: "/listings" },
  { id: "task-6", group: "이번 주", category: "퇴실", title: "한솔빌 103호 퇴실 예정 확인", detail: "M-000037 · 퇴실 예정 08/29 · 다음 임차인 안내 전 확인", due: "08/29", href: "/listings" },
  { id: "task-7", group: "이번 주", category: "계약", title: "그린타운 101호 입주일 확인", detail: "C-000007 · 입주일 09/05 · 입주 전 최종 확인", due: "09/03", href: "/contracts" },
];
