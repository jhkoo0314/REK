export function normalizeForMatch(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR").replace(/\s+/g, "");
}

export function normalizeUnitNumber(value: string) {
  return normalizeForMatch(value).replace(/호$/, "");
}
