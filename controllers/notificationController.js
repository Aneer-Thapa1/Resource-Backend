const prisma = require("../prismaClient");
const { getIo } = require("../socket");

const getNotification = async (req, res) => {
  try {
    const id = req.user.user_id;
    // Fetch notifications with related userNotifications
    const notifications = await prisma.notification.findMany({

      include: {
        userNotifications: {
          where: {
            user_id:id
          },
        },
        
      },
    });

    const transformedNotifications = notifications.map((notification) => {
      const userNotification = notification.userNotifications[0] || {};

      return {
        notification_id: notification.notification_id,
        message: notification.message,
        created_at: notification.created_at,

        user_id: userNotification.user_id,
        state: userNotification.state || false,
      };
    });

    return res.status(200).json({ notifications: transformedNotifications });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get notifications!" });
  }
};

const updateNotification = async (req, res) => {
  try {
    // //  const id = Number(req.params.id);
    // const result = await prisma.notification.updateMany({
    //   //  where:{
    //   //      notification_id: id
    //   //  },
    //   data: {
    //     is: Boolean("true"),
    //   },
    // });
    // const all = await prisma.notification.findMany({});
    // const io = getIo();
    // io.emit("all_request", {
    //   message: all,
    // });
    // return res.status(200).json({ message: "successfuly updated !" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "failed to update the notification !" });
  }
};
const singleUpdateNotification = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);
    console.log(notificationId);
    const user_id = req.user.user_id;
    console.log(user_id);
    // Ensure the userId is a alid number
    if (!user_id || !notificationId) {
      return res
        .status(400)
        .json({ error: "Invalid userId or notificationId" });
    }

    // Update or create the read status for the specific user
    await prisma.userNotification.upsert({
      where: {
        user_id_notification_id: {
          user_id: user_id,
          notification_id: notificationId,
        },
      },
      update: {
        state: true,
      },
      create: {
        user_id: user_id,
        notification_id: notificationId,
        state: true,
      },
    });

    // Fetch updated notification status
    const all = await prisma.userNotification.findMany({
      where: {
        notification_id: notificationId,
      },
    });

    // Emit the updated notification status to clients
    const io = getIo();
    io.emit("notificationUpdated", { message: all });

    return res
      .status(200)
      .json({ message: "Notification status successfully updated!", all });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "Failed to update the notification!" });
  }
};

module.exports = {
  updateNotification,
  getNotification,
  singleUpdateNotification,
};
