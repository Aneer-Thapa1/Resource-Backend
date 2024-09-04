const prisma = require("../prismaClient");

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
          isReturned: issue.request?.isReturned || "",
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
          issue_Date: issue_date,
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
    const { item_name, quantity, issued_to, purpose, issue_date } = req.body;

    if (!purpose || !issue_date || !issued_to) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the user who is approving the issue
    const approvedBy = await prisma.users.findFirst({
      where: {
        user_id: user_id,
      },
    });

    // Update the issue
    const updatedIssue = await prisma.issue.update({
      where: {
        id: id,
      },
      data: {
        issue_item: item_name,
        Quantity: parseInt(quantity),
        issue_Date: new Date(issue_date),
        purpose: purpose,
        issued_to: issued_to,
        approved_by: approvedBy.user_name,
      },
    });

    // Respond with the updated issue
    return res
      .status(200)
      .json({ message: "Issue updated successfully", updatedIssue });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = {
  getIssue,
  addIssue,
  editIssue,
};
