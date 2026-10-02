export type OrderStatus =
  "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "failed";
export type Fulfilment = "delivery" | "pickup";
export type EnquiryType =
  "session" | "partnership" | "stockist" | "distributor" | "waitlist" | "contact";
export type EnquiryStatus = "new" | "in_progress" | "closed";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
];
export const ENQUIRY_TYPES: EnquiryType[] = [
  "session",
  "partnership",
  "stockist",
  "distributor",
  "waitlist",
  "contact",
];
export const ENQUIRY_STATUSES: EnquiryStatus[] = ["new", "in_progress", "closed"];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort: number;
}

export interface Variant {
  id: string;
  product_id: string;
  length_label: string | null;
  /** Size such as XS, M or "Size 1 (Small)" (0007 migration). */
  size_label: string | null;
  pack_size: number;
  price: number; // kobo
  /** Display-only "was" price for deals (0004 migration); checkout always charges `price`. */
  compare_at_price?: number | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
  sort: number;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  tagline: string | null;
  short_detail: string | null;
  description: string | null;
  perfect_for: string | null;
  image_url: string | null;
  gallery: string[];
  is_active: boolean;
  featured: boolean;
  sort: number;
  created_at: string;
  /** Show each price option's size (XS–4XL, Size 1…) and/or its length (16") on the site. */
  show_size: boolean;
  show_length: boolean;
  /** Optional product video link, shown as a "Watch video" button. */
  video_url: string | null;
  /** Extra customer choices, e.g. flow type and colour (see src/lib/choices.ts). */
  choices: unknown;
}

export interface ProductWithVariants extends Product {
  product_variants: Variant[];
  categories: Pick<Category, "name" | "slug"> | null;
}

export interface Order {
  id: string;
  reference: string;
  user_id: string | null;
  email: string;
  full_name: string;
  phone: string;
  fulfilment: Fulfilment;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  admin_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  /** Points rewards (0008 migration). */
  points_redeemed?: number;
  points_discount?: number;
  points_earned?: number;
  status: OrderStatus;
  paystack_payload: Record<string, unknown> | null;
  paid_at: string | null;
  // Set by the 0003_order_timeline trigger; absent until that migration runs.
  processing_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface Enquiry {
  id: string;
  type: EnquiryType;
  name: string;
  organisation: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  beneficiaries: number | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Settings {
  id: number;
  lagos_delivery_fee: number;
  nationwide_delivery_fee: number;
  /** Waybill fee per zone (kobo), keyed by DELIVERY_ZONES ids (0007 migration). */
  zone_fees?: Record<string, number> | null;
  announcement_enabled?: boolean;
  announcement_text?: string;
  announcement_link?: string | null;
  /** Points rewards (0008 migration). Amounts in kobo. */
  rewards_enabled?: boolean;
  reward_spend_per_point?: number;
  reward_point_value?: number;
  free_delivery_threshold: number | null;
  pickup_address: string;
  pickup_instructions: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_url: string | null;
  instagram_url: string | null;
  // Added by 0004_deals_socials; absent until that migration runs.
  tiktok_url?: string | null;
  facebook_url?: string | null;
  // Added by 0005_kits_socials_security.
  linkedin_url?: string | null;
  x_url?: string | null;
  google_business_url?: string | null;
}

export type BundleItemKind = "included" | "addon" | "related";

/** A line in a kit: a catalogue product or free text ("Carry-on pouch"). */
export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string | null;
  label: string | null;
  kind: BundleItemKind;
  quantity: number;
  sort: number;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  image_url: string | null;
  body: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface RewardLedgerRow {
  id: string;
  user_id: string;
  order_id: string | null;
  points: number;
  reason: "earned" | "redeemed" | "reversed" | "adjustment";
  note: string | null;
  created_at: string;
}
