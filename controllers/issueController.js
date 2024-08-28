const prisma = require("../prismaClient");

const getIssue = async (req, res) => {
  try {
    const issueData = await prisma.issue.findMany({
      include: {
        request: true,
      },
    });

    const response = await Promise.all(issueData.map(async (issue) => {
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
        remarks: issue.request?.remarks || "",
        issueData: issue.issue_Data,
        status: issue.request?.status || "",
        approved_by: findUser?.user_name || "",
        requested_by: reqUser?.user_name || issue.issued_to,
        department: department?.department_name || "",
        isReturned: issue.request?.isReturned || "",
      };
    }));

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
      where:{
        user_id: id
      }
    })

    console.log(approvedby);



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
          issued_to:issued_to,
          approved_by: approvedby.user_name
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
