import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PRODUCT_IMAGES_BUCKET, supabase } from "@/lib/supabase";

export async function uploadProductImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images must be 5MB or smaller");
      return;
    }
    setBusy(true);
    try {
      onChange(await uploadProductImage(file));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-foreground/20 bg-glass-soft">
      {value ? (
        <>
          <img src={value} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-background/90 text-foreground/70 shadow hover:text-alert"
            aria-label="Remove image"
          >
            <X className="size-4" />
          </button>
        </>
      ) : null}
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={
          value
            ? "absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold shadow hover:text-brand"
            : "flex size-full flex-col items-center justify-center gap-2 text-sm font-semibold text-foreground/60 hover:text-brand"
        }
      >
        {busy ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <ImagePlus className={value ? "size-4" : "size-7"} />
        )}
        {busy ? "Uploading…" : value ? "Replace" : label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void pick(e.target.files?.[0])}
      />
    </div>
  );
}
