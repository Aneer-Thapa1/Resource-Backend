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
      unit_price,
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

    // Calculate the left_amount
    const left_amount = actual_amount - paid_amount;

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the bill
      const newBill = await prisma.bills.create({
        data: {
          bill_no,
          bill_amount: parseFloat(bill_amount),
          bill_date: new Date(bill_date),
          TDS: parseFloat(TDS),
          invoice_no,
          actual_amount: parseFloat(actual_amount),
          paid_amount: parseFloat(paid_amount),
          quantity: parseInt(quantity),
          left_amount: parseFloat(left_amount),
          unit_price: parseFloat(unit_price),
          vendor_ID: vendor.vendor_id,
          item_id: item.item_id,
        },
      });

      // Update the vendor's total and pending payments
      const specificData = await prisma.$queryRaw`
        SELECT 
          SUM(bills.actual_amount) as total_purchase_amount, 
          SUM(bills.left_amount) as total_pending_amount 
        FROM resource.bills 
        JOIN resource.vendors 
        ON bills.vendor_ID = vendors.vendor_id 
        WHERE vendors.vendor_id = ${vendor.vendor_id}`;

      // Update the vendor's total and pending payments
      const updatedVendor = await prisma.vendors.update({
        where: {
          vendor_id: vendor.vendor_id,
        },
        data: {
          total_payment: specificData[0].total_purchase_amount,
          pending_payment: specificData[0].total_pending_amount,
          last_purchase_date: new Date(bill_date),
        },
      });

      return { newBill, specificData, updatedVendor };
    });

    return res.status(201).json(result.newBill);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to add the bill!" });
  }
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
      unit_price,
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

    // Find the bill by ID
    const billData = await prisma.bills.findUnique({
      where: {
        bill_ID: Number(billId),
      },
    });

    if (!billData) {
      return res.status(404).json({ error: "Bill not found!" });
    }

    // Calculate the left_amount
    const left_amount = actual_amount - paid_amount;

    const result = await prisma.$transaction(async (prisma) => {
      const updateBill = await prisma.bills.update({
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
          left_amount,
          unit_price,
          vendor_ID: vendor.vendor_id,
          item_id: item.item_id,
        },
      });

      // Update the vendor's total and pending payments
      const specificData = await prisma.$queryRaw`
        SELECT 
          SUM(bills.actual_amount) as total_purchase_amount, 
          SUM(bills.left_amount) as total_pending_amount 
        FROM resource.bills 
        JOIN resource.vendors 
        ON bills.vendor_ID = vendors.vendor_id 
        WHERE vendors.vendor_id = ${vendor.vendor_id}`;

      // Update the vendor's total and pending payments
      const updatedVendor = await prisma.vendors.update({
        where: {
          vendor_id: vendor.vendor_id,
        },
        data: {
          total_payment: specificData[0].total_purchase_amount,
          pending_payment: specificData[0].total_pending_amount,
          last_purchase_date: bill_date,
        },
      });

      return { updateBill, specificData, updatedVendor };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Failed to update the bill!" });
  }
};
const getBill = async(req,res)=>{
  try{
    const billData = await prisma.bills.findMany({
      include:{
        vendors:true,
        items:true
      }

    });
    return res.status(200).json({bills: billData});

  }
  catch(error){
    return res.status(501).json({error: "failed to fetch the bills ! "})
  }
};

module.exports = {
  addBill,
  updateBill,
  getBill
};