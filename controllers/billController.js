const prisma = require("../prismaClient");

const addBill = async (req, res) => {
  try {
    const {
      bill_no,
      bill_amount,
      bill_date,
      TDS,
      invoice_no,
      paid_amount,
      vat_number,
      quantity,
      item_name,
      unit_price,
    } = req.body;

    // Find the vendor by vat number
    const vendor = await prisma.vendors.findFirst({
      where: {
        vat_number: vat_number,
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
      return res.status(404).json({ error: "VAT Number is not found !" });
    }
      
      // TDS Calculation
      const calculateTDS = (amount, TDS) => {
        let tdsValue = 0;
        if (TDS === 1.5) {
          tdsValue = (amount / 1.13) * 0.015;
          console.log("1.5");
        } else if (TDS === 10) {
          tdsValue = amount * 0.1;
        } else if (TDS === 15) {
          tdsValue = amount * 0.1;
        } else {
        return res
          .status(500)
          .json({
            error:
            "Invalid TDS percentage!"
          });

      }
      return amount - tdsValue;
    };

    const calculatedActualAmount = calculateTDS(
      parseFloat(bill_amount),
      parseFloat(TDS)
    );

     // Calculate the left_amount
     let left_amount;
     if (calculatedActualAmount >= paid_amount) {
       left_amount = calculatedActualAmount - paid_amount;
     } else {
       return res
         .status(404)
         .json({
           error:
             "Paid amount cannot be greater than or equal to actual amount! !",
         });
       }

    // Create the bill
    const result = await prisma.$transaction(async (prisma) => {
      const newBill = await prisma.bills.create({
        data: {
          bill_no,
          bill_amount: parseFloat(bill_amount),
          bill_date: new Date(),
          TDS: parseFloat(TDS),
          invoice_no,
          actual_amount: calculatedActualAmount,
          paid_amount: parseFloat(paid_amount),
          quantity: parseInt(quantity),
          left_amount: parseFloat(left_amount),
          unit_price: parseFloat(unit_price),
          vendor_ID: vendor.vendor_id,
          item_id: item.item_id,
        },
      });

      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const payment_day = addDays(new Date(bill_date), vendor.payment_duration);

      const updateVendor = await prisma.vendors.update({
        where: {
          vendor_id: newBill.vendor_ID,
        },
        data: {
          last_purchase_date: newBill.bill_date,
          next_payment_date: payment_day,
          last_paid: new Date()
        },
      });
      const updateItem = await prisma.items.update({
        where: {
          item_id: newBill.item_id,
        },
        data: {
          recent_purchase: newBill.bill_date,
          unit_price: newBill.unit_price
        },
      });

      return { newBill, updateVendor,updateItem };
    });
    return res.status(201).json({ result });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to add the bill!" });
  }
};

const updateBill = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      bill_no,
      bill_amount,
      bill_date,
      TDS,
      invoice_no,
      paid_amount,
      vat_number,
      quantity,
      item_name,
      unit_price,
    } = req.body;

    // Find the vendor by VAT number
    const vendor = await prisma.vendors.findFirst({
      where: { vat_number },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found!" });
    }

    // Find the item by name
    const item = await prisma.items.findFirst({
      where: { item_name },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found!" });
    }

    // TDS Calculation
    const calculateTDS = (amount, TDS) => {
      let tdsValue = 0;
      if (TDS === 1.5) {
        tdsValue = (amount / 1.13) * 0.015;
      } else if (TDS === 10) {
        tdsValue = amount * 0.1;
      } else if (TDS === 15) {
        tdsValue = amount * 0.1;
      } else {
        throw new Error("Invalid TDS percentage!");
      }
      return amount - tdsValue;
    };

    const calculatedActualAmount = calculateTDS(parseFloat(bill_amount), parseFloat(TDS));

    // Calculate the left_amount
    let left_amount;
    if (calculatedActualAmount >= paid_amount) {
      left_amount = calculatedActualAmount - paid_amount;
    } else {
      return res.status(400).json({
        error: "Paid amount cannot be greater than or equal to actual amount!",
      });
    }

    // Transaction to update bill, vendor, and item
    const result = await prisma.$transaction(async (prisma) => {
      const updatedBill = await prisma.bills.update({
        where: { bill_ID: id },
        data: {
          // entry_date:new Date(),
          bill_no,
          bill_amount: parseFloat(bill_amount),
          bill_date: new Date(bill_date),
          TDS: parseFloat(TDS),
          invoice_no,
          actual_amount: calculatedActualAmount,
          paid_amount: parseFloat(paid_amount),
          quantity: parseInt(quantity),
          left_amount: parseFloat(left_amount),
          unit_price: parseFloat(unit_price),
          vendor_ID: vendor.vendor_id,
          item_id: item.item_id,
        },
      });

      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const payment_day = addDays(new Date(bill_date), vendor.payment_duration);

      await prisma.vendors.update({
        where: { vendor_id: vendor.vendor_id },
        data: {
          last_purchase_date: updatedBill.bill_date,
          next_payment_date: payment_day,
          last_paid: new Date(),
        },
      });

      await prisma.items.update({
        where: { item_id: item.item_id },
        data: {
          recent_purchase: updatedBill.bill_date,
          unit_price: updatedBill.unit_price,
        },
      });

      return updatedBill;
    });

    return res.status(200).json({ result });
  } catch (error) {
    console.error(error);
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
