// Името, което се показва: организацията (за проверени) или името на човека
export function displayName(p: { full_name: string | null; organization: string | null } | null) {
  return p?.organization || p?.full_name || "Жител";
}
