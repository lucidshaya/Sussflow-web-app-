import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { variantLabel } from "./format";
import { isSupabaseConfigured, supabase, unwrap } from "./supabase";

export interface CartLine {
  variantId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (variantId: string, quantity?: number) => void;
  update: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "sussflow-cart";
const CartContext = createContext<CartState | null>(null);

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.variantId === "string" &&
        Number.isInteger(line?.quantity) &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage unavailable (private mode etc.) — cart still works for this visit.
    }
  }, [lines, hydrated]);

  const add = useCallback((variantId: string, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.variantId === variantId);
      if (existing)
        return current.map((line) =>
          line.variantId === variantId ? { ...line, quantity: line.quantity + quantity } : line,
        );
      return [...current, { variantId, quantity }];
    });
    setOpen(true);
  }, []);

  const update = useCallback((variantId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.variantId !== variantId)
        : current.map((line) => (line.variantId === variantId ? { ...line, quantity } : line)),
    );
  }, []);

  const remove = useCallback(
    (variantId: string) =>
      setLines((current) => current.filter((line) => line.variantId !== variantId)),
    [],
  );
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      open,
      setOpen,
      add,
      update,
      remove,
      clear,
    }),
    [lines, open, add, update, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export interface CartItemDetail {
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  label: string;
}

interface VariantRow {
  id: string;
  price: number;
  stock: number;
  length_label: string | null;
  pack_size: number;
  products: { name: string; slug: string; image_url: string | null } | null;
}

/** Joins cart lines with live prices from the database. */
export function useCartDetails() {
  const { lines } = useCart();
  const ids = lines.map((line) => line.variantId).sort();

  const query = useQuery({
    queryKey: ["cart-variants", ids],
    enabled: isSupabaseConfigured && ids.length > 0,
    queryFn: async () =>
      unwrap<VariantRow[]>(
        await supabase
          .from("product_variants")
          .select("id, price, stock, length_label, pack_size, products(name, slug, image_url)")
          .in("id", ids),
      ),
  });

  const items: CartItemDetail[] = [];
  for (const line of lines) {
    const row = query.data?.find((variant) => variant.id === line.variantId);
    if (!row || !row.products) continue;
    items.push({
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: row.price,
      lineTotal: row.price * line.quantity,
      stock: row.stock,
      productName: row.products.name,
      productSlug: row.products.slug,
      imageUrl: row.products.image_url,
      label: variantLabel(row, row.products.slug),
    });
  }
  const unavailable = query.isSuccess
    ? lines.filter((line) => !items.some((item) => item.variantId === line.variantId))
    : [];

  return {
    items,
    unavailable,
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    isLoading: query.isLoading,
    error: query.error,
  };
}
