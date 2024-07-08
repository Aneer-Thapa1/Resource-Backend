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
      return res.staus(404).json({ error: "items not found !" });
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

      // Update the vendor's total_payment and pending_payment
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
          pending_payment:
            vendor.pending_payment !== null
              ? {
                  increment: left_amount,
                }
              : left_amount,
        },
      });
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
  return res.status(500).json({ allData });
};

const updateBill = async (req, res) => {
    try {
        const billId = req.params.id;
        console.log(billId);
        const billData = await prisma.bills.findUnique({
            where:{
                bill_ID: Number(billId)
            }
        });
        
        const result = await prisma.$transaction(async (prisma) =>{
            const updateBillData = await prisma.bills.update({
              where: {
                bill_ID: Number(billId),
              },
              data: req.body,
            });
            return{updateBillData};
        });
     
      return res.status(200).json(result.updateBillData);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to update the bill!" });
    }
  };

module.exports = {
  addBill,
  getBill,
  updateBill
};
