exports.search = async (req, res, next) => {
  try {
    const { q, type = 'posts' } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'Query required' });

    if (type === 'posts') {
      const posts = await prisma.$queryRaw`
        SELECT p.*, u.username, u.display_name, u.avatar_url
        FROM posts p JOIN users u ON p.author_id = u.id
        WHERE p.is_deleted = false
          AND to_tsvector('english', p.content) @@ plainto_tsquery('english', ${q})
        ORDER BY p.published_at DESC LIMIT 20
      `;
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
        take: 20,
      });
      return res.json({ success: true, data: users });
    }

    if (type === 'hashtags') {
      const posts = await prisma.post.findMany({
        where: { hashtags: { has: q.toLowerCase().replace('#', '') } },
        include: { author: true },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });
      return res.json({ success: true, data: posts });
    }
  } catch (err) { next(err); }
};
 
