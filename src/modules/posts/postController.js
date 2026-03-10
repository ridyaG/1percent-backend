const prisma = require('../../config/database');

exports.createPost = async (req, res, next) => {
  try {
    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        content: req.body.content,
        postType: req.body.postType || "daily_win"
      }
    });

    res.json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

exports.getFeed = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 20
    });

    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};