const prisma = require('../../config/database');

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

    // TODO: Send notification to post author (Chapter 10)

    res.json({ success: true, data: { liked: true } });
  } catch (err) { next(err); }
};
 
