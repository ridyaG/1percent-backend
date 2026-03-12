const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const { addComment, getComments } = require('./commentController');

router.get('/:id/comments', getComments);
router.post('/:id/comments', authenticate, addComment);

module.exports = router;