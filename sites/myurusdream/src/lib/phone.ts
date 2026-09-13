/** Belgian-friendly GSM normalisation so 0470… and +32 470… match. */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("32") && digits.length >= 10) return digits;
  if (digits.startsWith("0") && digits.length >= 9) return `32${digits.slice(1)}`;
  return digits;
}

export function isLikelyPhone(normalized: string) {
  return normalized.length >= 9 && normalized.length <= 15;
}

export function phonesMatch(
  stored: string | null | undefined,
  storedNormalized: string | null | undefined,
  input: string,
) {
  const n = normalizePhone(input);
  if (!n) return false;
  if (storedNormalized && storedNormalized === n) return true;
  if (stored && normalizePhone(stored) === n) return true;
  return false;
}

export function isRoutablePublicIp(ip: string) {
  const v = ip.trim().toLowerCase();
  if (!v || v === "unknown" || v === "::1" || v === "localhost") return false;
  if (v.startsWith("127.") || v === "0.0.0.0") return false;
  if (v.startsWith("10.")) return false;
  if (v.startsWith("192.168.")) return false;
  if (v.startsWith("172.")) {
    const second = Number(v.split(".")[1]);
    if (second >= 16 && second <= 31) return false;
  }
  if (v.startsWith("::ffff:127.")) return false;
  return true;
}
