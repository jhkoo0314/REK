"use client";

import { useMemo, useState } from "react";

export type BuildingSearchOption = { id: string; name: string; address: string };

export function BuildingSearchPicker({ buildings, selectedId, onSelect }: { buildings: BuildingSearchOption[]; selectedId: string; onSelect: (buildingId: string) => void }) {
  const selected = buildings.find((building) => building.id === selectedId);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("ko-KR");
    return buildings.filter((building) => !keyword || `${building.name} ${building.address}`.toLocaleLowerCase("ko-KR").includes(keyword)).slice(0, 8);
  }, [buildings, query]);

  return <div className="relative"><span className="label">기존 건물 검색</span><input className="field" onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="건물명 또는 주소를 입력하세요" value={query} />{selected && <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-[#d8d0c7] bg-[#faf8f4] px-3 py-2 text-xs"><span><b>{selected.name}</b> · {selected.address}</span><button className="font-bold text-[#655f59] underline underline-offset-4" onClick={() => { onSelect(""); setQuery(""); }} type="button">선택 해제</button></div>}{open && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#ded7cf] bg-white p-1 shadow-lg">{results.length ? results.map((building) => <button className="block w-full rounded-md px-3 py-2.5 text-left hover:bg-[#faf8f4]" key={building.id} onClick={() => { onSelect(building.id); setQuery(""); setOpen(false); }} type="button"><b className="text-sm">{building.name}</b><span className="mt-0.5 block text-xs text-[#7b7470]">{building.address}</span></button>) : <p className="px-3 py-4 text-xs text-[#7b7470]">일치하는 등록 건물이 없습니다. 새 건물 입력을 선택해 주세요.</p>}</div>}</div>;
}
