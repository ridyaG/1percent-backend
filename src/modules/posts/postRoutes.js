const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./postController');
const prisma = require('../../config/database');

router.get('/feed/home', authenticate, ctrl.getFeed);
router.get('/feed/explore', authenticate, ctrl.getExploreFeed);

router.post('/', authenticate, ctrl.createPost);
router.patch('/:id', authenticate, ctrl.updatePost);
router.delete('/:id', authenticate, ctrl.deletePost);
router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
      return res.json({ success: true, data: { liked: false } });
    }

    await prisma.like.create({ data: { userId, postId } });
    res.json({ success: true, data: { liked: true } });
  } catch (err) { next(err); }
});

router.delete('/:id/like', authenticate, async (req, res, next) => {
  try {
    await prisma.like.deleteMany({
      where: { userId: req.user.id, postId: req.params.id }
    });
    res.json({ success: true, data: { liked: false } });
  } catch (err) { next(err); }
});

module.exports = router;
