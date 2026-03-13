const prisma = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      include: {
        actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
};

exports.markRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, recipientId: req.user.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({
      where: { recipientId: req.user.id, isRead: false },
    });
    res.json({ success: true, data: { count } });
  } catch (err) { next(err); }
};