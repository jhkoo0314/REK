export const channels = [
  { name: "네이버 부동산", count: "24건 게시 중", tone: "bg-emerald-500 ring-emerald-100" },
  { name: "당근 동네생활", count: "16건 게시 중", tone: "bg-orange-500 ring-orange-100" },
  { name: "카카오 / 블로그", count: "12건 게시 완료", tone: "bg-amber-500 ring-amber-100" },
  { name: "직방 / 다방", count: "8건 게시 중", tone: "bg-blue-500 ring-blue-100" },
] as const;

export const channelTemplates = {
  "네이버 부동산": { subtitle: "정석적 · 핵심 요약", title: "[가공 주소] 남향 투룸 월세 3,000 / 80", body: "• 보증금 3,000만 원 / 월세 80만 원\n• 즉시 입주 가능 · 남향 · 투룸\n• 에어컨, 세탁기, 냉장고, 인덕션 포함\n\n※ 가공 매물 미리보기입니다. 실제 게시 전 내용을 확인하세요." },
  "당근 동네생활": { subtitle: "친근함 · 지역 어필", title: "즉시 입주 가능한 깔끔한 남향 투룸", body: "배방 생활권에서 찾기 좋은 가공 매물입니다.\n남향 투룸과 기본 옵션을 확인해 보세요.\n\n※ 실제 광고 문구는 담당자가 수정·확인 후 게시합니다." },
  "블로그 / SNS": { subtitle: "상세 설명", title: "햇살이 잘 드는 남향 투룸, 가공 매물 안내", body: "밝고 정돈된 투룸 구조와 생활 편의 옵션을 갖춘 가공 예시입니다.\n금액과 입주일은 실제 게시 전 반드시 확인해 주세요." },
} as const;

export type ChannelName = keyof typeof channelTemplates;
