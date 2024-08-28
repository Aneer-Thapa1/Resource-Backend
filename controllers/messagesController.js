const prisma = require("../prismaClient");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.user_id;

    if (!message || message.trim() === "") {
      return;
    }

    // Find or create a conversation between sender and receiver
    let conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [senderId, parseInt(receiverId)],
            },
          },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [
              { userId: senderId },
              { userId: parseInt(receiverId) }, // Convert receiverId to Int
            ],
          },
        },
      });
    }

    // Create a new message in the found or newly created conversation
    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId: parseInt(receiverId), // Convert receiverId to Int
        message,
        conversationId: conversation.id,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(`Error in sendMessage Controller: `, error.message);
    res.status(500).json({ error: "Internal Server Error!" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user.user_id;

    // Find the conversation between sender and receiver
    const conversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: {
              in: [senderId, parseInt(userToChatId)],
            },
          },
        },
      },
      include: {
        messages: true,
      },
    });

    if (!conversation) {
      return res.status(200).json([]); // No conversation found, return an empty array
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error(`Error in getMessages Controller: `, error.message);
    res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
