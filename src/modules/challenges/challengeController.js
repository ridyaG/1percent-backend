const prisma = require('../../config/database');

exports.list = async (req, res, next) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { isActive: true },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { participants: true, posts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: challenges });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        participants: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true } }
          },
          orderBy: { joinedAt: 'asc' },
          take: 20,
        },
        _count: { select: { participants: true, posts: true } },
      },
    });
    if (!challenge) return res.status(404).json({ success: false, error: 'Challenge not found' });
    res.json({ success: true, data: challenge });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, goal, startDate, endDate } = req.body;
    if (!title || !goal || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'title, goal, startDate, endDate required' });
    }
    const challenge = await prisma.challenge.create({
      data: {
        creatorId: req.user.id,
        title, description, goal,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        creator: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { participants: true, posts: true } },
      },
    });
    // Auto-join creator
    await prisma.challengeParticipant.create({
      data: { userId: req.user.id, challengeId: challenge.id }
    });
    res.status(201).json({ success: true, data: challenge });
  } catch (err) { next(err); }
};

exports.join = async (req, res, next) => {
  try {
    await prisma.challengeParticipant.upsert({
      where: { userId_challengeId: { userId: req.user.id, challengeId: req.params.id } },
      create: { userId: req.user.id, challengeId: req.params.id },
      update: {},
    });
    res.json({ success: true, message: 'Joined!' });
  } catch (err) { next(err); }
};

exports.leave = async (req, res, next) => {
  try {
    await prisma.challengeParticipant.deleteMany({
      where: { userId: req.user.id, challengeId: req.params.id }
    });
    res.json({ success: true, message: 'Left challenge' });
  } catch (err) { next(err); }
};

exports.getFeed = async (req, res, next) => {
  try {
    const challengePosts = await prisma.challengePost.findMany({
      where: { challengeId: req.params.id },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true, currentStreak: true } },
            _count: { select: { likes: true, comments: true } },
          }
        }
      },
      orderBy: { post: { publishedAt: 'desc' } },
      take: 20,
    });
    const posts = challengePosts.map(cp => cp.post);
    res.json({ success: true, data: posts });
  } catch (err) { next(err); }
};