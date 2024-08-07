const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new message
const createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;
    try {
        const message = await prisma.message.create({
            data: {
                chatId: parseInt(chatId), 
                senderId,
                text
            }
        });
        res.status(200).json(message);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Get messages by chatId
const getMessage = async (req, res) => {
    const { chatId } = req.params;
    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId: parseInt(chatId) 
            }
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createMessage,
    getMessage
};
