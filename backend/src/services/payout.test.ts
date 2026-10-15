import { earnedMoney, computePayoutDelta, Target } from './payout';

const ladder: Target[] = [
  { views: 10000, payout: 500 },
  { views: 50000, payout: 2000 },
  { views: 100000, payout: 5000 },
];

describe('earnedMoney', () => {
  test('0 below the first target', () => {
    expect(earnedMoney(9999, ladder)).toBe(0);
  });

  test('exactly on a target counts as reached', () => {
    expect(earnedMoney(10000, ladder)).toBe(500);
  });

  test('highest target only, not a sum', () => {
    expect(earnedMoney(60000, ladder)).toBe(2000);
  });

  test('works when the ladder is in the wrong order', () => {
    expect(earnedMoney(60000, [...ladder].reverse())).toBe(2000);
  });
});

describe('computePayoutDelta', () => {
  test('pays only the difference', () => {
    expect(computePayoutDelta(60000, ladder, 500, 10000)).toBe(1500);
  });

  test('same update twice pays 0 the second time', () => {
    expect(computePayoutDelta(60000, ladder, 2000, 10000)).toBe(0);
  });

  test('crossing two targets in one update pays the highest', () => {
    expect(computePayoutDelta(120000, ladder, 0, 10000)).toBe(5000);
  });

  test('views going down never gives a negative payout', () => {
    expect(computePayoutDelta(5000, ladder, 500, 10000)).toBe(0);
  });
});

describe('budget cap', () => {
  test('cannot pay more than the remaining budget', () => {
    expect(computePayoutDelta(100000, ladder, 0, 1200)).toBe(1200);
  });

  test('pays 0 when the budget is finished', () => {
    expect(computePayoutDelta(100000, ladder, 0, 0)).toBe(0);
  });

  test('negative remaining budget is treated as 0', () => {
    expect(computePayoutDelta(100000, ladder, 0, -50)).toBe(0);
  });
});