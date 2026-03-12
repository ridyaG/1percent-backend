const postService = require('./postService');
const feedService = require('./feedService');

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