const prisma = require('../../config/database');

// Extract hashtags from content
function extractHashtags(content) {
  const matches = content.match(/#(\w+)/g);
  return matches ? matches.map(t => t.toLowerCase()) : [];
}

// Core function: create post + update streak
exports.createPost = async (authorId, data) => {
  const today = new Date().toISOString().split('T')[0];  // '2026-03-08'
  const user = await prisma.user.findUnique({ where: { id: authorId } });

  return prisma.$transaction(async (tx) => {
    // 1. Create the post
    const post = await tx.post.create({
      data: {
        authorId,
        postType: data.postType || 'daily_win',
        content: data.content,
        hashtags: extractHashtags(data.content),
        privacy: data.privacy || 'public',
        streakDay: user.currentStreak + 1,
      },
      include: { author: { select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true } } }
    });

    // 2. Update streak (only if first post today)
    const lastDate = user.lastPostDate?.toISOString().split('T')[0];
    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = lastDate === yesterday;
      const newStreak = isConsecutive ? user.currentStreak + 1 : 1;

      await tx.user.update({
        where: { id: authorId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          lastPostDate: new Date(),
        }
      });
    }

    return post;
  });
};
