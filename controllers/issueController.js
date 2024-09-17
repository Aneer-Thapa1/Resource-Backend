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
          id: issue.id,
          issue_name: issue.issue_item,
          quantity: issue.Quantity,
          purpose: issue.request?.remarks || issue.purpose,
          issue_date: issue.issue_Date,
          status: issue.request?.status || "",
          approved_by: findUser?.user_name || issue.approved_by,
          requested_by: reqUser?.user_name || issue.issued_to,
          department: department?.department_name || "students",
          isReturned: issue.isReturned,
        };
      })
    );

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
    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid or missing items" });
    }
    if (!purpose || !issue_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the approved user
    const approvedby = await prisma.users.findFirst({
      where: {
        user_id: id,
      },
      include: {
        department: true,
      },
    });
    if (!approvedby) {
      return res.status(404).json({ error: "Approving user not found" });
    }

    // Loop through each item and create issue records
    const issuePromises = items.map(async (item) => {
      // Check item validity
      if (!item.item_id) {
        throw new Error("Invalid item data");
      }
      if (!item.quantity) {
        throw new Error("Invalid quantity data");
      }

      // Find the item
      const findItem = await prisma.items.findFirst({
        where: {
          item_id: item.item_id,
        },
      });

      if (!findItem) {
        throw new Error(`Item with id ${item.item_id} not found`);
      }

      // Create issue record for each item
      return prisma.issue.create({
        data: {
          issue_item: findItem.item_name,
          item_id: findItem.item_id,
          Quantity: parseInt(item.quantity),
          issue_Date: new Date(issue_date),
          purpose: purpose,
          issued_to: issued_to,
          approved_by: approvedby.user_name,
        },
      });
    });

    const issues = await Promise.all(issuePromises);

    // Construct a response object for all issues
    const response = issues.map((issue) => ({
      id: issue.id,
      issue_item: issue.issue_item,
      Quantity: issue.Quantity,
      purpose: issue.purpose,
      issue_Date: issue.issue_Date,
      approved_by: issue.approved_by,
      requested_by: issued_to,
      department: approvedby.department.department_name,
      isReturned: issue.isReturned,
    }));

    res.status(201).json({ message: "Issue added successfully", response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const editIssue = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const {
      id,
      issue_name,
      quantity,
      requested_by,
      purpose,
      issue_date,
      remarks,
      isReturned,
    } = req.body;

    console.log(id);

    // Check if the issue exists
    const existingIssue = await prisma.issue.findFirst({ where: { id: id } });
    if (!existingIssue) {
      return res.status(404).json({ error: "Issue not found!" });
    }

    // If the item has already been returned
    if (existingIssue.isReturned) {
      return res
        .status(400)
        .json({ message: "Item has already been returned" });
    }

    // Find the approver by user_id
    const approver = await prisma.users.findFirst({ where: { user_id } });

    if (!approver)
      return res.status(404).json({ error: "Approver not found!" });

    const result = await prisma.$transaction(async (prisma) => {
      // Update the issue
      const updatedIssue = await prisma.issue.update({
        where: { id },
        data: {
          issue_item: issue_name,
          Quantity: parseInt(quantity),
          issue_Date: new Date(issue_date),
          purpose: purpose,
          issued_to: requested_by,
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
        const itemId = updatedIssue.item_id;
        if (itemId) {
          await prisma.items.update({
            where: { item_id: itemId },
            data: {
              remaining_quantity: {
                decrement: updatedIssue.Quantity,
              },
            },
          });

          const item_name = await prisma.items.findFirst({
            where: {
              item_id: updatedIssue.item_id,
            },
          });

          // Create a notification
          const notificationMessage = `${item_name.item_name} has been returned`;
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

    return res
      .status(200)
      .json({ message: "Issue updated successfully", result });
  } catch (error) {
    console.error("Error updating issue:", error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = {
  getIssue,
  addIssue,
  editIssue,
};
