export type PropertyGroup = "residential" | "apartment" | "officetel" | "commercial";
export type PropertyPreview = { id: string; group: PropertyGroup; typeLabel: string; referenceNumber: string; buildingName: string; unitLabel: string; address: string; price: string; status: string; availability: string; summary: string; details: [string, string][] };

export const propertyGroups: { id: "all" | PropertyGroup; label: string }[] = [
  { id: "all", label: "전체" }, { id: "residential", label: "원룸·투룸" }, { id: "apartment", label: "아파트" }, { id: "officetel", label: "오피스텔" }, { id: "commercial", label: "상가·사무실" },
];

export const propertyPreviews: PropertyPreview[] = [
  { id: "P-RES-001", group: "residential", typeLabel: "투룸", referenceNumber: "M-200101", buildingName: "대성빌", unitLabel: "302호", address: "아산시 배방읍 북수리", price: "보증금 500 / 월세 55", status: "공실", availability: "즉시 입주", summary: "기존 원룸·투룸 업무 흐름과 동일하게 관리합니다.", details: [["방 구조", "투룸"], ["관리비", "5만원"], ["주차", "가능"]] },
  { id: "P-APT-001", group: "apartment", typeLabel: "아파트", referenceNumber: "M-200201", buildingName: "다온센트럴", unitLabel: "104동 1203호", address: "아산시 배방읍 장재리", price: "전세 28,000", status: "공실", availability: "2026.09.15", summary: "단지·동·전용면적처럼 아파트에 필요한 정보가 추가됩니다.", details: [["단지명", "다온센트럴"], ["동 / 층", "104동 / 12층"], ["전용면적", "84㎡"], ["주차", "세대당 1.4대"]] },
  { id: "P-OFF-001", group: "officetel", typeLabel: "오피스텔", referenceNumber: "M-200301", buildingName: "한들시티", unitLabel: "802호", address: "아산시 탕정면 매곡리", price: "보증금 1,000 / 월세 70", status: "계약 진행", availability: "2026.10.01", summary: "주거·업무 용도와 관리비, 주차 조건을 함께 관리합니다.", details: [["전용면적", "32㎡"], ["용도", "주거용"], ["관리비", "9만원"], ["주차", "1대 가능"]] },
  { id: "P-COM-001", group: "commercial", typeLabel: "상가", referenceNumber: "M-200401", buildingName: "두정메디컬프라자", unitLabel: "203호", address: "천안시 서북구 두정동", price: "보증금 3,000 / 월세 180", status: "공실", availability: "즉시 입주", summary: "권리금·업종 제한·부가세처럼 상가에 필요한 조건을 별도로 관리합니다.", details: [["전용면적", "66㎡"], ["권리금", "없음"], ["업종 제한", "의료·음식점 제외"], ["부가세", "별도"]] },
  { id: "P-OFFICE-001", group: "commercial", typeLabel: "사무실", referenceNumber: "M-200402", buildingName: "천안비즈센터", unitLabel: "507호", address: "천안시 서북구 성정동", price: "보증금 2,000 / 월세 110", status: "확인 필요", availability: "입주일 확인", summary: "상가와 같은 흐름을 쓰되, 사무실에 필요한 조건만 다르게 표시합니다.", details: [["전용면적", "49㎡"], ["주차", "2대 가능"], ["냉난방", "개별"], ["부가세", "별도"]] },
];

export function getPropertyPreview(id: string) { return propertyPreviews.find((item) => item.id === id); }
