const prisma = require("../prismaClient");

const addBill = async (req, res) => {
  try {
    const {
      bill_no,
      bill_amount,
      bill_date,
      TDS,
      invoice_no,
      actual_amount,
      paid_amount,
      vendor_name,
      quantity,
      item_name,
    } = req.body;

    // Find the vendor by name
    const vendor = await prisma.vendors.findFirst({
      where: {
        vendor_name: vendor_name,
      },
    });

    // Find the item by name
    const item = await prisma.items.findFirst({
      where: {
        item_name: item_name,
      },
    });
    if (!item) {
      return res.status(404).json({ error: "Item not found!" });
    }

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found!" });
    }
    // Calculate left_amount
    const left_amount = actual_amount - paid_amount;

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the bill
      const newBill = await prisma.bills.create({
        data: {
          bill_no,
          bill_amount,
          bill_date,
          TDS,
          invoice_no,
          actual_amount,
          paid_amount,
          quantity,
          left_amount, // Assigning calculated left_amount
          vendor_ID: vendor.vendor_id,
          item_id: item.item_id,
        },
      });

      // Calculate the new pending payment for the vendor
      const updatedVendor = await prisma.vendors.update({
        where: {
          vendor_id: vendor.vendor_id,
        },
        data: {
          total_payment:
            vendor.total_payment !== null
              ? {
                  increment: actual_amount,
                }
              : actual_amount,
        },
      });

      // Recalculate pending_payment
      const pendingPaymentSum = await prisma.bills.aggregate({
        _sum: {
          left_amount: true,
        },
        where: {
          vendor_ID: vendor.vendor_id,
        },
      });

      await prisma.vendors.update({
        where: {
          vendor_id: vendor.vendor_id,
        },
        data: {
          pending_payment: pendingPaymentSum._sum.left_amount || 0,
        },
      });

      // Update the item
      const updateItem = await prisma.items.update({
        where: {
          item_id: item.item_id,
        },
        data: {
          quantity:
            item.quantity !== null
              ? {
                  increment: quantity,
                }
              : quantity,
          total_purchased:
            item.total_purchased !== null
              ? {
                  increment: actual_amount,
                }
              : actual_amount,
        },
      });

      return { newBill, updatedVendor, updateItem };
    });

    return res.status(201).json(result.newBill); 
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to add the bill!" });
  }
};

const getBill = async (req, res) => {
  const allData = await prisma.bills.findMany({
    include: {
      vendors: true,
      items: true,
    },
  });
  return res.status(200).json({ allData });
};

const updateBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const {
      bill_no,
      bill_amount,
      bill_date,
      TDS,
      invoice_no,
      actual_amount,
      paid_amount,
      vendor_name,
      quantity,
      item_name,
    } = req.body;

    // Find the bill by ID
    const billData = await prisma.bills.findUnique({
      where: {
        bill_ID: Number(billId),
      },
    });

    if (!billData) {
      return res.status(404).json({ error: "Bill not found!" });
    }

    // Find the vendor by name
    const vendor = await prisma.vendors.findFirst({
      where: {
        vendor_name: vendor_name,
      },
    });

    // Find the item by name
    const item = await prisma.items.findFirst({
      where: {
        item_name: item_name,
      },
    });

    if (!vendor || !item) {
      return res.status(404).json({ error: "Vendor or Item not found!" });
    }

    // Calculate the left_amount
    const left_amount = actual_amount - paid_amount;

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update the bill
      const updatedBill = await prisma.bills.update({
        where: {
          bill_ID: Number(billId),
        },
        data: {
          bill_no,
          bill_amount,
          bill_date,
          TDS,
          invoice_no,
          actual_amount,
          paid_amount,
          quantity,
          left_amount, // Assigning calculated left_amount
          vendor_ID: vendor.vendor_id,
          item_id: item.item_id,
        },
      });

      // Update the vendor's total_payment
      await prisma.vendors.update({
        where: {
          vendor_id: billData.vendor_ID,
        },
        data: {
          total_payment: {
            decrement: billData.actual_amount,
          },
        },
      });

      await prisma.vendors.update({
        where: {
          vendor_id: billData.vendor_ID,
        },
        data: {
          total_payment: {
            increment: actual_amount,
          },
        },
      });

      // Recalculate pending_payment
      const pendingPaymentSum = await prisma.bills.aggregate({
        _sum: {
          left_amount: true,
        },
        where: {
          vendor_ID: billData.vendor_ID,
        },
      });

      await prisma.vendors.update({
        where: {
          vendor_id: billData.vendor_ID,
        },
        data: {
          pending_payment: pendingPaymentSum._sum.left_amount || 0,

          item_id: billData.item_id,
        },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      await prisma.items.update({
        where: {
          item_id: billData.item_id,
        },
        data: {
          total_purchased: {
            decrement: billData.actual_amount,
          },
        },
      });

      await prisma.items.update({
        where: {
          item_id: billData.item_id,
        },
        data: {
          total_purchased: {
            increment: actual_amount,
          },
        },
      });

      return updatedBill;
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update the bill!" });
  }
};

module.exports = {
  addBill,
  getBill,
  updateBill,
};