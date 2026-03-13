const prisma = require('../../config/database');
const { sendNotification } = require('../notifications/notificationService');

const participantUserSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
};

const getConversationInclude = (messageTake = 1) => ({
  participants: {
    include: {
      user: {
        select: participantUserSelect,
      },
    },
  },
  messages: {
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: messageTake,
    include: {
      sender: {
        select: participantUserSelect,
      },
    },
  },
});

async function ensureMembership(conversationId, userId) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
}

async function getParticipantIds(conversationId) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  return participants.map(participant => participant.userId);
}

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: req.user.id },
        },
      },
      include: getConversationInclude(),
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
};

exports.createOrGetConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const myId = req.user.id;

    if (!recipientId || recipientId === myId) {
      return res.status(400).json({ success: false, error: 'Invalid recipient' });
    }

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: myId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
      include: getConversationInclude(),
    });

    if (existing && existing.participants.length === 2) {
      return res.json({ success: true, data: existing });
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: myId }, { userId: recipientId }],
        },
      },
      include: getConversationInclude(),
    });

    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const membership = await ensureMembership(req.params.id, req.user.id);

    if (!membership) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const messages = await prisma.directMessage.findMany({
      where: { conversationId: req.params.id, isDeleted: false },
      include: {
        sender: {
          select: participantUserSelect,
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: req.params.id,
          userId: req.user.id,
        },
      },
      data: { lastReadAt: new Date() },
    });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const content = req.body.content?.trim();
    if (!content) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const membership = await ensureMembership(req.params.id, req.user.id);

    if (!membership) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const message = await prisma.directMessage.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user.id,
        content,
      },
      include: {
        sender: {
          select: participantUserSelect,
        },
      },
    });

    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: req.params.id,
          userId: req.user.id,
        },
      },
      data: { lastReadAt: new Date() },
    });

    const io = req.app.get('io');
    const participantIds = await getParticipantIds(req.params.id);

    for (const participantId of participantIds) {
      io.to(`user:${participantId}`).emit('new_message', {
        conversationId: req.params.id,
        message,
      });

      if (participantId === req.user.id) continue;

      await sendNotification(io, {
        recipientId: participantId,
        actorId: req.user.id,
        type: 'message',
        entityType: 'conversation',
        entityId: req.params.id,
      });
    }

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const content = req.body.content?.trim();
    if (!content) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const membership = await ensureMembership(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const existingMessage = await prisma.directMessage.findUnique({
      where: { id: req.params.messageId },
    });

    if (!existingMessage || existingMessage.conversationId !== req.params.id || existingMessage.isDeleted) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    if (existingMessage.senderId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only edit your own messages' });
    }

    const message = await prisma.directMessage.update({
      where: { id: req.params.messageId },
      data: { content },
      include: {
        sender: {
          select: participantUserSelect,
        },
      },
    });

    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    const io = req.app.get('io');
    const participantIds = await getParticipantIds(req.params.id);
    participantIds.forEach(participantId => {
      io.to(`user:${participantId}`).emit('message_updated', {
        conversationId: req.params.id,
        message,
      });
    });

    res.json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const membership = await ensureMembership(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const existingMessage = await prisma.directMessage.findUnique({
      where: { id: req.params.messageId },
    });

    if (!existingMessage || existingMessage.conversationId !== req.params.id || existingMessage.isDeleted) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    if (existingMessage.senderId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'You can only delete your own messages' });
    }

    await prisma.directMessage.update({
      where: { id: req.params.messageId },
      data: { isDeleted: true, content: '[deleted]' },
    });

    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    });

    const io = req.app.get('io');
    const participantIds = await getParticipantIds(req.params.id);
    participantIds.forEach(participantId => {
      io.to(`user:${participantId}`).emit('message_deleted', {
        conversationId: req.params.id,
        messageId: req.params.messageId,
      });
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.deleteConversation = async (req, res, next) => {
  try {
    const membership = await ensureMembership(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ success: false, error: 'Not a participant in this conversation' });
    }

    const participantIds = await getParticipantIds(req.params.id);

    await prisma.conversation.delete({
      where: { id: req.params.id },
    });

    const io = req.app.get('io');
    participantIds.forEach(participantId => {
      io.to(`user:${participantId}`).emit('conversation_deleted', {
        conversationId: req.params.id,
      });
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
