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
    const { items, student_name, purpose } = req.body;
    const issuePromises = items.map(async (item) => {
      return prisma.issue.create({
        data: {
          issue_item: item.item_name, 
          Quantity: item.quantity, 
          issue_Date: new Date(),
          student_name:student_name,
          purpose:purpose
        },
      });
    });

    // Wait for all promises to resolve
    const issues = await Promise.all(issuePromises);

    res.status(201).json({issues});
  } catch (error) {
    console.error("Error adding issues:", error);
    res.status(500).json({
      error: "Failed to add issues",
    });
  }
};

module.exports = {
  getIssue,
  addIssue
};
