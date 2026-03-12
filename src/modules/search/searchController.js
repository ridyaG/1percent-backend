const prisma = require('../../config/database');

exports.search = async (req, res, next) => {
  try {
    const { q, type = 'posts' } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Query required' });

    if (type === 'posts') {
      const posts = await prisma.post.findMany({
        where: { isDeleted: false, content: { contains: q, mode: 'insensitive' } },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });
      return res.json({ success: true, data: posts });
    }

    if (type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
          ]
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true, bio: true },
        take: 20,
      });
      return res.json({ success: true, data: users });
    }

    if (type === 'hashtags') {
      const posts = await prisma.post.findMany({
        where: {
          isDeleted: false,
          hashtags: { has: q.toLowerCase().replace('#', '') }
        },
        include: {
          author: { select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });
      return res.json({ success: true, data: posts });
    }

    res.status(400).json({ success: false, error: 'Invalid type' });
  } catch (err) { next(err); }
};

exports.trending = async (req, res, next) => {
  try {
    const recentPosts = await prisma.post.findMany({
      where: { isDeleted: false, publishedAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      select: { hashtags: true },
      take: 500,
    });

    const counts = {};
    recentPosts.forEach(p => {
      p.hashtags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    const trending = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ success: true, data: trending });
  } catch (err) { next(err); }
};

exports.recentPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { isDeleted: false },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
};