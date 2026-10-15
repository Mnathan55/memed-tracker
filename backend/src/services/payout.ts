export interface Target {
  views: number;
  payout: number;
}


export function earnedMoney(views: number, targets: Target[]): number {
  let best = 0;

  for (const t of targets) {
    if (views >= t.views && t.payout > best) {
      best = t.payout;
    }
  }

  return best;
}


export function computePayoutDelta(
  views: number,
  targets: Target[],
  alreadyPaid: number,
  remainingBudget: number
): number {
  const earned = earnedMoney(views, targets);

  // only pay the difference, never go below 0
  let toPay = earned - alreadyPaid;
  if (toPay < 0) toPay = 0;

  
  if (remainingBudget < 0) remainingBudget = 0;
  if (toPay > remainingBudget) toPay = remainingBudget;

  return toPay;
}