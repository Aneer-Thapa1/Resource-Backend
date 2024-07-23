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
      vat_number,
      quantity,
      item_name,
      unit_price,
    } = req.body;

    // Find the vendor by vat number
    const vendor = await prisma.vendors.findFirst({
      where: {
        vat_number: vat_number
      },
    });
    console.log(vendor);
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
      return res.status(404).json({ error: "VAT Number is not found !" });
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
      const allVendors = await prisma.vendors.findMany();

      let specificData;
      for (const vendor of allVendors) {
        const specificData = await prisma.$queryRaw`
      SELECT SUM(bills.actual_amount) as total_purchase_amount, 
            SUM(bills.left_amount) as total_pending_amount 
            FROM resource.bills 
            JOIN resource.vendors 
            ON bills.vendor_ID = vendors.vendor_id 
            WHERE vendors.vendor_id = ${vendor.vendor_id}`;

        await prisma.vendors.update({
          where: {
            vendor_id: vendor.vendor_id,
          },
          data: {
            total_payment: specificData[0].total_purchase_amount,
            pending_payment: specificData[0].total_pending_amount,
            last_purchase_date: new Date(bill_date),
          },
        });
      }

      const allItem = await prisma.items.findMany();

      let itemData;
      for (const item of allItem) {
        const itemData = await prisma.$queryRaw`
      SELECT SUM(bills.actual_amount) as total_purchase_amount, 
                 SUM(bills.quantity) as total_quantity 
                 FROM resource.bills 
                 JOIN resource.items 
                 ON bills.item_id = items.item_id 
                 WHERE items.item_id = ${item.item_id}`;

        await prisma.items.update({
          where: {
            item_id: item.item_id,
          },
          data: {
            total_purchased: itemData[0].total_purchase_amount,
            quantity: itemData[0].total_quantity,
            // last_purchase_date: new Date(bill_date),
          },
        });
      }

      return { newBill, specificData, itemData };
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
          bill_date: new Date(bill_date),
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
      const allVendors = await prisma.vendors.findMany();

      let specificData;
      for (const vendor of allVendors) {
        const specificData = await prisma.$queryRaw`
        SELECT 
          SUM(bills.actual_amount) as total_purchase_amount, 
          SUM(bills.left_amount) as total_pending_amount 
        FROM resource.bills 
        JOIN resource.vendors 
        ON bills.vendor_ID = vendors.vendor_id 
        WHERE vendors.vendor_id = ${vendor.vendor_id}`;

        await prisma.vendors.update({
          where: {
            vendor_id: vendor.vendor_id,
          },
          data: {
            total_payment: specificData[0].total_purchase_amount,
            pending_payment: specificData[0].total_pending_amount,
            last_purchase_date: new Date(bill_date),
          },
        });
      }

      const allItems = await prisma.items.findMany();

      let itemData;
      for (const item of allItems) {
        const itemData = await prisma.$queryRaw`
      SELECT SUM(bills.actual_amount) as total_purchase_amount, 
                 SUM(bills.quantity) as total_quantity 
                 FROM resource.bills 
                 JOIN resource.items 
                 ON bills.item_id = items.item_id 
                 WHERE items.item_id = ${item.item_id}`;

        await prisma.items.update({
          where: {
            item_id: item.item_id,
          },
          data: {
            total_purchased: itemData[0].total_purchase_amount,
            quantity: itemData[0].total_quantity,
            // last_purchase_date: new Date(bill_date),
          },
        });
      }
      return { updateBill, specificData, itemData };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Failed to update the bill!" });
  }
};

const getBill = async (req, res) => {
  try {
    const billData = await prisma.bills.findMany({
      include: {
        vendors: true,
        items: true,
      },
    });
    if (req.query.search) {
      const searchBill = billData.filter((bill) =>
        bill.bill_no.toLowerCase().includes(req.query.search.toLowerCase())
      );
      return res.status(201).json({ searchBill });
    }
    
    return res.status(200).json({ bills: billData });
  } catch (error) {
    return res.status(501).json({ error: "failed to fetch the bills!" });
  }
};

const getBillById = async (req, res) => {
  try {
    const { bill_id } = req.params;

    const singleBillData = await prisma.bills.findUnique({
      where: {
        bill_ID: Number(bill_id),
      },
      include: {
        vendors: true,
        items: true
      },
    });

    if (!singleBillData) {
      return res.status(404).json({ error: "Bill not found" });
    }

    return res.status(200).json({ bill: singleBillData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch the single bill!" });
  }
};

module.exports = {
  addBill,
  updateBill,
  getBill,
  getBillById,
};
