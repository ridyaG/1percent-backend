const prisma = require('../../config/database');

exports.getHomeFeed = async (userId, cursor, limit = 20) => {
  const following = await prisma.follow.findMany({
    where: { followerId: userId, status: 'accepted' },
    select: { followingId: true }
  });
  const followingIds = [...following.map(f => f.followingId), userId];

  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: followingIds },
      isDeleted: false,
      privacy: { in: ['public', 'followers'] },
      ...(cursor ? { publishedAt: { lt: new Date(cursor) } } : {}),
    },
    include: {
      author: {
        select: {
          id: true, username: true, displayName: true,
          avatarUrl: true, currentStreak: true
        }
      },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit + 1,
  });

  const hasMore = posts.length > limit;
  const results = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore
    ? results[results.length - 1].publishedAt.toISOString()
    : null;

  return { posts: results, nextCursor, hasMore };
};