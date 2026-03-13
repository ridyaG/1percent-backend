const prisma = require('../../config/database');
const { sendNotification } = require('../notifications/notificationService');

exports.toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
      return res.json({ success: true, data: { liked: false } });
    }

    await prisma.like.create({ data: { userId, postId, reaction: req.body.reaction || 'like' } });

    // Notify post author
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    const io = req.app.get('io');
    await sendNotification(io, {
      recipientId: post.authorId,
      actorId: userId,
      type: 'like',
      entityType: 'post',
      entityId: postId,
    });

    res.json({ success: true, data: { liked: true } });
  } catch (err) { next(err); }
};