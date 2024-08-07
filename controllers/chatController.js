const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Chat
const createChat = async (req, res) => {
  const { firstId, secondId } = req.body;
  try {
    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                memberId: firstId,
              },
            },
          },
          {
            members: {
              some: {
                memberId: secondId,
              },
            },
          },
        ],
      },
      include: {
        members: true,
      },
    });

    if (chat) return res.status(200).json({ message: "Chat already exists", chat });

    const newChat = await prisma.chat.create({
      data: {
        members: {
          create: [
            { memberId: firstId },
            { memberId: secondId },
          ],
        },
      },
      include: {
        members: true,
      },
    });

    res.status(200).json(newChat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};



// Get User Chats
const findUserChats = async (req, res) => {
  const userId = req.params.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            memberId: userId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
const findChat = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                memberId: firstId,
              },
            },
          },
          {
            members: {
              some: {
                memberId: secondId,
              },
            },
          },
        ],
      },
      include: {
        members: true,
      },
    });

    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
module.exports = {
  createChat,
  findUserChats,
  findChat,
};
