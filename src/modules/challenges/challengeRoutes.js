const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./challengeController');

router.get('/', ctrl.list);
router.post('/', authenticate, ctrl.create);
router.get('/:id', ctrl.getOne);
router.post('/:id/join', authenticate, ctrl.join);
router.delete('/:id/join', authenticate, ctrl.leave);
router.get('/:id/posts', ctrl.getFeed);

module.exports = router;