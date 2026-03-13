const prisma = require('../../config/database');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: {
        id: true, username: true, displayName: true, bio: true,
        avatarUrl: true, coverUrl: true, websiteUrl: true, location: true,
        currentStreak: true, longestStreak: true, focusAreas: true,
        createdAt: true,
        _count: { select: { posts: true, followers: true, following: true } }
      }
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.followUser = async (req, res, next) => {
  try {
    const followingId = req.params.id;
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({ success: false, error: 'Cannot follow yourself' });
    }

    // Check if target user is private (would need pending status)
    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    const status = targetUser?.isPrivate ? 'pending' : 'accepted';

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId, status },
      update: {},
    });

    res.json({ success: true, message: status === 'pending' ? 'Follow request sent' : 'Following!' });
  } catch (err) { next(err); }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    await prisma.follow.deleteMany({
      where: { followerId: req.user.id, followingId: req.params.id }
    });
    res.json({ success: true, message: 'Unfollowed' });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: req.params.id },
      include: { follower: true }
    });

    res.json({ success: true, data: followers });
  } catch (err) {
    next(err);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const following = await prisma.follow.findMany({
      where: { followerId: req.params.id },
      include: { following: true }
    });

    res.json({ success: true, data: following });
  } catch (err) {
    next(err);
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id }
      },
      take: 10
    });

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getUserPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: req.params.id,
        isDeleted: false,
        privacy: 'public',
      },
      include: {
        author: {
          select: {
            id: true, username: true, displayName: true,
            avatarUrl: true, currentStreak: true,
          }
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
};
