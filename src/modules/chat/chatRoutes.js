const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./chatController');

router.get('/conversations', authenticate, ctrl.getConversations);
router.post('/conversations', authenticate, ctrl.createOrGetConversation);
router.delete('/conversations/:id', authenticate, ctrl.deleteConversation);
router.get('/conversations/:id/messages', authenticate, ctrl.getMessages);
router.post('/conversations/:id/messages', authenticate, ctrl.sendMessage);
router.patch('/conversations/:id/messages/:messageId', authenticate, ctrl.updateMessage);
router.delete('/conversations/:id/messages/:messageId', authenticate, ctrl.deleteMessage);

module.exports = router;
