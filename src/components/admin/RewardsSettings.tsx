import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { useState } from "react";

import { adminProductsQuery } from "@/lib/admin-queries";
import { formatNaira, variantLabel } from "@/lib/format";
import {
  percentBack,
  pointsEarned,
  pointsValue,
  rewardsSummary,
  type RewardSettings,
} from "@/lib/rewards";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

import { AdminField, adminInput, adminInvalid, LeafSwitch } from "./ui";

/** Admin → Settings → Rewards: on/off, the two point values, and a live calculator. */
export function RewardsSettings({
  draft,
  setDraft,
  errors,
}: {
  draft: Settings;
  setDraft: (next: Settings) => void;
  errors: Partial<Record<string, string>>;
}) {
  const products = useQuery(adminProductsQuery);
  const [variantId, setVariantId] = useState("");
  const [customAmount, setCustomAmount] = useState("10000");

  const rules: RewardSettings = {
    rewards_enabled: draft.rewards_enabled ?? false,
    reward_spend_per_point: draft.reward_spend_per_point ?? 10000,
    reward_point_value: draft.reward_point_value ?? 200,
  };
  const options = (products.data ?? []).flatMap((p) =>
    p.product_variants
      .filter((v) => v.is_active && v.price > 0)
      .map((v) => ({
        id: v.id,
        label: `${p.name}${variantLabel(v, p) ? ` · ${variantLabel(v, p)}` : ""} — ${formatNaira(v.price)}`,
        price: v.price,
      })),
  );
  const picked = options.find((o) => o.id === variantId);
  const amount = picked ? picked.price : Math.round(Number(customAmount) * 100) || 0;
  const earned = pointsEarned(amount, rules);
  const pointsFor1000 = Math.ceil(100000 / rules.reward_point_value);

  const naira = (key: "reward_spend_per_point" | "reward_point_value") => ({
    type: "number" as const,
    min: 1,
    step: 1,
    value: rules[key] / 100,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft({ ...draft, [key]: Math.max(0, Math.round(Number(e.target.value) * 100)) }),
    className: cn(adminInput, errors[key] && adminInvalid),
  });

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Gift className="size-5 text-brand" /> Rewards (points)
      </h2>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm font-semibold">
        Turn on rewards (customers with an account earn and spend points)
        <LeafSwitch
          checked={rules.rewards_enabled}
          onCheckedChange={(checked) => setDraft({ ...draft, rewards_enabled: checked })}
          aria-label="Turn on rewards"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <AdminField
          label="Spend (₦) to earn 1 point"
          error={errors["reward_spend_per_point"]}
          hint="e.g. 100 → a ₦15,500 order earns 155 points"
        >
          <input {...naira("reward_spend_per_point")} />
        </AdminField>
        <AdminField
          label="1 point is worth (₦)"
          error={errors["reward_point_value"]}
          hint="Discount per point at checkout, e.g. 2"
        >
          <input {...naira("reward_point_value")} />
        </AdminField>
      </div>

      <div className="rounded-2xl border border-glass-border bg-glass-soft p-4 text-sm">
        <p className="font-semibold">Calculator</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_10rem] [&>*]:min-w-0">
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className={adminInput}
            aria-label="Product for the example"
          >
            <option value="">Type an amount instead →</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            step={100}
            value={picked ? picked.price / 100 : customAmount}
            disabled={Boolean(picked)}
            onChange={(e) => setCustomAmount(e.target.value)}
            className={adminInput}
            aria-label="Order amount in naira"
          />
        </div>
        <p className="mt-3 leading-relaxed">
          A <strong>{formatNaira(amount)}</strong> purchase earns <strong>{earned} points</strong> ={" "}
          <strong>{formatNaira(pointsValue(earned, rules))}</strong> off a future order (
          <strong>{percentBack(rules).toFixed(1)}% back</strong>).
        </p>
        <p className="mt-1 text-foreground/65">
          A customer needs {pointsFor1000} points for {formatNaira(100000)} off, which is about{" "}
          {formatNaira(pointsFor1000 * rules.reward_spend_per_point)} of shopping.
        </p>
        <p className="mt-2 text-xs text-foreground/55">
          Customers see: “{rewardsSummary(rules)}” Points are earned when an order is paid, on the
          products total (not delivery), and can pay for products down to ₦100.
        </p>
      </div>
    </div>
  );
}
