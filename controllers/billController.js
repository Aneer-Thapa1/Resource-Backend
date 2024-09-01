const prisma = require("../prismaClient");
const NepaliDate = require("nepali-date-converter");
const { getIo } = require("../socket");

const {
  vatCalculationHandler,
  panCalculationHandler,
  noBillCalculation,
  tdsCalculation,
  vatCalculation,
} = require("../controllers/billMethods/billCalculationMethods");
const { isUppercase } = require("validator");

const billCalculationMethods = {
  VAT: vatCalculationHandler,
  PAN: panCalculationHandler,
  NOBILL: noBillCalculation,
};

const addBill = async (req, res) => {
  try {
    const {
      bill_no,
      bill_date,
      invoice_no,
      paid_amount,
      vat_number, // Explicitly include vat_number
      items,
      selectedOptions,
    } = req.body;

    const userId = req.user.user_id;

    const user = await prisma.users.findFirst({
      where: { user_id: userId },
      select: { user_name: true, department: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const TDS = Number(selectedOptions.split(" ")[1]);
    const bill_type = selectedOptions.split(" ")[0].toUpperCase();

    let existingBill = null;
    if (bill_type !== "NOBILL") {
      existingBill = await prisma.bills.findFirst({
        where: { bill_no },
      });
    }

    if (existingBill) {
      return res.status(400).json({ error: "Bill with this number already exists" });
    }

    // Validate that VAT number is provided when bill type is VAT
    let vendor = null;
    if (bill_type === "VAT" || bill_type === "PAN") {
      if (!vat_number) {
      return res.status(400).json({ error: "VAT number is required !" });

      }
      vendor = await prisma.vendors.findFirst({
        where: { vat_number },
      });

      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
    } 

    const item = await prisma.items.findFirst({
      where: {
        OR: items.map((item) => ({
          item_id: item.item_id,
        })),
      },
    });

    if (!item) {
      return res.status(400).json({ error: "Item not found!" });
    }

    // Loop through each item in the request body to process them
    const billItems = await Promise.all(
      items.map(async (item) => {
        const foundItem = await prisma.items.findFirst({
          where: { item_id: item.item_id },
        });

        if (!foundItem) {
          throw new Error(`Item ${item.item_name} not found`);
        }

        const total_amount = item.unit_price * item.quantity;

        let tdsDeductAmount = 0;
        try {
          // Calculate the TDS amount based on the total amount, TDS percentage, and bill type
          tdsDeductAmount = tdsCalculation(total_amount, TDS, bill_type);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

        const vatAmount = bill_type === "VAT" ? vatCalculation(total_amount, 0.13) : 0;

        // Total in VAT case
        const tdsDeduct_total_amount = vatAmount - tdsDeductAmount;

        // Total in PAN case
        const panAmount =  bill_type === "PAN" ? total_amount - tdsDeductAmount : 0;

        return {
          item: { connect: { item_id: foundItem.item_id } },
          quantity: item.quantity,
          unit_price: item.unit_price,
          TDS_deduct_amount: tdsDeductAmount,
          withVATAmount: vatAmount,
          total_Amount: bill_type === "VAT" ? tdsDeduct_total_amount : bill_type === "VAT" ? panAmount : total_amount,
          TDS: TDS,
        };
      })
    );

    const actualTotalAmount = billItems.reduce(
      (acc, item) => acc + item.total_Amount,
      0
    );

    // Determine the appropriate calculation method based on the bill type
    const calculationMethod = billCalculationMethods[bill_type];

    if (typeof calculationMethod !== "function") {
      return res.status(400).json({ error: "Invalid bill type"});
    }

    // Calculate the total sum amount and pending amount using the selected method
    const { totalSumAmount, pendingAmount } = calculationMethod(
      billItems,
      paid_amount,
      res
    );

    if (!totalSumAmount && !pendingAmount) {
      return;
    }

    const result = await prisma.$transaction(async (prisma) => {
      const resultData = await prisma.bills.create({
        data: {
          bill_no : bill_type === "NOBILL" ? "NO BILL" : bill_no,
          bill_date: new Date(bill_date),
          invoice_no,
          paid_amount: parseInt(paid_amount),
          left_amount: pendingAmount,
          actual_Amount: actualTotalAmount,
          bill_type,
          isApproved: Boolean(false),
          vendor_ID: vendor ? vendor.vendor_id : null,
          BillItems: {
            create: billItems,
          },
        },
        include: {
          BillItems: true,
        },
      });

      const notifyMessage = await prisma.notification.create({
        data: {
          message: `${resultData.bill_no} bill_no has added by ${user.user_name}`,
          user_id: Number(userId),
          created_at: new Date(),
        },
      });

      const io = getIo();
      io.emit("newBill", {
        message: notifyMessage,
      });

      return { resultData, notifyMessage };
    });
    return res.status(200).json({ message: "Successfully added bill", result });
  } catch (error) {
    console.log("Error:", error.message);

    // If the headers haven't been sent yet, return an internal server error response
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error!" });
    }
  }
};

const approveBill = async (req, res) => {
  try {
    const bill_id = req.params.bill_id;

    const bill = await prisma.bills.findFirst({
      where: {
        bill_id: Number(bill_id),
      },
      include: {
        vendors: true,
        BillItems: true,
      },
    });

    if (!bill) return res.status(400).json({ error: "Bill not found" });

    // If the bill is already approved
    if (bill.isApproved)
      return res.status(400).json({ message: "Bill already approved!" });

    const vendor = bill.vendors;

    // Handle the case where there is no vendor (NOBILL case)
    if (!vendor && bill.bill_type !== "NOBILL") {
      return res.status(400).json({ error: "Vendor not found for this bill" });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Update the bill to mark it as approved
      const updatedBill = await prisma.bills.update({
        where: {
          bill_id: bill.bill_id,
        },
        data: {
          isApproved: true,
        },
      });

      let updatedVendor;

      if (vendor) {
        // Calculate the next payment date based on the payment duration
        const addDays = (date, days) => {
          const result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        };

        const payment_day = addDays(
          new Date(bill.bill_date),
          vendor.payment_duration
        );

        // Update the vendor's purchase information
        updatedVendor = await prisma.vendors.update({
          where: {
            vendor_id: vendor.vendor_id,
          },
          data: {
            last_purchase_date: bill.bill_date,
            next_payment_date: payment_day,
            last_paid: bill.bill_date,
          },
        });
      }

      // Update each item's quantity and recent purchase date
      await Promise.all(
        bill.BillItems.map(async (billItem) => {
          const foundItem = await prisma.items.findFirst({
            where: {
              item_id: billItem.item_id,
            },
          });

          if (!foundItem) {
            throw new Error(`Item ${billItem.item_id} not found for update`);
          }

          return prisma.items.update({
            where: {
              item_id: foundItem.item_id,
            },
            data: {
              recent_purchase: bill.bill_date,
              quantity: foundItem.quantity + billItem.quantity,
              remaining_quantity: foundItem.quantity + billItem.quantity,
              unit_price: billItem.unit_price,
            },
          });
        })
      );

      return { updatedBill, updatedVendor };
    });

    return res
      .status(200)
      .json({ message: "Bill approved successfully", result });
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};


const getBill = async (req, res) => {
  try {
    const result = await prisma.bills.findMany({
      include: {
        vendors: true,
        BillItems: true,
      },
    });

    return res.status(200).json({ bill: result });
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

const getBillById = async (req, res) => {
  try {
    const bill_id = req.params.bill_id;

    const billData = await prisma.bills.findFirst({
      where: {
        bill_id: Number(bill_id),
      },
      include: {
        BillItems: {
          include: {
            item: true,
          },
        },
        vendors: true,
      },
    });

    if (!billData) {
      return res.status(404).json({ error: "Bill not found" });
    }

    const TDS =
      billData.BillItems.length > 0 ? billData.BillItems[0].TDS : null;


    const vendor_name = billData.vendors ? billData.vendors.vendor_name : null;

    return res.status(200).json({
      bill: billData,
      vendor_name: vendor_name,
      TDS: TDS,
    });
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};


const updateBill = async (req, res) => {
  const bill_id = Number(req.params.id);

  try {
    const {
      bill_no,
      bill_date,
      invoice_no,
      paid_amount,
      vat_number,
      selectedOptions,
      items,
    } = req.body;

    const TDS = Number(selectedOptions.split(" ")[1]);
    const bill_type = selectedOptions.split(" ")[0].toUpperCase();

    console.log(`Bill Type: ${bill_type}, TDS: ${TDS}`);

    // let existingBill = null;
    // if (bill_type !== "NOBILL") {
      existingBill = await prisma.bills.findFirst({
        where: {
          bill_id,
        },
        include: {
          BillItems: true,
        },
      });
    // }

    if (!existingBill) {
      return res.status(400).json({ error: "Invalid Bill " });
    }

    // Validate VAT number and fetch vendor
    let vendor = null;
    if (bill_type === "VAT" || bill_type === "PAN") {
      if (!vat_number ) {
        return res.status(400).json({ error: "VAT number  is required!" });
      }
      if (!bill_no ) {
        return res.status(400).json({ error: " bill no  is required!" });
      }

      vendor = await prisma.vendors.findFirst({
        where: { vat_number },
      });

      if (!vendor) {
        return res.status(404).json({ error: "Vendor not found" });
      }
    }

    if (!vendor && (bill_type === "VAT" || bill_type === "PAN")) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    // Process each item in the bill
    const billItems = await Promise.all(
      items.map(async (item) => {
        const foundItem = await prisma.items.findFirst({
          where: { item_id: parseInt(item.item_id) },
        });

        if (!foundItem) {
          throw new Error(`Item ${item.item_name} not found`);
        }

        const total_amount = item.unit_price * item.quantity;

        // Calculate TDS and VAT amounts
        let tdsDeductAmount = 0;
        try {
          tdsDeductAmount = tdsCalculation(total_amount, TDS, bill_type);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

        const vatAmount =
          bill_type === "VAT" ? vatCalculation(total_amount, 0.13) : 0;

        // Total in VAT case
        const tdsDeduct_total_amount = vatAmount - tdsDeductAmount;

        // Total in PAN case
        const panAmount =
          bill_type === "PAN" ? total_amount - tdsDeductAmount : total_amount;

        return {
          item: { connect: { item_id: parseInt(foundItem.item_id) } },
          quantity: item.quantity,
          unit_price: item.unit_price,
          TDS_deduct_amount: tdsDeductAmount,
          withVATAmount: vatAmount,
          total_Amount: bill_type === "VAT" ? tdsDeduct_total_amount : panAmount,
          TDS: TDS,
        };
      })
    );

    // Validate and determine the calculation method based on the bill type
    const calculationMethod = billCalculationMethods[bill_type];
    if (typeof calculationMethod !== "function") {
      return res.status(400).json({ error: "Invalid bill type" });
    }

    // Calculate total and pending amounts
    const { totalSumAmount, pendingAmount } = calculationMethod(
      billItems,
      parseInt(paid_amount),
      res
    );

    if (totalSumAmount === undefined || pendingAmount === undefined) {
      return;
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Update the bill details
      const updatedBill = await prisma.bills.update({
        where: { bill_id },
        data: {
          bill_no: bill_no,
          bill_date: new Date(bill_date),
          invoice_no,
          paid_amount: parseInt(paid_amount),
          left_amount: pendingAmount,
          actual_Amount: totalSumAmount,
          bill_type,
          vendors: vendor ? { connect: { vendor_id: vendor.vendor_id } } : undefined,
          BillItems: {
            deleteMany: { bill_id },
            create: billItems,
          },
        },
        include: {
          BillItems: {
            include: {
              item: true,
            },
          },
        },
      });

      // Update the quantities of the related items
      await Promise.all(
        items.map(async (item) => {
          const foundItem = await prisma.items.findFirst({
            where: { item_id: item.item_id },
          });

          const existingBillItem = existingBill?.BillItems.find(
            (billItem) => +billItem?.item_id === +foundItem.item_id
          );

          const quantityDifference =
            item.quantity - (existingBillItem?.quantity || 0);

          await prisma.items.update({
            where: { item_id: parseInt(foundItem.item_id) },
            data: {
              recent_purchase: updatedBill.bill_date,
              unit_price: item.unit_price,
              quantity: foundItem.quantity + quantityDifference,
              remaining_quantity: foundItem.quantity + quantityDifference,
            },
          });
        })
      );

      // Update the vendor's purchase and payment dates
      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const payment_day = addDays(new Date(bill_date), vendor ? vendor.payment_duration : 0);

      const updatedVendor = vendor ? await prisma.vendors.update({
        where: { vendor_id: vendor.vendor_id },
        data: {
          last_purchase_date: updatedBill.bill_date,
          next_payment_date: payment_day,
          last_paid: updatedBill.bill_date,
        },
      }) : null;

      return {
        bill: updatedBill,
        vendor: updatedVendor,
        vendor_name: updatedVendor ? updatedVendor.vendor_name : "N/A",
        TDS: TDS,
      };
    });

    return res
      .status(200)
      .json({ message: "Successfully updated bill", result });
  } catch (error) {
    console.error("Error:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error!" });
    }
  }
};

module.exports = {
  addBill,
  getBill,
  updateBill,
  getBillById,
  approveBill,
};
