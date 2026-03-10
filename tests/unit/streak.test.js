
const { calculateNewStreak } = require('../../src/modules/streaks/streakHelpers');

describe('Streak Calculation', () => {
  const today = new Date('2026-03-08');

  test('increments streak on consecutive day', () => {
    const user = { currentStreak: 5, lastPostDate: new Date('2026-03-07') };
    expect(calculateNewStreak(user, today)).toBe(6);
  });

  test('resets streak after missed day', () => {
    const user = { currentStreak: 30, lastPostDate: new Date('2026-03-06') };
    expect(calculateNewStreak(user, today)).toBe(1);
  });

  test('returns same streak if already posted today', () => {
    const user = { currentStreak: 10, lastPostDate: new Date('2026-03-08') };
    expect(calculateNewStreak(user, today)).toBe(10);
  });

  test('starts streak at 1 for first-ever post', () => {
    const user = { currentStreak: 0, lastPostDate: null };
    expect(calculateNewStreak(user, today)).toBe(1);
  });
});