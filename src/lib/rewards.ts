import { formatNaira } from "./format";
import type { Settings } from "./types";

// Points rewards (Admin → Settings → Rewards). Amounts are kobo. Used by the checkout page,
// the payment server functions and the dashboard calculator, so they always agree.

export interface RewardSettings {
  rewards_enabled: boolean;
  reward_spend_per_point: number;
  reward_point_value: number;
}

type MaybeRewards =
  | Pick<Settings, "rewards_enabled" | "reward_spend_per_point" | "reward_point_value">
  | null
  | undefined;

export const rewardsActive = (s: MaybeRewards): s is MaybeRewards & RewardSettings =>
  Boolean(s?.rewards_enabled && s.reward_spend_per_point && s.reward_point_value);

/** Points earned for spending `amount` (kobo) on products. */
export const pointsEarned = (amount: number, s: RewardSettings) =>
  Math.max(0, Math.floor(amount / s.reward_spend_per_point));

/** Discount (kobo) that `points` are worth. */
export const pointsValue = (points: number, s: RewardSettings) =>
  Math.max(0, points) * s.reward_point_value;

/** Paystack can't take a ₦0 payment, so points leave at least ₦100 to pay on the products. */
export const MIN_PRODUCTS_PAYABLE = 10000;

/** Most points usable on an order: limited by the balance and the products subtotal. */
export function maxRedeemable(balance: number, subtotal: number, s: RewardSettings) {
  const coverable = Math.max(0, subtotal - MIN_PRODUCTS_PAYABLE);
  return Math.max(0, Math.min(balance, Math.floor(coverable / s.reward_point_value)));
}

/** Percentage of spend given back, e.g. 2 for "earn 1 point per ₦100, 1 point = ₦2". */
export const percentBack = (s: RewardSettings) =>
  (s.reward_point_value / s.reward_spend_per_point) * 100;

export function rewardsSummary(s: RewardSettings) {
  return `Earn 1 point for every ${formatNaira(s.reward_spend_per_point)} you spend. Each point is worth ${formatNaira(s.reward_point_value)} off a future order.`;
}
