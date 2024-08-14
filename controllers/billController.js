// addBill.js

// Import the Prisma client and necessary calculation methods
const prisma = require("../prismaClient");
const {
  vatCalculationHandler,
  panCalculationHandler,
  noBillCalculation,
  tdsCalculation,
  vatCalculation,
} = require("../controllers/billMethods/billCalculationMethods");

// Object mapping bill types to their corresponding calculation methods
const billCalculationMethods = {
  VAT: vatCalculationHandler,
  PAN: panCalculationHandler,
  NOBILL: noBillCalculation,
};

// Main function to handle adding a new bill
const addBill = async (req, res) => {
  try {
    // Destructure data from the request body
    const {
      bill_no,
      bill_date,
      invoice_no,
      paid_amount,
      vat_number,
      bill_type,
      items,
    } = req.body;

    // Check if a bill with the same bill_no already exists
    const existingBill = await prisma.bills.findUnique({
      where: { bill_no },
    });

    // If the bill already exists, return an error response
    if (existingBill) {
      return res.status(400).json({ error: "Bill with this number already exists" });
    }

    // Check if the vendor exists in the database
    const vendor = await prisma.vendors.findFirst({ where: { vat_number } });
    
    // If the vendor is not found, return an error response
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    
    // Loop through each item in the request body to process them
    const billItems = await Promise.all(
      items.map(async (item) => {
        // Find the item in the database by its name
        const foundItem = await prisma.items.findFirst({
          where: { item_name: item.item_name },
        });

        // If the item is not found, throw an error
        if (!foundItem) {
          throw new Error(`Item ${item.item_name} not found`);
        }

        // Calculate the total amount for the item based on its price and quantity
        const total_amount = item.unit_price * item.quantity;

        // Initialize the TDS deducted amount
        let tdsDeductAmount = 0;
        try {
          // Calculate the TDS amount based on the total amount, TDS percentage, and bill type
          tdsDeductAmount = tdsCalculation(total_amount, item.TDS, bill_type);
        } catch (error) {
          // If there's an error in TDS calculation, return an error response
          return res.status(400).json({ error: error.message });
        }

        // If the bill type is VAT, calculate the VAT amount
        const vatAmount = (bill_type === "VAT") ? vatCalculation(total_amount, 0.13) : 0;

        // Return the processed item data
        return {
          item: { connect: { item_id: foundItem.item_id } },
          quantity: item.quantity,
          unit_price: item.unit_price,
          TDS_deduct_amount: tdsDeductAmount,
          withVATAmount: vatAmount,
          TDS: item.TDS,
        };
      })
    );

    // Determine the appropriate calculation method based on the bill type
    const calculationMethod = billCalculationMethods[bill_type];

    // If the bill type is invalid, return an error response
    if (typeof calculationMethod !== 'function') {
      return res.status(400).json({ error: "Invalid bill type" });
    }

    // Calculate the total sum amount and pending amount using the selected method
    const { totalSumAmount, pendingAmount } = calculationMethod(billItems, paid_amount, res);

    // If calculation fails, stop further processing
    if (!totalSumAmount && !pendingAmount) {
      return;
    }

    // Create the new bill in the database with the provided and calculated data
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
    // Log the error message
    console.log("Error:", error.message);
    
    // If the headers haven't been sent yet, return an internal server error response
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error!" });
    }
  }
};

module.exports = {
  addBill,
};
