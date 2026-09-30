import { phoneDigits } from "./validation";

const GREETING = "Hi Sussflow! I have a question about your period care products.";

/** Builds a wa.me link from the admin's WhatsApp URL or contact phone (Nigerian 0… numbers → 234…). */
export function whatsappHref(
  whatsappUrl: string | null | undefined,
  phone: string | null | undefined,
) {
  if (whatsappUrl) {
    try {
      const url = new URL(whatsappUrl);
      if (!url.searchParams.has("text")) url.searchParams.set("text", GREETING);
      return url.toString();
    } catch {
      // Not a full URL — treat it as a number below.
      phone = whatsappUrl;
    }
  }
  if (!phone) return null;
  let digits = phoneDigits(phone);
  if (digits.length === 11 && digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  if (digits.length < 9) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(GREETING)}`;
}
