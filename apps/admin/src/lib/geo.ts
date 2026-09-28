// Best-effort IP → "City, Country" for the Community page. Free lookup
// (ip-api.com, no key), in-memory 24h cache, private IPs skipped, 2.5s
// timeout — never blocks the page, failures resolve to null ("if possible").
type CacheHit = { loc: string | null; exp: number };
const cache = new Map<string, CacheHit>();

function isPublicIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  const v4 =
    /^(127\.)|(10\.)|(192\.168\.)|(172\.(1[6-9]|2\d|3[01])\.)|(0\.0\.0\.0)|(169\.254\.)/.test(
      ip
    );
  if (v4) return false;
  if (ip === "::1" || ip.startsWith("fe80") || ip.startsWith("fc00")) return false;
  return true;
}

async function locateOne(ip: string): Promise<string | null> {
  const hit = cache.get(ip);
  if (hit && hit.exp > Date.now()) return hit.loc;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    const j = (await res.json().catch(() => null)) as {
      status?: string;
      city?: string;
      country?: string;
    } | null;
    const loc =
      j?.status === "success"
        ? [j.city, j.country].filter(Boolean).join(", ") || null
        : null;
    cache.set(ip, { loc, exp: Date.now() + 24 * 3600 * 1000 });
    return loc;
  } catch {
    cache.set(ip, { loc: null, exp: Date.now() + 60 * 60 * 1000 });
    return null;
  }
}

export async function locateIps(ips: (string | null)[]): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  const uniq = [...new Set(ips.filter((ip): ip is string => !!ip && isPublicIp(ip)))].slice(0, 30);
  await Promise.all(uniq.map(async (ip) => out.set(ip, await locateOne(ip))));
  return out;
}
