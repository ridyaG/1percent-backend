const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const { toggleLike } = require('./likeController');

router.post('/:id/like', authenticate, toggleLike);
router.delete('/:id/like', authenticate, toggleLike);

module.exports = router;