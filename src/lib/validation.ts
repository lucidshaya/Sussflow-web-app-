import { z } from "zod";

// Shared form rules — used by the browser forms (instant feedback) and by the
// server functions (so bad data can't be posted around the UI).

export const PHONE_MIN_DIGITS = 9;
export const PHONE_MAX_DIGITS = 15; // E.164 maximum

/** Digits only, e.g. "+234 801-234 5678" → "2348012345678". */
export const phoneDigits = (value: string) => value.replace(/\D/g, "");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Enter your phone number")
  .regex(/^\+?[\d\s\-().]+$/, "Use digits only (spaces, +, - and brackets are fine)")
  .refine((v) => phoneDigits(v).length >= PHONE_MIN_DIGITS, {
    message: `Phone number must have at least ${PHONE_MIN_DIGITS} digits`,
  })
  .refine((v) => phoneDigits(v).length <= PHONE_MAX_DIGITS, {
    message: `Phone number can't have more than ${PHONE_MAX_DIGITS} digits`,
  })
  .refine((v) => !/^(\d)\1+$/.test(phoneDigits(v)), { message: "Enter a real phone number" });

export const optionalPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v || undefined)
  .pipe(phoneSchema.optional());

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter your full name")
  .max(120, "Name is too long")
  .regex(/\p{L}/u, "Name must contain letters")
  .refine((v) => !/\d{3,}/.test(v), { message: "Name shouldn't contain numbers" });

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .max(254, "Email is too long")
  .email("Enter a valid email address")
  // Reserved/test TLDs that Paystack and mail providers reject.
  .refine((v) => !/\.(test|example|invalid|localhost)$/i.test(v), {
    message: "Enter a real email address",
  });

export const addressSchema = z
  .string()
  .trim()
  .min(5, "Enter your full delivery address")
  .max(300, "Address is too long")
  .regex(/\p{L}/u, "Enter a real address");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((v) => v || undefined)
    .optional();

export const checkoutCustomerSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    fulfilment: z.enum(["delivery", "pickup"]),
    address: z.string().trim().optional(),
    city: optionalText(80),
    state: z.string().trim().max(80).optional(),
    notes: optionalText(500),
  })
  .superRefine((value, ctx) => {
    if (value.fulfilment !== "delivery") return;
    const address = addressSchema.safeParse(value.address ?? "");
    if (!address.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: address.error.issues[0]?.message ?? "Enter your address",
      });
    }
    if (!value.state) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["state"], message: "Choose your state" });
    }
  });

export const ENQUIRY_TYPE_VALUES = ["session", "partnership", "waitlist", "contact"] as const;

export const enquirySchema = z
  .object({
    type: z.enum(ENQUIRY_TYPE_VALUES),
    name: nameSchema,
    email: emailSchema,
    phone: optionalPhoneSchema,
    organisation: optionalText(160),
    location: optionalText(160),
    beneficiaries: z
      .union([
        z.literal(""),
        z.coerce
          .number()
          .int("Use a whole number")
          .min(1, "Must be at least 1")
          .max(10_000_000, "That number is too large"),
      ])
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v)),
    message: optionalText(2000),
  })
  .superRefine((value, ctx) => {
    // Schools/NGOs need a way to be called back.
    if ((value.type === "session" || value.type === "partnership") && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Add a phone number so we can reach you",
      });
    }
  });

export const waitlistSchema = z.object({ email: emailSchema });

export const profileSchema = z.object({
  full_name: nameSchema,
  phone: optionalPhoneSchema,
  address: z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .pipe(addressSchema.optional()),
  city: optionalText(80),
  state: optionalText(80),
});

export type FieldErrors = Partial<Record<string, string>>;

/** First message per field, keyed by the field's path (e.g. "phone"). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    out[key] ??= issue.message;
  }
  return out;
}

/** Turns a zod error thrown by a server function into a readable sentence. */
export function readableError(error: unknown, fallback = "Something went wrong") {
  if (!(error instanceof Error)) return fallback;
  try {
    const parsed: unknown = JSON.parse(error.message);
    if (Array.isArray(parsed) && parsed[0] && typeof parsed[0].message === "string")
      return parsed[0].message as string;
  } catch {
    // not a JSON-encoded zod error
  }
  return error.message || fallback;
}

// ── Admin forms ──────────────────────────────────────────────────────────────

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => v || undefined)
  .pipe(emailSchema.optional());

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .transform((v) => v || undefined)
    .pipe(
      z
        .string()
        .url(`${label} must be a full link starting with https://`)
        .refine((v) => /^https?:\/\//.test(v), `${label} must start with https://`)
        .optional(),
    );

/** Customer details on an order, edited by an admin. */
export const adminOrderCustomerSchema = z
  .object({
    full_name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    fulfilment: z.enum(["delivery", "pickup"]),
    address: z.string().trim().optional(),
    city: optionalText(80),
    state: optionalText(80),
  })
  .superRefine((value, ctx) => {
    if (value.fulfilment !== "delivery") return;
    const address = addressSchema.safeParse(value.address ?? "");
    if (!address.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: address.error.issues[0]?.message ?? "Enter the delivery address",
      });
    }
  });

const naira = (label: string) =>
  z
    .number({ invalid_type_error: `${label} must be a number` })
    .int(`${label} must be a whole amount`)
    .min(0, `${label} can't be negative`)
    .max(100_000_000_00, `${label} is too large`);

export const adminOrderStatusSchema = z.object({
  delivery_fee: naira("Delivery fee"),
  admin_notes: optionalText(2000),
});

/** WhatsApp can be a wa.me link or just the phone number. */
const whatsappSchema = z
  .string()
  .trim()
  .transform((v) => v || undefined)
  .pipe(
    z
      .string()
      .refine(
        (v) =>
          /^https:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)\//.test(v) ||
          phoneSchema.safeParse(v).success,
        "Use a wa.me link (https://wa.me/234…) or a phone number with at least 9 digits",
      )
      .optional(),
  );

export const settingsSchema = z.object({
  lagos_delivery_fee: naira("Lagos delivery fee"),
  nationwide_delivery_fee: naira("Outside Lagos fee"),
  free_delivery_threshold: naira("Free delivery amount").nullable(),
  pickup_address: z.string().trim().min(5, "Enter the full pickup address").max(300),
  pickup_instructions: optionalText(1000),
  contact_email: optionalEmail,
  contact_phone: optionalPhoneSchema,
  whatsapp_url: whatsappSchema,
  instagram_url: optionalUrl("Instagram link"),
});

export const productBasicsSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name").max(120, "Name is too long"),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL slug")
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
  sort: z.number().int("Sort order must be a whole number"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only"),
});
