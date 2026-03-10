const prisma = require('../../config/database');

exports.sendNotification = async (io, { recipientId, actorId, type, entityType, entityId }) => {
  // Don't notify yourself
  if (recipientId === actorId) return;

  // Save to database
  const notification = await prisma.notification.create({
    data: { recipientId, actorId, type, entityType, entityId },
    include: {
      actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
    }
  });

  // Push to user's WebSocket room instantly
  io.to(`user:${recipientId}`).emit('notification', notification);

  return notification;
};
 