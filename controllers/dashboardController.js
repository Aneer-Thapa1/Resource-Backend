const prisma = require("../prismaClient");

const dashboard = async (req, res) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      //vendors
        const getVendor = await prisma.vendors.findMany({});
      const black_listed = await prisma.vendors.findMany({
        where:{
            black_list:true
        }
      });

      //issue
    const getIssue =await prisma.issue.findMany({});
      const pendingRequest = await prisma.request.findMany({
        where:{
            status :"Pending"
        }
      })

      //items
      const getItems = await prisma.items.findMany({});
      const categories = await prisma.category.findMany({});

      const lowStock = getItems.filter(item => item.low_limit > item.quantity);


      //bills
      const getBills = await prisma.bills.findMany({});
      const pendingPayment = getBills.filter(bill =>bill.left_amount != 0);

      //request
      const getRequest = await prisma.request.findMany({});

      const response = {
          itemsCount : getItems.length,
          categoryCount : categories.length,
          lowStockCount : lowStock.length,
        vendorCount: getVendor.length,
        black_listed: black_listed.length,
        issueCount: getIssue.length,
        billsCount : getBills.length,
        pendingPaymentCount : pendingPayment.length,
        requestCount : getRequest.length,
        pendingRequestCount: pendingRequest.length,
      };

      return response;
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = {
  dashboard,
};
