const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./postController');

router.post('/', authenticate, ctrl.createPost);
router.get('/feed/home', authenticate, ctrl.getFeed);

module.exports = router;