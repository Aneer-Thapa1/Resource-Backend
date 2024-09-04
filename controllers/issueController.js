const prisma = require("../prismaClient");
const { getIo } = require("../socket");


const getIssue = async (req, res) => {
  try {
    const issueData = await prisma.issue.findMany({
      include: {
        request: true,
      },
    });

    const response = await Promise.all(
      issueData.map(async (issue) => {
        let findUser = null;
        let reqUser = null;
        let department = null;

        if (issue.request) {
          findUser = await prisma.users.findFirst({
            where: {
              user_id: issue.request.approved_by,
            },
          });

          reqUser = await prisma.users.findFirst({
            where: {
              user_id: issue.request.user_id,
            },
          });

          if (reqUser) {
            department = await prisma.department.findFirst({
              where: {
                department_id: reqUser.department_id,
              },
            });
          }
        }

        return {
          issue_id: issue.id,
          issue_name: issue.issue_item,
          quantity: issue.Quantity,
          remarks: issue.request?.remarks || issue.purpose,
          issueDate: issue.issue_Date,
          status: issue.request?.status || "",
          approved_by: findUser?.user_name || issue.approved_by,
          requested_by: reqUser?.user_name || issue.issued_to,
          department: department?.department_name || "students",
          isReturned: issue.isReturned
        };
      })
    );
    console.log(response);

    return res.status(200).json({ issue: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const addIssue = async (req, res) => {
  try {
    const id = req.user.user_id;
    const { items, issued_to, purpose, issue_date } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid or missing items" });
    }

    if (!purpose || !issue_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const approvedby = await prisma.users.findFirst({
      where: {
        user_id: id,
      },
    });

    const issuePromises = items.map(async (item) => {
      if (!item.item_name || !item.quantity) {
        throw new Error("Invalid item data");
      }

      return prisma.issue.create({
        data: {
          issue_item: item.item_name,
          Quantity: parseInt(item.quantity),
          issue_Date:  new Date(issue_date),
          purpose: purpose,
          issued_to: issued_to,
          approved_by: approvedby.user_name,
        },
      });
    });

    const issues = await Promise.all(issuePromises);

    res.status(201).json({ message: "Issue added successfully", issues });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};
const editIssue = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user_id = req.user.user_id;
    const { item_name, quantity, issued_to, purpose, issue_date, isReturned } = req.body;

    // Validate required fields
    if (!item_name || !quantity || !purpose || !issue_date || !issued_to) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the issue exists
    const existingIssue = await prisma.issue.findFirst({ where: { id } });
    if (!existingIssue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    // If the item has already been returned
    if (existingIssue.isReturned) {
      return res.status(400).json({ message: "Item has already been returned" });
    }

    // Find the approver by user_id
    const approver = await prisma.users.findFirst({ where: { user_id } });
    if (!approver) {
      return res.status(404).json({ error: "Approver not found!" });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Update the issue
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: {
          issue_item: item_name,
          Quantity: parseInt(quantity),
          issue_Date: new Date(issue_date),
          purpose,
          issued_to,
          approved_by: approver.user_name,
          isReturned: Boolean(isReturned),
        },
        include: {
          request: {
            include: {
              requestItems: {
                include: { item: true },
              },
            },
          },
        },
      });

      // If the item is returned, update the item's remaining quantity
      if (Boolean(isReturned)) { 
        const itemId = updatedIssue.request.requestItems[0]?.item.item_id;
        if (itemId) {
          await prisma.items.update({
            where: { item_id: itemId },
            data: {
              remaining_quantity: {
                increment: updatedIssue.Quantity,
              },
            },
          });

          // Create a notification
          const notificationMessage = `${updatedIssue.request.requestItems[0].item.item_name} has been returned`;
          const notifyMessage = await prisma.notification.create({
            data: {
              message: notificationMessage,
              user_id,
              created_at: new Date(),
            },
          });

          // Emit the notification
          const io = getIo();
          io.emit("newBill", { message: notifyMessage });
        }
      }

      return updatedIssue;
    });

    return res.status(200).json({ message: "Issue updated successfully", result });
  } catch (error) {
    console.error("Error updating issue:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};






module.exports = {
  getIssue,
  addIssue,
  editIssue


};
