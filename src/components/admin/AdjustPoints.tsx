import { Gift, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";

import { adminInput, AdminField } from "./ui";

/** Add or remove points for one customer account (writes an "adjustment" ledger row). */
export function AdjustPoints({
  userId,
  name,
  balance,
  onDone,
}: {
  userId: string;
  name: string;
  balance: number;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const amount = Number.parseInt(points, 10);
  const valid = Number.isInteger(amount) && amount !== 0 && balance + amount >= 0;

  return (
    <>
      <Button
        variant="ghost"
        size="small"
        onClick={() => setOpen(true)}
        aria-label={`Adjust points for ${name}`}
      >
        <Gift className="size-4" /> {balance}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="font-display text-xl">Adjust points</DialogTitle>
          <p className="text-sm text-foreground/65">
            {name} has <strong>{balance}</strong> points.
          </p>
          <AdminField
            label="Points to add (use − to remove)"
            hint={
              points && !valid
                ? balance + amount < 0
                  ? "That would make the balance negative"
                  : "Enter a whole number, e.g. 50 or -20"
                : undefined
            }
          >
            <input
              type="number"
              step={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g. 50"
              className={adminInput}
            />
          </AdminField>
          <AdminField label="Reason (shown to the customer)">
            <input
              value={note}
              maxLength={200}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Birthday bonus"
              className={adminInput}
            />
          </AdminField>
          <Button
            disabled={!valid || busy}
            onClick={async () => {
              setBusy(true);
              const { error } = await supabase.from("reward_ledger").insert({
                user_id: userId,
                points: amount,
                reason: "adjustment",
                note: note.trim() || null,
              });
              setBusy(false);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success(`${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} points`);
              setOpen(false);
              setPoints("");
              setNote("");
              onDone();
            }}
          >
            {busy && <Loader2 className="size-4 animate-spin" />} Save
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
