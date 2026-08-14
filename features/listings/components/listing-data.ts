export const listingRows = [
  { id: "demo-101", building: "테스트빌", unit: "101호", address: "가공 주소 · 101동 101호", structure: "투룸 (방2/욕1)", price: "3,000 / 80", fee: "10만 원", available: "즉시 입주", status: "공실", channels: "네이버, 다방" },
  { id: "demo-202", building: "샘플하우스", unit: "202호", address: "가공 주소 · 202동 202호", structure: "1.5룸 (분리형)", price: "1,500 / 65", fee: "8만 원", available: "2026.09.15", status: "입주예정", channels: "네이버 부동산" },
  { id: "demo-303", building: "데모레지던스", unit: "303호", address: "가공 주소 · 303동 303호", structure: "원룸 (오픈형)", price: "500 / 45", fee: "5만 원", available: "협의 가능", status: "계약진행", channels: "피터팬" },
  { id: "demo-405", building: "테스트빌", unit: "405호", address: "가공 주소 · 101동 405호", structure: "투룸", price: "5,000 / 120", fee: "15만 원", available: "계약 완료", status: "계약완료", channels: "-" },
] as const;

export const quickFilters = ["전체 보기 (4)", "즉시 입주 가능", "입주 예정", "보증금 500 이하", "원룸 / 1.5룸"] as const;
