const prisma = require('../../config/database');
const { sendNotification } = require('../notifications/notificationService');

exports.addComment = async (req, res, next) => {
  try {
    const { content, parentId } = req.body;
    if (!content || content.length > 500) {
      return res.status(400).json({ success: false, error: 'Comment must be 1-500 chars' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id,
        authorId: req.user.id,
        content,
        parentId: parentId || null,
      },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } }
    });

    // Notify post author
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      select: { authorId: true },
    });
    const io = req.app.get('io');
    await sendNotification(io, {
      recipientId: post.authorId,
      actorId: req.user.id,
      type: 'comment',
      entityType: 'post',
      entityId: req.params.id,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.id, parentId: null, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        replies: {
          where: { isDeleted: false },
          include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
};