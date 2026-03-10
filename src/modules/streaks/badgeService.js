const prisma = require('../../config/database');

const STREAK_BADGES = [
  { streak: 7,   badge: 'on_fire',     label: 'On Fire (7 Days)' },
  { streak: 30,  badge: 'consistent',   label: 'Consistent (30 Days)' },
  { streak: 100, badge: 'unstoppable',  label: 'Unstoppable (100 Days)' },
  { streak: 365, badge: 'legend',       label: 'Legend (365 Days)' },
];

exports.checkAndAwardBadges = async (userId, currentStreak, tx = prisma) => {
  const eligible = STREAK_BADGES.filter(b => currentStreak >= b.streak);

  for (const { badge, label } of eligible) {
    await tx.userBadge.upsert({
      where: { userId_badge: { userId, badge } },
      create: { userId, badge, label },
      update: {},  // Already has it, do nothing
    });
  }
};
 
