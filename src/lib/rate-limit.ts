const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || now > hit.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (hit.count >= max) {
    return { ok: false, remaining: 0 };
  }
  hit.count += 1;
  return { ok: true, remaining: max - hit.count };
}

export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}
