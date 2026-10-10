import { isParameterIdKey } from "./parameters";

export function isRegistryParameterId(id: string): boolean {
  return isParameterIdKey(id);
}

export function assertRegistryParameterIds(ids: string[]): string | null {
  if (!ids.length) return "Parametre listesi boş";
  const seen = new Set<string>();
  for (const id of ids) {
    if (!isRegistryParameterId(id)) {
      return "Geçersiz parametre kimliği";
    }
    if (seen.has(id)) return "Yinelenen parametre kimliği";
    seen.add(id);
  }
  return null;
}

export function sameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((id, i) => id === sb[i]);
}
