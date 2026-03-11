const prisma = require('../../config/database');

exports.createPost = async (req, res, next) => {
  try {
    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content: req.body.content,
        postType: req.body.postType || "daily_win"
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        },
        _count: { select: { likes: true, comments: true } }
      }
    });

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        },
        _count: { select: { likes: true, comments: true } }
      }
    });

    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};