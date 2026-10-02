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

import { choicesText, lineKey, type ChosenOptions } from "./choices";
import { variantLabel } from "./format";
import { isSupabaseConfigured, supabase, unwrap } from "./supabase";

export interface CartLine {
  variantId: string;
  quantity: number;
  /** Customer choices such as flow type and colour (no effect on price). */
  choices?: ChosenOptions;
}

const keyOf = (line: CartLine) => lineKey(line.variantId, line.choices);

interface CartState {
  lines: CartLine[];
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (variantId: string, quantity?: number, choices?: ChosenOptions) => void;
  /** `key` is CartItemDetail.key (variant + choices). */
  update: (key: string, quantity: number) => void;
  remove: (key: string) => void;
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
        line.quantity > 0 &&
        (line.choices === undefined ||
          (typeof line.choices === "object" &&
            Object.values(line.choices as object).every((v) => typeof v === "string"))),
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

  const add = useCallback((variantId: string, quantity = 1, choices?: ChosenOptions) => {
    const added: CartLine = { variantId, quantity, ...(choices && { choices }) };
    const key = keyOf(added);
    setLines((current) => {
      if (current.some((line) => keyOf(line) === key))
        return current.map((line) =>
          keyOf(line) === key ? { ...line, quantity: line.quantity + quantity } : line,
        );
      return [...current, added];
    });
    setOpen(true);
  }, []);

  const update = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => keyOf(line) !== key)
        : current.map((line) => (keyOf(line) === key ? { ...line, quantity } : line)),
    );
  }, []);

  const remove = useCallback(
    (key: string) => setLines((current) => current.filter((line) => keyOf(line) !== key)),
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
  /** Identifies the bag line (variant + choices) for update/remove. */
  key: string;
  variantId: string;
  choices?: ChosenOptions;
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
  size_label: string | null;
  pack_size: number;
  products: {
    name: string;
    slug: string;
    image_url: string | null;
    show_size: boolean;
    show_length: boolean;
  } | null;
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
          .select(
            "id, price, stock, length_label, size_label, pack_size, products(name, slug, image_url, show_size, show_length)",
          )
          .in("id", ids),
      ),
  });

  const items: CartItemDetail[] = [];
  for (const line of lines) {
    const row = query.data?.find((variant) => variant.id === line.variantId);
    if (!row || !row.products) continue;
    const options = choicesText(line.choices);
    items.push({
      key: keyOf(line),
      variantId: line.variantId,
      ...(line.choices && { choices: line.choices }),
      quantity: line.quantity,
      unitPrice: row.price,
      lineTotal: row.price * line.quantity,
      stock: row.stock,
      productName: row.products.name,
      productSlug: row.products.slug,
      imageUrl: row.products.image_url,
      label: [variantLabel(row, row.products), options].filter(Boolean).join(" · "),
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
