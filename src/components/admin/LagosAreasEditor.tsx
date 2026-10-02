import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { lagosAreas, type LagosArea } from "@/lib/delivery";
import type { Settings } from "@/lib/types";

import { adminInput } from "./ui";

const newId = (name: string) =>
  `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "area"
  }-${Math.random().toString(36).slice(2, 6)}`;

/** Admin → Settings: delivery areas inside Lagos, each with its own fee. */
export function LagosAreasEditor({
  draft,
  setDraft,
}: {
  draft: Settings;
  setDraft: (next: Settings) => void;
}) {
  // Raw list (not lagosAreas(), which drops unnamed rows) so a name can be cleared while typing.
  const areas: LagosArea[] = Array.isArray(draft.lagos_areas)
    ? (draft.lagos_areas as LagosArea[])
    : lagosAreas(draft);
  const save = (next: LagosArea[]) => setDraft({ ...draft, lagos_areas: next });

  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-semibold uppercase text-foreground/55">Lagos delivery areas (₦)</p>
      <p className="mt-1 text-xs text-foreground/55">
        Customers delivering to Lagos choose one of these areas at checkout and pay its fee.
      </p>
      <ul className="mt-2 space-y-2">
        {areas.map((area, i) => (
          <li key={area.id} className="grid grid-cols-[1fr_7rem_auto] gap-2 [&>*]:min-w-0">
            <input
              value={area.name}
              maxLength={80}
              onChange={(e) =>
                save(areas.map((a, j) => (j === i ? { ...a, name: e.target.value } : a)))
              }
              aria-label="Area name"
              placeholder="e.g. Mainland"
              className={adminInput}
            />
            <input
              type="number"
              min={0}
              step={50}
              value={area.fee / 100}
              onChange={(e) =>
                save(
                  areas.map((a, j) =>
                    j === i
                      ? { ...a, fee: Math.max(0, Math.round(Number(e.target.value) * 100) || 0) }
                      : a,
                  ),
                )
              }
              aria-label={`Fee for ${area.name || "area"}`}
              className={adminInput}
            />
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => save(areas.filter((_, j) => j !== i))}
              aria-label={`Remove ${area.name || "area"}`}
            >
              <X className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="ghost"
        size="small"
        className="mt-2"
        onClick={() => save([...areas, { id: newId("new-area"), name: "New area", fee: 0 }])}
      >
        <Plus className="size-4" /> Add an area
      </Button>
    </div>
  );
}
