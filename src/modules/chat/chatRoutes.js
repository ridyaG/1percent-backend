const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./chatController');

router.get('/conversations', authenticate, ctrl.getConversations);
router.post('/conversations', authenticate, ctrl.createOrGetConversation);
router.get('/conversations/:id/messages', authenticate, ctrl.getMessages);
router.post('/conversations/:id/messages', authenticate, ctrl.sendMessage);

module.exports = router;
