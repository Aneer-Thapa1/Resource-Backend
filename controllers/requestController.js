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

    // Fetch the user making the request
    const user = await prisma.users.findFirst({
      where: { user_id: userId },
      select: { user_name: true, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Fetch the user to whom the request is made
    const forUser = await prisma.users.findFirst({
      where: { user_id: for_UserId },
    });

    if (!forUser) {
      return res.status(404).json({ error: "User not found!" });
    }

    // Map the items to match Prisma schema
    const requestItems = items.map((item) => ({
      item: { connect: { item_id: item.item_id } }, 
      quantity: parseInt(item.quantity),
    }));

    // Create the request with associated requestItems
    const requestData = await prisma.request.create({
      data: {
        user: { connect: { user_id: userId } }, 
        requestedFor: { connect: { user_id: for_UserId } }, 
        purpose: purpose,
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
    console.error(error.message);
    return res.status(500).json({ error: "Internal Server Error!!" });
  }
};


const returnItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Find the request by ID
    const findRequest = await prisma.request.findFirst({
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

    // Find the item by ID
    const itemData = await prisma.items.findFirst({
      where: {
        item_id: findRequest.item_id,
      },
    });

    if (!itemData) {
      return res.status(404).json({ error: "Item not found!" });
    }

    // Verify the category
    const category = await prisma.category.findFirst({
      where: { category_id: itemData.category_id },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found!" });
    }

    if (category.category_name !== "Assets") {
      return res.status(400).json({ error: "Item not valid for return!" });
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update the item quantity
      const updatedItem = await prisma.items.update({
        where: {
          item_id: itemData.item_id,
        },
        data: {
          quantity: itemData.remaining_quantity + findRequest.request_quantity,
        },
      });

      // Mark the request as returned
      await prisma.request.update({
        where: {
          request_id: id,
        },
        data: {
          isReturned: true,
        },
      });

      return updatedItem;
    });

    return res.status(200).json({
      message: "Successfully returned the item!",
      updatedItem: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

//APPROVE
const approveRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.user_id;
    const { replaceItems, remarks } = req.body;

    const findRequest = await prisma.request.findFirst({
      where: {
        request_id: id,
      },
      include: {
        requestItems: true,
      },
    });

    if (!findRequest) {
      return res.status(400).json({ error: "Request not Found!" });
    }

    if (findRequest.status == "Holding")
      return res.status(400).json({ message: "request already approved !" });

    // const itemIds = findRequest.requestItems.map((item) => item.item_id);
    // console.log(itemIds);
    // const items = await prisma.items.findMany({
    //   where: {
    //     item_id: {
    //       in: itemIds,
    //     },
    //   },
    // });
    // let matchRequestedItem = true;

    // for (const requestedItem of findRequest.requestItems) {
    //   const matchedItem = items.find(
    //     (inventoryItem) => inventoryItem.item_id === requestedItem.item_id
    //   );
    //   if (!matchedItem) {
    //     matchRequestedItem = false;
    //   }
    // }

    await prisma.requestItems.deleteMany({
      where: {
        request_id: findRequest.request_id,
      },
    });

    const changedItem = replaceItems.map((item) => ({
      item_id: parseInt(item.item_id),
      quantity: parseInt(item.quantity),
    }));

    const updateData = await prisma.request.update({
      where: {
        request_id: parseInt(id),
      },
      data: {
        approved_by: parseInt(userId),
        remarks: remarks,
        status: "Holding",
        requestItems: {
          create: changedItem,  
        },
      },
    });


    return res.status(200).json({ message: "Item changed", updateData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const deliverRequest = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const findRequest = await prisma.request.findFirst({
      where: {
        request_id: id,
      },
      include: {
        requestItems: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!findRequest)
      return res.status(404).json({ error: "Request not found" });

    if (findRequest.status === "Delivered")
      return res.status(400).json({ error: "Already delivered!" });
    if (findRequest.status !== "Holding")
      return res.status(400).json({ error: "Request has not been approved!" });

    // Update request status to "Delivered" and adjust item quantities
    const result = await prisma.$transaction(async (prisma) => {
      const updatedRequest = await prisma.request.update({
        where: {
          request_id: id,
        },
        data: {
          status: "Delivered",
        },
        include: {
          requestItems: {
            include: {
              item: true,
            },
          },
        },
      });

      for (const requestItem of updatedRequest.requestItems) {
        // const findItem = await prisma.items.findFirst({
        //   where: {
        //   item_id: requestItem.item_id
        //   }
        // })
      const update=  await prisma.issue.create({
          data: {
            item_id: requestItem.item.item_id,
            issue_item: requestItem.item.item_name,
            request_Id: updatedRequest.request_id,
            Quantity: requestItem.quantity,
          },
        });
        // Decrease the remaining quantity of the item
        await prisma.items.update({
          where: {
            item_id: requestItem.item.item_id,
          },
          data: {
            remaining_quantity: {
              decrement: requestItem.quantity,
            },
          },
        });
      }

      return updatedRequest;
    });

    return res
      .status(200)
      .json({ message: "Request delivered successfully", result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};




const getRequest = async (req, res) => {
  try {
    const allData = await prisma.request.findMany({
      include: {
        user: {
          include: {
            department: true,
          },
        },
        requestedFor: true,
        requestItems: {
          include: {
            item: true,
          },
        },
      },
    });

    // Map over allData to format each request
    const response = allData.map((request) => ({
      request_id: request.request_id,
      purpose: request.purpose,
      user_name: request.user.user_name,
      department_name: request.user.department.department_name,
      requested_for: request.requestedFor.user_name,
      request_date: request.request_date,
      status: request.status,
      remarks: request.remarks,
      requestItems: request.requestItems.map((requestItem) => ({
        id: requestItem.id,
        quantity: requestItem.quantity,
        item_name: requestItem.item.item_name,
      })),
    }));
    return res.status(200).json({ request: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get all requests!" });
  }
};

const singleRequest = async (req, res) => {
  try {
    const req_id = Number(req.params.id);
    console.log(req_id);

    const requestData = await prisma.request.findFirst({
      where: {
        request_id: req_id,
      },
    });

    if (!requestData)
      return res.status(400).json({ error: "request not found" });

    const allData = await prisma.request.findFirst({
      where: {
        request_id: requestData.request_id,
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        requestedFor: true,
        requestItems: {
          include: {
            item: {
              include: {
                itemsOnFeatures: true,
              },
            },
          },
        },
      },
    });

    const response = {
      request_id: allData.request_id,
      purpose: allData.purpose,
      user_name: allData.user.user_name,
      department_name: allData.user.department.department_name,
      requested_for: allData.requestedFor.user_name,
      request_date: allData.request_date,
      status: allData.status,
      isReturned: allData.isReturned,
      requestItems: allData.requestItems.map((requestItem) => ({
        id: requestItem.id,
        item_id: requestItem.item.item_id,
        quantity: requestItem.quantity,
        item_name: requestItem.item.item_name,
        item_id: requestItem.item.item_id,
      })),
    };

    return res.status(200).json({ request: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error !" });
  }
};


const requestHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch pending requests
    const requestsPending = await prisma.request.findMany({
      where: {
        user_id: userId,
        status: "Pending",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        requestedFor: true,
        requestItems: {
          include: {
            item: {
              include: {
                itemsOnFeatures: true,
              },
            },
          },
        },
      },
    });

    // Format response for pending requests
    const responsePending = requestsPending.map(request => ({
      request_id: request.request_id,
      purpose: request.purpose,
      user_name: request.user.user_name,
      requested_for: request.requestedFor.user_name,
      request_date: request.request_date,
      status: request.status,
      isReturned: request.isReturned,
      requestItems: request.requestItems.map(requestItem => ({
        id: requestItem.id,
        item_id: requestItem.item.item_id,
        quantity: requestItem.quantity,
        item_name: requestItem.item.item_name,
      })),
    }));

    // Fetch approved requests
    const requestsApproved = await prisma.request.findMany({
      where: {
        user_id: userId,
        status: "Approved",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        requestedFor: true,
        requestItems: {
          include: {
            item: {
              include: {
                itemsOnFeatures: true,
              },
            },
          },
        },
      },
    });

    // Format response for approved requests
    const responseApproved = requestsApproved.map(request => ({
      request_id: request.request_id,
      purpose: request.purpose,
      user_name: request.user.user_name,
      requested_for: request.requestedFor.user_name,
      request_date: request.request_date,
      status: request.status,
      isReturned: request.isReturned,
      requestItems: request.requestItems.map(requestItem => ({
        id: requestItem.id,
          item_id: requestItem.item.item_id,
        quantity: requestItem.quantity,
        item_name: requestItem.item.item_name,
      })),
    }));

    return res.status(200).json({ requestApproved: responseApproved, requestPending: responsePending });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};



module.exports = {
  sentRequest,
  singleRequest,
  getRequest,
  returnItem,
  approveRequest,
  deliverRequest,
  requestHistory
};
