const prisma = require('../../config/database');
const { checkAndAwardBadges } = require('../streaks/badgeService');

function extractHashtags(content) {
  const matches = content.match(/#(\w+)/g);
  return matches ? matches.map(t => t.toLowerCase()) : [];
}

exports.createPost = async (authorId, data) => {
  const today = new Date().toISOString().split('T')[0];
  const user = await prisma.user.findUnique({ where: { id: authorId } });

  const lastDate = user.lastPostDate?.toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = lastDate === yesterday;
  const alreadyPostedToday = lastDate === today;
  const newStreak = alreadyPostedToday
    ? user.currentStreak
    : isConsecutive
    ? user.currentStreak + 1
    : 1;

  return prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        authorId,
        postType: data.postType || 'daily_win',
        content: data.content,
        hashtags: extractHashtags(data.content),
        privacy: data.privacy || 'public',
        streakDay: newStreak,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true, username: true, displayName: true,
            avatarUrl: true, currentStreak: true
          }
        },
        _count: { select: { likes: true, comments: true } },
      }
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

      // 3. Award badges
      await checkAndAwardBadges(authorId, newStreak, tx);
    }

    return post;
  });
};

exports.updatePost = async (authorId, postId, data) => {
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
      isDeleted: false,
    },
  });

  if (!existingPost) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  return prisma.post.update({
    where: { id: postId },
    data: {
      content: data.content,
      postType: data.postType || existingPost.postType,
      hashtags: extractHashtags(data.content),
      privacy: data.privacy || existingPost.privacy,
    },
    include: {
      author: {
        select: {
          id: true, username: true, displayName: true,
          avatarUrl: true, currentStreak: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });
};

exports.deletePost = async (authorId, postId) => {
  const existingPost = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
      isDeleted: false,
    },
  });

  if (!existingPost) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { isDeleted: true },
  });
};
