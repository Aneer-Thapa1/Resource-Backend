const prisma = require("../prismaClient");
const { getIo } = require("../socket");

const sentRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_name, quantity, purpose, state, status } = req.body;

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_name: true, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const itemData = await prisma.items.findFirst({
      where: { item_name: item_name },
    });

    if (!itemData) {
      return res.status(404).json({ error: "Item not found!" });
    }

    const result = await prisma.$transaction(async (prisma) => {
      const requestData = await prisma.request.create({
        data: {
          request_item_name: itemData.item_name,
          request_quantity: parseInt(quantity),
          user_id: userId,
          item_id: itemData.item_id,
          purpose: purpose,
          request_date: new Date(),
          status: "pending",
        },
        include: {
          item: true,
        },
      });

      const notifyMessage = await prisma.notification.create({
        data: {
          message: `New request has been added by ${user.user_name}`,
          user_id: Number(userId),
          state: Boolean(state),
          created_at: new Date(),
        },
      });

      // Send message and data to admin via Socket.io
      const io = getIo();
      io.emit("newRequest", {
        message: notifyMessage,
      });

      let updateItem;
      let deductItem;

      if (status === "accept") {
        updateItem = await prisma.items.update({
          where: {
            item_id: requestData.item_id,
          },
          data: {
            quantity: itemData.quantity - requestData.request_quantity,
          },
        });
      }

      return { requestData, notifyMessage, updateItem };
    });

    if (result.updateItem) {
      return res.status(200).json({
        message: "Successfully requested and updated the items",
        result,
      });
    } else {
      return res
        .status(200)
        .json({ message: "Successfully requested the items", result });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send the request!" });
  }
};

const returnItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const findRequest = await prisma.request.findUnique({
      where: {
        request_id: id,
      },
    });

    if (!findRequest) {
      return res.status(404).json({ error: "Request not found!" });
    }

    if (findRequest.isReturned) {
      return res
        .status(400)
        .json({ message: "Item has already been returned!" });
    }

    const itemData = await prisma.items.findUnique({
      where: {
        item_id: findRequest.item_id,
      },
    });

    if (!itemData) {
      return res.status(404).json({ error: "Item not found!" });
    }

    const category = await prisma.category.findFirst({
      where: { category_id: itemData.category_id },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found!" });
    }

    if (category.category_name !== "pen") {
      return res.status(500).json({ error: "Item not valid for return!" });
    }

    const updatedItem = await prisma.items.update({
      where: {
        item_id: itemData.item_id,
      },
      data: {
        quantity: itemData.quantity + findRequest.request_quantity,
      },
    });

    await prisma.request.update({
      where: {
        request_id: id,
      },
      data: {
        isReturned: true,
      },
    });

    return res.status(200).json({
      message: "Successfully returned the item!",
      updatedItem,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to send the request!" });
  }
};

const getRequest = async (req, res) => {
  try {
    const allData = await prisma.request.findMany({
      include: {
        item: {
          select: {
            item_name: true,
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
    console.error(error);
    return res.status(500).json({ error: "Failed to get all requests!" });
  }
};

module.exports = {
  sentRequest,
  getRequest,
  returnItem,
};
