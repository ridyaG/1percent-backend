const prisma = require('../../config/database');
const feedService = require('./feedService');

exports.createPost = async (req, res, next) => {
  try {
    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content: req.body.content,
        postType: req.body.postType || "daily_win",
        privacy: "public", 
        publishedAt: new Date(), 
        isDeleted: false
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
    const { cursor, limit } = req.query;
    const result = await feedService.getHomeFeed(
      req.user.id,
      cursor || null,
      parseInt(limit) || 20
    );
    res.json({ 
      success: true, 
      data: result.posts, 
      nextCursor: result.nextCursor, 
      hasMore: result.hasMore 
    });
  } catch (err) {
    next(err);
  }
};