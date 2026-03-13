const router = require('express').Router();
const ctrl = require('./streakController');

router.get('/leaderboard', ctrl.getLeaderboard);

module.exports = router;