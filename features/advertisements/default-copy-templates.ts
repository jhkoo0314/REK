import type { PropertyGroup } from "@/features/advertisements/schemas/advertising-copy-template";

export type DefaultAdvertisingCopyTemplate = {
  id: string;
  propertyGroup: PropertyGroup;
  templateName: string;
  titleTemplate: string;
  bodyTemplate: string;
};

// 기존 Streamlit의 기본형·특징 강조형 흐름을, 확인한 값만 쓰는 웹용 문장으로 정리했다.
export const defaultAdvertisingCopyTemplates: DefaultAdvertisingCopyTemplate[] = [
  {
    id: "default-residential-basic",
    propertyGroup: "residential",
    templateName: "기본 안내형",
    titleTemplate: "{{주소}} {{매물유형}} · {{거래조건}}",
    bodyTemplate: "{{매물유형}} 매물 안내입니다.\n\n📍 위치: {{주소}}\n💰 거래 조건: {{거래조건}}\n✔ 관리비: {{관리비}}\n✔ 입주 가능: {{입주가능일}}\n\n✔ 확인한 특징\n{{특징}}\n\n※ 계약 전 세부 조건을 다시 확인해 주세요.",
  },
  {
    id: "default-residential-feature",
    propertyGroup: "residential",
    templateName: "컨디션·생활 특징 강조형",
    titleTemplate: "{{주소}} {{매물유형}} · {{거래조건}}",
    bodyTemplate: "{{매물유형}}의 생활 특징을 확인해 보세요.\n\n📍 위치: {{주소}}\n💰 거래 조건: {{거래조건}}\n✔ 관리비: {{관리비}}\n✔ 입주 가능: {{입주가능일}}\n\n✔ 강조할 특징\n{{특징}}\n\n※ 입력한 사실만 담은 안내 문구입니다. 계약 전 세부 조건을 다시 확인해 주세요.",
  },
  {
    id: "default-apartment-basic",
    propertyGroup: "apartment",
    templateName: "아파트 기본 안내형",
    titleTemplate: "{{주소}} {{매물유형}} · {{거래조건}}",
    bodyTemplate: "{{매물유형}} 매물 안내입니다.\n\n📍 위치: {{주소}}\n💰 거래 조건: {{거래조건}}\n✔ 관리비: {{관리비}}\n✔ 입주 가능: {{입주가능일}}\n\n✔ 확인한 특징\n{{특징}}\n\n※ 계약 전 세부 조건을 다시 확인해 주세요.",
  },
  {
    id: "default-officetel-basic",
    propertyGroup: "officetel",
    templateName: "오피스텔 기본 안내형",
    titleTemplate: "{{주소}} {{매물유형}} · {{거래조건}}",
    bodyTemplate: "{{매물유형}} 매물 안내입니다.\n\n📍 위치: {{주소}}\n💰 거래 조건: {{거래조건}}\n✔ 관리비: {{관리비}}\n✔ 입주 가능: {{입주가능일}}\n\n✔ 확인한 특징\n{{특징}}\n\n※ 계약 전 세부 조건을 다시 확인해 주세요.",
  },
  {
    id: "default-commercial-basic",
    propertyGroup: "commercial",
    templateName: "상가·사무실 기본 안내형",
    titleTemplate: "{{주소}} {{매물유형}} · {{거래조건}}",
    bodyTemplate: "{{매물유형}} 매물 안내입니다.\n\n📍 위치: {{주소}}\n💰 거래 조건: {{거래조건}}\n✔ 관리비: {{관리비}}\n✔ 입주 가능: {{입주가능일}}\n\n✔ 확인한 특징\n{{특징}}\n\n※ 계약 전 세부 조건을 다시 확인해 주세요.",
  },
];
