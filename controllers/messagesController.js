const prisma = require("../prismaClient");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.user_id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          some: {
            userId: senderId,
          },
          some: {
            userId: parseInt(receiverId), // convert receiverId to Int
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              {
                userId: senderId,
              },
              {
                userId: parseInt(receiverId), // convert receiverId to Int
              },
            ],
          },
        },
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId), // convert receiverId to Int
        message,
        conversationId: conversation.id,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(`Error in sendMessage Controller: `, error.message);
    res.status(500).json({ error: "Internal Server Error !" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.user_id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          some: { 
            userId: senderId,
          },
          some: {
            conversationId: parseInt(userToChatId), // convert userToChatId to Int
          },
        },
      },
      include: {
        messages: true,
      },
    });

    if (!conversation) return res.status(200).json([]);

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log(`Error in getMessages Controller: `, error);
    res.status(500).json({ error: "Internal Server Error !" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
