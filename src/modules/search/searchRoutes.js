const router = require('express').Router();
const ctrl = require('./searchController');

router.get('/', ctrl.search);
router.get('/trending', ctrl.trending);
router.get('/recent-posts', ctrl.recentPosts);

module.exports = router;