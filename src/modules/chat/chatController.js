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
    const membership = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: req.params.id,
          userId: req.user.id,
        },
      },
    });

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

    const membership = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: req.params.id,
          userId: req.user.id,
        },
      },
    });

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

    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId: req.params.id },
      select: { userId: true },
    });

    const io = req.app.get('io');

    for (const participant of participants) {
      io.to(`user:${participant.userId}`).emit('new_message', {
        conversationId: req.params.id,
        message,
      });

      if (participant.userId === req.user.id) continue;

      await sendNotification(io, {
        recipientId: participant.userId,
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
