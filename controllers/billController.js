const prisma = require("../prismaClient");
const {
  vatCalculationHandler,
  panCalculationHandler,
  noBillCalculation,
  tdsCalculation,
  vatCalculation,
} = require("../controllers/billMethods/billCalculationMethods");

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
      vat_number,
      bill_type,
      items,
      TDS,
    } = req.body;

    const existingBill = await prisma.bills.findUnique({
      where: { bill_no },
    });

    if (existingBill) {
      return res
        .status(400)
        .json({ error: "Bill with this number already exists" });
    }

    const vendor = await prisma.vendors.findFirst({ where: { vat_number } });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const item = await prisma.items.findFirst({
      where: {
        OR: items.map((item) => ({
          item_name: item.item_name,
        })),
      },
    });

    if (!item) {
      return res.status(400).json({ error: "Item not found !" });
    }

    // Loop through each item in the request body to process them
    const billItems = await Promise.all(
      items.map(async (item) => {
        const foundItem = await prisma.items.findFirst({
          where: { item_name: item.item_name },
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

        const vatAmount =
          bill_type === "VAT" ? vatCalculation(total_amount, 0.13) : 0;

        return {
          item: { connect: { item_id: foundItem.item_id } },
          quantity: item.quantity,
          unit_price: item.unit_price,
          TDS_deduct_amount: tdsDeductAmount,
          withVATAmount: vatAmount,
          TDS: TDS,
        };
      })
    );

    // Determine the appropriate calculation method based on the bill type
    const calculationMethod = billCalculationMethods[bill_type];

    if (typeof calculationMethod !== "function") {
      return res.status(400).json({ error: "Invalid bill type" });
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

      const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const payment_day = addDays(new Date(bill_date), vendor.payment_duration);

      const updateVendor = await prisma.vendors.update({
        where: {
          vendor_id: bill.vendor_ID,
        },
        data: {
          last_purchase_date: bill.bill_date,
          next_payment_date: payment_day,
          last_paid: bill.bill_date,
        },
      });

      // Loop through each item to update their quantity and recent purchase date
      const updateItems = await Promise.all(
        items.map(async (item) => {
          const foundItem = await prisma.items.findFirst({
            where: { item_name: item.item_name },
          });

          if (!foundItem) {
           return res.status(400).json({error:`Item ${item.item_name} not found for update`});
          }

          return prisma.items.update({
            where: {
              item_id: foundItem.item_id,
            },
            data: {
              recent_purchase: bill.bill_date,
              unit_price: item.unit_price,
              quantity: foundItem.quantity + item.quantity,
            },
          });
        })
      );

      return { bill, updateVendor, updateItems };
    });

    return res
      .status(200)
      .json({ message: "Successfully added bill", result });
  } catch (error) {
    console.log("Error:", error.message);

    // If the headers haven't been sent yet, return an internal server error response
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error!" });
    }
  }
};

const getBill = async (req, res) => {
  try {
    const result = await prisma.bills.findMany({
      include: {
        vendors: true,
        BillItems: true
      },
    });

    return res.status(200).json({ bill:result });
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};


const getBillById = async (req,res)=>{
  try {
    const bill_id = req.params.id;
    const billData = await prisma.bills.findFirst({
      where:{
        id: bill_id
      },
      include:{
        BillItems:true
      }
    })
    return res.status(200).json({ bill:billData });
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
}

module.exports = {
  addBill,
  getBill,
  getBillById
};
