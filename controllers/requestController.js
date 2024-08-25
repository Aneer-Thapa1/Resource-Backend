const prisma = require("../prismaClient");
const { getIo } = require("../socket");

const sentRequest = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { items, for_UserId, purpose } = req.body;

    if (!items || !purpose) {
      return res.status(400).json({
        error: "All fields are required!",
      });
    }

    const user = await prisma.users.findFirst({
      where: { user_id: userId },
      select: { user_name: true, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const forUser = await prisma.users.findFirst({
      where: { user_id: for_UserId },
    });

    if (!forUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    const requestItems = items.map((item) => {
      return {
        item_id: item.item_id,
        quantity: item.quantity
      
      };
    });

    // Create the request with associated requestItems
    const requestData = await prisma.request.create({
      data: {
        user_id: userId,
        requested_for: Number(forUser.user_id),
        purpose: purpose,
        isReturned: false,
        status: "pending",
        requestItems: {
          create: requestItems,
        },
      },
      include: {
        requestItems: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Successfully requested the items", requestData });
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

const approveRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { replacementItems } = req.body;

    const findRequest = await prisma.request.findUnique({
      where: {
        request_id: id,
      },
      include: {
        item: true,
      },
    });

    if (!findRequest) {
      return res.status(404).json({ error: "Request not found!" });
    }

    const itemInInventory = await prisma.items.findUnique({
      where: {
        item_id: findRequest.item_id,
      },
    });

    let updateItems = [];

    if (
      !itemInInventory ||
      itemInInventory.quantity < findRequest.request_quantity
    ) {
      // If the item is not available or quantity is insufficient, replace it with other items
      if (!replacementItems || replacementItems.length === 0) {
        return res.status(400).json({
          error:
            "Replacement items are required since the requested item is not available!",
        });
      }

      // Update the request to include the replacement items
      updateItems = await prisma.$transaction(async (prisma) => {
        let totalReplacementQuantity = 0;

        for (const replacement of replacementItems) {
          const { item_id, quantity } = replacement;

          // Update each replacement item in the inventory
          const updatedItem = await prisma.items.update({
            where: { item_id },
            data: {
              quantity: {
                decrement: quantity,
              },
            },
          });

          totalReplacementQuantity += quantity;

          // Link the replacement item to the request
          await prisma.replacementItem.create({
            data: {
              request_id: findRequest.request_id,
              item_id: updatedItem.item_id,
              quantity: quantity,
            },
          });

          updateItems.push(updatedItem);
        }

        return updateItems;
      });

      await prisma.request.update({
        where: {
          request_id: id,
        },
        data: {
          status: "replaced",
          request_quantity: totalReplacementQuantity,
          replacement_items: true, // Assuming you track if replacement items were used
        },
      });
    } else {
      // If the item is available, simply update the request status
      await prisma.request.update({
        where: {
          request_id: id,
        },
        data: {
          status: "approved",
        },
      });
    }

    return res.status(200).json({
      message: "Request verified successfully",
      updateItems,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to verify the request!" });
  }
};

const getRequest = async (req, res) => {
  try {
    const allData = await prisma.request.findMany({
      include:{
        user:true,
        requestedFor:true,
        requestItems:{
          include:{
            item:true,
          }
        }
      }
    });

    // Map over allData to format each request
    const response = allData.map(request => ({
      request_id: request.request_id,
      purpose: request.purpose,
      user_name: request.user.user_name,
     requested_for: request.requestedFor.user_name,
      request_date: request.request_date,
      status: request.status,
      isReturned: request.isReturned,
      requestItems: request.requestItems.map(requestItem => ({
        id: requestItem.id,
        quantity: requestItem.quantity,
        item_name: requestItem.item.item_name
      }))

        }));
    return res.status(200).json({ request: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get all requests!" });
  }
};

module.exports = {
  sentRequest,
  getRequest,
  returnItem,
  approveRequest,
};
