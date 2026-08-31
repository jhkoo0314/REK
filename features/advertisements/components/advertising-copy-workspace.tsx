"use client";

import { defaultAdvertisingCopyTemplates } from "@/features/advertisements/default-copy-templates";
import { hasSensitiveCopy, propertyGroupLabels, propertyGroups, type PropertyGroup } from "@/features/advertisements/schemas/advertising-copy-template";
import { useState } from "react";

const roomTypes = ["원룸", "투룸", "투베이", "쓰리룸", "쓰리베이", "기타"];
const titleOptions: Record<string, string[]> = { 원룸: ["🏠 첫 자취라면 꼭 한 번 보셔야 할 원룸!", "🏡 깔끔한 원룸, 몸만 들어오시면 됩니다.", "🌞 채광 좋은 원룸입니다."], 투룸: ["🏡 신혼부부 추천! 넓고 깔끔한 투룸.", "🏠 방 2개, 거실까지 여유로운 투룸!", "💰 월세 부담 적은 가성비 투룸."], 쓰리룸: ["🏡 가족 거주에 여유로운 쓰리룸입니다.", "🏠 방 3개로 생활공간을 넉넉하게 나눠 쓰는 쓰리룸!"] };
const regionNotes: Record<string, string[]> = { 북수리: ["배방·월천 생활권을 함께 고려하기 좋은 위치", "삼성전자 온양캠퍼스 출퇴근 편리한 위치"], 공수리: ["배방복합커뮤니티센터 생활권을 고려하는 위치"], 장재리: ["천안아산역과 배방 생활권을 함께 고려하는 위치"], 월천지구: ["배방·탕정 생활권을 함께 고려하는 위치"] };

export function AdvertisingCopyWorkspace() {
  const [group, setGroup] = useState<PropertyGroup>("residential");
  return <section className="space-y-5 rounded-xl border border-[#e5e1db] bg-white p-5">
    <div><h2 className="font-extrabold">매물 유형별 광고 문구</h2><p className="mt-1 text-xs text-[#77736e]">확인한 사실만 입력해 문구를 만들고 수정·복사합니다. 결과는 저장되지 않으며 매물 상태도 바꾸지 않습니다.</p></div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{propertyGroups.map((item) => <button type="button" key={item} onClick={() => setGroup(item)} className={group === item ? "rounded-lg border border-[#a85f43] bg-[#f7ebe5] px-3 py-2 text-xs font-bold text-[#a84438]" : "rounded-lg border border-[#e5e1db] px-3 py-2 text-xs font-bold text-[#655f59]"}>{propertyGroupLabels[item]}</button>)}</div>
    {group === "residential" ? <ResidentialCopy /> : <OtherCopy group={group} />}
  </section>;
}

function ResidentialCopy() {
  const [room, setRoom] = useState("원룸"); const [transaction, setTransaction] = useState("월세"); const [condition, setCondition] = useState("신축급"); const [emphasis, setEmphasis] = useState("컨디션"); const [titleChoice, setTitleChoice] = useState("");
  const [values, setValues] = useState({ location: "", deposit: "", rent: "", fee: "", available: "", special: "", option: "", region: "", actual: false, photo: false });
  const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [message, setMessage] = useState("");
  const family = room === "원룸" ? "원룸" : room === "쓰리룸" ? "쓰리룸" : "투룸";
  const emphasisOptions = condition === "신축급" ? ["컨디션", "공간", "특별매물"] : ["가격", "공간", "계약조건", "특별매물"];
  function set(key: keyof typeof values, value: string | boolean) { setValues({ ...values, [key]: value }); }
  function generate() {
    if ([values.location, values.deposit, values.rent, values.fee, values.available, values.special, values.option].some(hasSensitiveCopy)) return setMessage("연락처·비밀번호·내부 메모는 광고 문구에 넣을 수 없습니다.");
    if (emphasis === "특별매물" && !values.special.trim()) return setMessage("특별매물은 이 매물의 특별한 점을 한 줄로 입력해 주세요.");
    const points = [condition === "신축급" ? "깔끔하게 관리된 신축급 컨디션" : "조건과 생활공간을 함께 비교하기 좋은 매물", emphasis === "공간" ? "여유 있는 실사용 공간을 중요하게 보는 분께 추천" : "", values.special].filter(Boolean);
    const price = transaction === "가격 문의" ? ["가격은 문의로 확인해 주세요."] : transaction === "전세" ? [values.deposit ? "전세: " + values.deposit + "만원" : "가격은 문의로 확인해 주세요."] : [values.deposit && "보증금: " + values.deposit + "만원", values.rent && "월세: " + values.rent + "만원"].filter(Boolean);
    if (values.fee) price.push("관리비: " + values.fee + "만원");
    if (values.available) price.push("입주가능일: " + values.available);
    const notices = [values.actual && "본 매물은 실매물입니다.", values.photo && "사진은 실제 해당 호실 촬영본입니다. 방문 시 최종 확인해 주세요.", "다가구주택은 호실별 전용면적을 참고용으로 안내드립니다.", "계약 가능 여부 및 옵션은 실시간으로 변경될 수 있으므로 방문 전 문의 부탁드립니다."].filter(Boolean);
    setTitle(titleChoice || (values.location + " " + room).trim() || room);
    setBody(["찾으시는 조건에 맞춰 다양한 매물을 비교해드립니다.", "", "────────────", "", condition + " " + room + " 매물의 확인한 특징을 안내합니다.", "", "💡 이 매물의 포인트", ...points.map((item) => "• " + item), "", "💰 조건", ...(price.length ? price : ["가격은 문의로 확인해 주세요."]), "", "📍 위치", values.location || "위치는 문의로 확인해 주세요.", "", "🛋️ 옵션", values.option || "냉장고, 세탁기, 에어컨 등 생활 기본 옵션을 갖춘 실용적인 구성", ...(values.region ? ["", "🚉 교통 & 생활", ...regionNotes[values.region]] : []), "", "🤝 비교 상담", "다양한 원룸·투룸 매물을 보유하고 있어", "원하시는 조건에 맞춰 비교 상담해드립니다.", "", "📌 안내사항", ...notices.map((item) => "✔ " + item)].join("\n"));
    setMessage("문구를 만들었습니다. 결과를 필요한 만큼 수정한 뒤 복사하세요.");
  }
  return <div className="grid gap-5 xl:grid-cols-2"><div className="grid gap-3 sm:grid-cols-2">
    <Text label="지역 또는 지번" value={values.location} set={(value) => set("location", value)} placeholder="예: 장재리 1684" />
    <Select label="방 형태" value={room} set={(value) => { setRoom(value); setTitleChoice(""); }} options={roomTypes} />
    <Select label="거래 방식" value={transaction} set={setTransaction} options={["월세", "전세", "보증부월세", "가격 문의"]} />
    <Select label="룸 제목 템플릿" value={titleChoice} set={setTitleChoice} options={titleOptions[family]} blank="기본 제목" />
    <Text label="보증금 (만원 · 선택)" value={values.deposit} set={(value) => set("deposit", value)} />
    <Text label="월세 (만원 · 선택)" value={values.rent} set={(value) => set("rent", value)} />
    <Text label="관리비 (만원 · 선택)" value={values.fee} set={(value) => set("fee", value)} />
    <Text label="입주 가능일 (선택)" value={values.available} set={(value) => set("available", value)} placeholder="예: 즉시 가능" />
    <Select label="매물 컨디션" value={condition} set={(value) => { setCondition(value); setEmphasis(value === "신축급" ? "컨디션" : "가격"); }} options={["신축급", "구축"]} />
    <Select label="가장 강조할 점" value={emphasis} set={setEmphasis} options={emphasisOptions} />
    <Text label={emphasis === "특별매물" ? "이 매물의 특별한 점 *" : "특별 포인트 추가 (선택)"} value={values.special} set={(value) => set("special", value)} />
    <Text label="옵션 문구 수정 (선택)" value={values.option} set={(value) => set("option", value)} />
    <Select label="지역 생활권 문구" value={values.region} set={(value) => set("region", value)} options={Object.keys(regionNotes)} blank="선택 안 함" />
    <div className="space-y-2 text-xs text-[#655f59]"><Check label="실매물 확인됨" checked={values.actual} set={(value) => set("actual", value)} /><Check label="실제 호실 사진 확인됨" checked={values.photo} set={(value) => set("photo", value)} /></div>
    <button type="button" onClick={generate} className="sm:col-span-2 rounded-lg bg-[#3e3a37] px-4 py-3 text-sm font-bold text-white">광고 문구 생성</button>
  </div><Result title={title} body={body} setTitle={setTitle} setBody={setBody} message={message} setMessage={setMessage} /></div>;
}

function OtherCopy({ group }: { group: Exclude<PropertyGroup, "residential"> }) {
  const template = defaultAdvertisingCopyTemplates.find((item) => item.propertyGroup === group)!;
  const [values, setValues] = useState({ 주소: "", 매물유형: "", 거래조건: "", 관리비: "", 입주가능일: "", 특징: "" }); const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [message, setMessage] = useState("");
  function generate() { if (Object.values(values).some(hasSensitiveCopy)) return setMessage("민감한 정보는 광고 문구에 넣을 수 없습니다."); const next = { ...values, 매물유형: values.매물유형 || propertyGroupLabels[group] }; const render = (text: string) => text.replace(/\{\{([^{}]+)\}\}/g, (_, key: string) => next[key.trim() as keyof typeof next] || ""); setTitle(render(template.titleTemplate)); setBody(render(template.bodyTemplate)); setMessage("문구를 만들었습니다. 결과를 필요한 만큼 수정한 뒤 복사하세요."); }
  return <div className="grid gap-5 xl:grid-cols-2"><div className="grid gap-3 sm:grid-cols-2">{(Object.keys(values) as Array<keyof typeof values>).map((key) => <Text key={key} label={key} value={values[key]} set={(value) => setValues({ ...values, [key]: value })} />)}<button type="button" onClick={generate} className="sm:col-span-2 rounded-lg bg-[#3e3a37] px-4 py-3 text-sm font-bold text-white">광고 문구 생성</button></div><Result title={title} body={body} setTitle={setTitle} setBody={setBody} message={message} setMessage={setMessage} /></div>;
}

function Result({ title, body, setTitle, setBody, message, setMessage }: { title: string; body: string; setTitle: (value: string) => void; setBody: (value: string) => void; message: string; setMessage: (value: string) => void }) {
  async function copy(value: string, label: string) { if (!value.trim()) return setMessage("먼저 문구를 만들어 주세요."); if (hasSensitiveCopy(value)) return setMessage("결과에 민감한 정보가 있어 복사할 수 없습니다."); try { await navigator.clipboard.writeText(value); setMessage(label + "을 복사했습니다."); } catch { setMessage("자동 복사가 되지 않았습니다. 문구를 직접 선택해 복사해 주세요."); } }
  return <div className="rounded-lg border border-[#eeeae5] p-4"><h3 className="font-extrabold">복사 전 결과 확인</h3><p className="mt-1 text-xs text-[#77736e]">연락처, 비밀번호, 출입·내부 메모는 결과에 넣을 수 없습니다.</p><div className="mt-4"><Text label="광고 제목 수정" value={title} set={setTitle} textarea /></div><div className="mt-4"><Text label="광고 상세문구 수정" value={body} set={setBody} textarea /></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => copy(title, "제목")} className="rounded-md border px-3 py-2 text-xs font-bold">제목 복사</button><button type="button" onClick={() => copy(body, "본문")} className="rounded-md border px-3 py-2 text-xs font-bold">본문 복사</button><button type="button" onClick={() => copy(title + "\n" + body, "제목과 본문")} className="rounded-md border px-3 py-2 text-xs font-bold">전체 복사</button></div>{message && <p className="mt-3 text-xs text-[#655f59]">{message}</p>}</div>;
}
function Text({ label, value, set, placeholder, textarea }: { label: string; value: string; set: (value: string) => void; placeholder?: string; textarea?: boolean }) { return <label><span className="label">{label}</span>{textarea ? <textarea className="field min-h-24 py-2" value={value} onChange={(event) => set(event.target.value)} /> : <input className="field" value={value} placeholder={placeholder} onChange={(event) => set(event.target.value)} />}</label>; }
function Select({ label, value, set, options, blank }: { label: string; value: string; set: (value: string) => void; options: string[]; blank?: string }) { return <label><span className="label">{label}</span><select className="field" value={value} onChange={(event) => set(event.target.value)}>{blank && <option value="">{blank}</option>}{options.map((item) => <option key={item}>{item}</option>)}</select></label>; }
function Check({ label, checked, set }: { label: string; checked: boolean; set: (value: boolean) => void }) { return <label className="flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => set(event.target.checked)} />{label}</label>; }
