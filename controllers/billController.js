const prisma = require("../prismaClient");

const addBill = async (req, res) => {
  try {
    const {
      bill_no,
      bill_amount,
      TDS,
      bill_date,
      invoice_no,
      paid_amount,
      vat_number,
      bill_type,
      items // Expecting an array of items
    } = req.body;

    const vendor = await prisma.vendors.findFirst({ where: { vat_number } });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Fetch item_id for each item in the items array based on item_name
    const billItems = await Promise.all(
      items.map(async (item) => {
        const foundItem = await prisma.items.findFirst({ where: { item_name: item.item_name } });
        
        if (!foundItem) {
          throw new Error(`Item ${item.item_name} not found`);
        }

        return {
          item: { connect: { item_id: foundItem.item_id } },
          quantity: item.quantity,
          unit_price: item.unit_price,
        };
      })
    );
  
    //VAT
    if(bill_type == 'VAT'){
      console.log('vat');
    }

    // Create the bill and link multiple items
    const bill = await prisma.bills.create({
      data: {
        bill_no,
        bill_amount,
        TDS,
        bill_date: new Date(bill_date),
        invoice_no,
        paid_amount,
        vendors: { connect: { vendor_id: vendor.vendor_id } }, // Assuming vendor_id is the primary key
        BillItems: {
          create: billItems
        }
      },
      include: {
        BillItems: {
          include: {
            item: true
          }
        }
      }
    });

    return res.status(200).json({ message: "Successfully bill added!", bill });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal Server Error!" });
  }
};

module.exports = {
  addBill
};
