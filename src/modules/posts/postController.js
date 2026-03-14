const postService = require('./postService');
const feedService = require('./feedService');
const prisma = require('../../config/database');

exports.createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, {
      content: req.body.content,
      postType: req.body.postType || 'daily_win',
      privacy: req.body.privacy || 'public',
    });

    res.status(201).json({ success: true, data: post });
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
      data: {
        posts: result.posts,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getExploreFeed = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const posts = await prisma.post.findMany({
      where: {
        isDeleted: false,
        privacy: 'public',
        ...(cursor ? { publishedAt: { lt: new Date(cursor) } } : {}),
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true }
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: (parseInt(limit) || 20) + 1,
    });

    const lim = parseInt(limit) || 20;
    const hasMore = posts.length > lim;
    const results = hasMore ? posts.slice(0, lim) : posts;
    res.json({
      success: true,
      data: {
        posts: results,
        nextCursor: hasMore ? results[results.length - 1].publishedAt.toISOString() : null,
        hasMore,
      }
    });
  } catch (err) { next(err); }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.user.id, req.params.id, {
      content: req.body.content,
      postType: req.body.postType,
      privacy: req.body.privacy,
    });

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
