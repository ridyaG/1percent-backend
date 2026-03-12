const prisma = require('../../config/database');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaders = await prisma.user.findMany({
      where: { currentStreak: { gt: 0 } },
      select: {
        id: true, username: true, displayName: true,
        avatarUrl: true, currentStreak: true,
      },
      orderBy: { currentStreak: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: leaders });
  } catch (err) { next(err); }
};