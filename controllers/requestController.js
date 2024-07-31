const prisma = require("../prismaClient");
const { getIo } = require("../socket");

const sentRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { item_name, quantity, purpose ,state} = req.body;

    // Fetch the user from the database
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: { user_name: true, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const itemData = await prisma.items.findFirst({
      where: {
        item_name: item_name,
      },
    });

    if (!itemData) {
      return res.status(500).json({ error: "Item not found!" });
    }
      const request = await prisma.$transaction(async(prisma)=>{
    const requestData = await prisma.request.create({
      data: {
        request_item_name: itemData.item_name,
        request_quantity: parseInt(quantity),
        user_id: userId,
        item_id: itemData.item_id,
        purpose: purpose,
        request_date: new Date(),
      },
      include: {
        item: true,
      },
    });

    const notifyMessage = await prisma.notification.create({
      data:{
        message: `New request has been added by ${user.user_name}`,
        user_id:Number(userId),
        state:Boolean(state)
      }
    });
    console.log(notifyMessage);
    // const notify = await prisma.notification.findMany({});
    // Send message and data to admin via Socket.io
    const io = getIo();
    io.emit("newRequest", {

      message: notifyMessage,
    });
    return{requestData, notifyMessage};
   
  })

    return res
      .status(200)
      .json({ message: "Successfully Requested the items", request });
  } catch (error) {
    console.log(error);
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
    console.log(error);
    return res.status (500).json({ error: "Failed to get all requests!" });
  }
};

module.exports = {
  sentRequest,
  getRequest,
};
