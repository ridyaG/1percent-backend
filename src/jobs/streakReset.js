const prisma = require('../config/database');

async function resetBrokenStreaks() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  // Find users who had a streak but didn't post yesterday
  const result = await prisma.user.updateMany({
    where: {
      currentStreak: { gt: 0 },
      lastPostDate: { lt: yesterday },
      streakFreezeCount: { lte: 0 },  // No freezes available
    },
    data: { currentStreak: 0 }
  });

  console.log(`Reset ${result.count} broken streaks`);

  // Consume freeze for users who have one
  await prisma.user.updateMany({
    where: {
      currentStreak: { gt: 0 },
      lastPostDate: { lt: yesterday },
      streakFreezeCount: { gt: 0 },
    },
    data: { streakFreezeCount: { decrement: 1 } }
  });
}

module.exports = { resetBrokenStreaks };