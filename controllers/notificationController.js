const prisma = require("../prismaClient");
const { getIo } = require("../socket");

const getNotification = async (req, res) => {
  try {
    const data = await prisma.notification.findMany({});

    return res.status(200).json({ notification: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "failed to get the notification !" });
  }
};

const updateNotification = async (req, res) => {
  try {
    //  const id = Number(req.params.id);
    const result = await prisma.notification.updateMany({
      //  where:{
      //      notification_id: id
      //  },
      data: {
        state: Boolean("true"),
      },
    });
    const all = await prisma.notification.findMany({});
    const io = getIo();
    io.emit("all_request", {
      message: all,
    });
    return res.status(200).json({ message: "successfuly updated !" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "failed to update the notification !" });
  }
};
const singleUpdateNotification = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await prisma.notification.update({
      where: {
        notification_id: id,
      },
      data: {
        state: Boolean("true"),
      },
    });
    const all = await prisma.notification.findUnique({
      where: {
        notification_id: result.notification_id,
      },
    });
    const io = getIo();
    io.emit("notificationUpdated", { message: all });

    return res.status(200).json({ message: "successfuly updated !" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "failed to update the notification !" });
  }
};

module.exports = {
  updateNotification,
  getNotification,
  singleUpdateNotification,
};
