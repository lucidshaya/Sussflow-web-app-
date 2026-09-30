export type OrderStatus =
  "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "failed";
export type Fulfilment = "delivery" | "pickup";
export type EnquiryType = "session" | "partnership" | "waitlist" | "contact";
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
export const ENQUIRY_TYPES: EnquiryType[] = ["session", "partnership", "waitlist", "contact"];
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
  pack_size: number;
  price: number; // kobo
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
  free_delivery_threshold: number | null;
  pickup_address: string;
  pickup_instructions: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_url: string | null;
  instagram_url: string | null;
}
