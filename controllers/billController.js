const prisma = require("../prismaClient");

const addBill = async (req, res) => {
  try {
    const {
      bill_no,
      bill_date,
      invoice_no,
      paid_amount,
      vat_number,
      bill_type,
      items, // Expecting an array of items
    } = req.body;

    const vendor = await prisma.vendors.findFirst({ where: { vat_number } });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // Process each item and calculate the necessary fields
    const billItems = await Promise.all(
      items.map(async (item) => {
        const foundItem = await prisma.items.findFirst({
          where: { item_name: item.item_name },
        });

        if (!foundItem) {
          throw new Error(`Item ${item.item_name} not found`);
        }

        // Calculate total price for the current item
        const total_amount = item.unit_price * item.quantity;

        // Calculate TDS based on the provided TDS value
        let tdsDeductAmount;
        if (item.TDS === 1.5) {
          tdsDeductAmount = (total_amount / 1.13) * 0.015;
        } else if (item.TDS === 10) {
          tdsDeductAmount = total_amount * 0.1;
        } else {
          tdsDeductAmount = 0; // No TDS deduction if no matching TDS value
        }

        const tdsValue = total_amount - tdsDeductAmount;

        let vatCalculation = 0;
        if (bill_type === 'VAT') {
          // Calculate VAT (13%)
          vatCalculation = total_amount * 1.13;
        }

        return {
          item: { connect: { item_id: foundItem.item_id } },
          quantity: item.quantity,
          unit_price: item.unit_price,
          TDS_deduct_amount: tdsDeductAmount,
          VATAmount: vatCalculation,
          TDS: item.TDS,
        };
      })
    );

    let totalSumAmount;
    let pendingAmount;

    if (bill_type === 'VAT') {
      // Calculate the total amount for all items
      totalSumAmount = billItems.reduce((sum, item) => sum + (item.VATAmount || 0), 0);

      // Calculate pending amount
      if (totalSumAmount >= paid_amount) {
        pendingAmount = totalSumAmount - (paid_amount || 0);
      } else {
        return res.status(400).json({
          error: "Paid amount cannot be greater than the actual amount!",
        });
      }
    } else if (bill_type === 'PAN') {
      // Calculate total amount for PAN
      totalSumAmount = billItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      // Calculate pending amount
      if (totalSumAmount >= paid_amount) {
        pendingAmount = totalSumAmount - (paid_amount || 0);
      } else {
        return res.status(400).json({
          error: "Paid amount cannot be greater than the actual amount!",
        });
      }
    } else {
      return res.status(400).json({
        error: "Invalid bill type",
      });
    }

    // Create the bill and link multiple items
    const bill = await prisma.bills.create({
      data: {
        bill_no,
        bill_date: new Date(bill_date),
        invoice_no,
        paid_amount,
        left_amount: pendingAmount,
        bill_type,
        vendors: { connect: { vendor_id: vendor.vendor_id } },
        BillItems: {
          create: billItems,
        },
      },
      include: {
        BillItems: true,
      },
    });

    return res.status(200).json({ message: "Successfully added bill!", bill });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = {
  addBill,
};
