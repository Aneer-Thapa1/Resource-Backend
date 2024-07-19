const prisma = require("../prismaClient");

const sentRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, quantity, purpose } = req.body;
    const itemData = await prisma.items.findFirst({
      where: {
        item_name: item_name,
      },
    });
    if (!itemData) {
      return res.status(500).json({ error: "iterm not found !" });
    }

    const requestData = await prisma.request.create({
      data: {
        request_item_name: itemData.item_name,
        request_quantity: parseInt(quantity),
        user_id: userId,
        item_id: itemData.item_id,
        purpose: purpose,
        request_date: new Date(),
      },
    });

    return res
      .status(200)
      .json({ message: "Successfully Requested the items", requestData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "failed to send the request !" });
  }
};

const getRequest = async (req, res) => {
  try {
    const allData = await prisma.request.findMany({
      include: {
        item: {
          // Use the correct relation field name
          select: {
            item_name: true, // Include specific fields from items table
          },
        },
        users: {
          select: {
            user_name: true,
            department: true,
          },
        },
      },
    });
    return res.status(200).json({ request: allData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get all requests!" });
  }
};

module.exports = {
  sentRequest,
  getRequest,
};
