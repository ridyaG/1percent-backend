
const router = require('express').Router();
const { authenticate, authenticateOptional } = require('../../middleware/auth');
const ctrl = require('./userController');

router.get('/me/suggestions', authenticate, ctrl.getSuggestions);
router.patch('/me', authenticate, ctrl.updateProfile);

router.get('/:username', authenticateOptional, ctrl.getProfile);
router.get('/:id/posts', ctrl.getUserPosts);
router.get('/:id/followers', ctrl.getFollowers);
router.get('/:id/following', ctrl.getFollowing);

router.post('/:id/follow', authenticate, ctrl.followUser);
router.delete('/:id/follow', authenticate, ctrl.unfollowUser);

module.exports = router;
