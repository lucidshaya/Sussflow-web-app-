import { Check, Loader2, Plus, X } from "lucide-react";
import { useState } from "react";

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
  saved,
  saving,
  onSave,
}: {
  draft: Settings;
  setDraft: (next: Settings) => void;
  /** The areas currently live (from the database), to show unsaved changes. */
  saved: unknown;
  saving: boolean;
  onSave: (areas: LagosArea[]) => void;
}) {
  // Raw list (not lagosAreas(), which drops unnamed rows) so a name can be cleared while typing.
  const areas: LagosArea[] = Array.isArray(draft.lagos_areas)
    ? (draft.lagos_areas as LagosArea[])
    : lagosAreas(draft);
  const save = (next: LagosArea[]) => setDraft({ ...draft, lagos_areas: next });
  const changed = JSON.stringify(areas) !== JSON.stringify(saved ?? []);
  const [problem, setProblem] = useState<string | null>(null);

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
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="small"
          onClick={() => save([...areas, { id: newId("new-area"), name: "New area", fee: 0 }])}
        >
          <Plus className="size-4" /> Add an area
        </Button>
        <Button
          type="button"
          size="small"
          disabled={saving || !changed}
          onClick={() => {
            const names = areas.map((a) => a.name.trim().toLowerCase());
            if (names.some((n) => !n)) return setProblem("Give every area a name");
            if (new Set(names).size !== names.length)
              return setProblem("Two areas have the same name");
            setProblem(null);
            onSave(areas.map((a) => ({ ...a, name: a.name.trim() })));
          }}
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save
          Lagos areas
        </Button>
        {changed && !saving && (
          <span className="text-xs font-semibold text-alert">Unsaved — click Save Lagos areas</span>
        )}
      </div>
      {problem && (
        <p role="alert" className="mt-1 text-xs font-medium text-alert">
          {problem}
        </p>
      )}
    </div>
  );
}
