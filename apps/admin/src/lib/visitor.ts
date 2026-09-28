// Minimal visitor-device label: mobile brand only (Apple, Samsung, …).
// Returns null for desktops and unknown agents so the UI stays quiet.
export function mobileBrandFromUA(ua: string | null | undefined): string | null {
  if (!ua) return null;
  if (/iPhone|iPad|iPod/i.test(ua)) return "Apple";
  if (/SM-|Samsung/i.test(ua)) return "Samsung";
  if (/Pixel/i.test(ua)) return "Google";
  if (/OnePlus/i.test(ua)) return "OnePlus";
  if (/Xiaomi|Redmi|POCO|MIUI/i.test(ua)) return "Xiaomi";
  if (/Huawei|HMS|HarmonyOS/i.test(ua) && /Mobile|Android/i.test(ua)) return "Huawei";
  if (/Moto |Motorola/i.test(ua)) return "Motorola";
  if (/Vivo/i.test(ua)) return "Vivo";
  if (/Realme/i.test(ua)) return "Realme";
  if (/OPPO|CPH\d/i.test(ua)) return "Oppo";
  if (/Nokia|HMD/i.test(ua)) return "Nokia";
  if (/Nothing/i.test(ua)) return "Nothing";
  if (/Windows NT|Macintosh|X11.*Linux/i.test(ua) && !/Mobile/i.test(ua)) return null;
  if (/Android/i.test(ua)) return "Android";
  if (/Mobile/i.test(ua)) return "Mobile";
  return null;
}
