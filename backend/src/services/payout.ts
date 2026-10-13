export interface Milestone {
  views: number;
  payout: number;
}

/** Total amount a post is entitled to: the HIGHEST milestone crossed (not a sum). */
export function entitledPayout(views: number, milestones: Milestone[]): number {
  let result = 0;
  for (const m of milestones) {
    if (views >= m.views && m.payout > result) result = m.payout;
  }
  return result;
}



export function computePayoutDelta(
  views: number,
  milestones: Milestone[],
  alreadyPaid: number,
  remainingBudget: number
): number {
  const entitled = entitledPayout(views, milestones);
  const owed = Math.max(0, entitled - alreadyPaid);
  return Math.min(owed, Math.max(0, remainingBudget));
}