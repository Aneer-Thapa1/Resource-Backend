const prisma = require("../prismaClient");

const getIssue = async (req, res) => {
  try {
    const issueData = await prisma.issue.findMany({
      include: {
        request: true,
      },
    });
    const findUser = await prisma.users.findFirst({
      where: {
        user_id: issueData.approved_by,
      },
    });
    const reqUser = await prisma.users.findFirst({
      where: {
        user_id: issueData.user_id,
      },
    });
    const department = await prisma.department.findFirst({
      where: {
        department_id: reqUser.department_id,
      },
    });

    const response = issueData.map((issue) => ({
      issue_id: issue.id,
      issue_name: issue.issue_item,
      quantity: issue.Quantity,
      remarks: issue.request.remarks,
      issueData: issue.issue_Data,
      status: issue.request.status,
      approved_by: findUser.user_name,
      department: department.department_name,
      isReturned: issue.request.isReturned,
    }));
    return res.status(200).json({ issue: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const addIssue = async (req, res) => {
  try {
    const { items, issued_to, purpose, issue_date } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid or missing items" });
    }

    if (!purpose || !issue_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const issuePromises = items.map(async (item) => {
      if (!item.item_name || !item.quantity) {
        throw new Error("Invalid item data");
      }

      return prisma.issue.create({
        data: {
          issue_item: item.item_name,
          Quantity: parseInt(item.quantity),
          issue_Date: new Date(issue_date),
          purpose: purpose,
          issued_to:issued_to
        },
      });
    });

    const issues = await Promise.all(issuePromises);

    res.status(201).json({ message:"Issue added successfully", issues });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};


module.exports = {
  getIssue,
  addIssue
};
