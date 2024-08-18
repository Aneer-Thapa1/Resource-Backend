const prisma = require("../prismaClient");
const Excel = require("exceljs");
const exportBill = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("bills");
    // const heading = [['bill_no', 'bill_date', 'invoice_no', 'paid_amount', 'left_amount', 'bill_type']];

    sheet.columns = [
      { header: "bill_no", key: "billno", width: 15 },
      { header: "bill_date", key: "billdate", width: 15 },
      { header: "invoice_no", key: "invoiceno", width: 15 },
      { header: "paid_amount", key: "paidamount", width: 15 },
      { header: "left_amount", key: "leftamount", width: 15 },
      { header: "bill_type", key: "billtype", width: 15 },
    ];

    // Style the header row
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "a2d2ff" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const data = await prisma.bills.findMany({});
    await data.map((value) => {
      sheet.addRow({
        billno: value.bill_no,
        billdate: value.bill_date,
        invoiceno: value.invoice_no,
        paidamount: value.paid_amount,
        leftamount: value.left_amount,
        billtype: value.bill_type,
      });
    });

    // Set the headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="bills.xlsx"');
    // Write the workbook to the response
    await workbook.xlsx.write(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error exporting bills");
  }
};

const exportItems = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("items");
    // const heading = [['bill_no', 'bill_date', 'invoice_no', 'paid_amount', 'left_amount', 'bill_type']];

    sheet.columns = [
      { header: "item_id", key: "itemid", width: 15 },
      { header: "item_name", key: "itemname", width: 15 },
      { header: "measuring_unit", key: "measuringUnit", width: 15 },
      { header: "quantity", key: "quantity", width: 15 },
      { header: "unit_price", key: "unitPrice", width: 15 },
      { header: "recent_purchase", key: "recent_purchase", width: 15 },
    ];

    // Style the header row
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "a2d2ff" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const data = await prisma.items.findMany({});
    await data.map((value) => {
      sheet.addRow({
        itemid: value.item_id,
        itemname: value.item_name,
        measuringUnit: value.measuring_unit,
        quantity: value.quantity,
        unitPrice: value.unit_price,
        recent_purchase: value.recent_purchase,
      });
    });

    // Set the headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="items.xlsx"');
    // Write the workbook to the response
    await workbook.xlsx.write(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error exporting items");
  }
};

const exportVendors = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("vendors");
    // const heading = [['bill_no', 'bill_date', 'invoice_no', 'paid_amount', 'left_amount', 'bill_type']];

    sheet.columns = [
      { header: "vendor_name", key: "vendorname", width: 25 },
      { header: "vat_number", key: "vatnumber", width: 25 },
      { header: "vendor_contact", key: "vendorcontact", width: 25 },
      { header: "last_purchase_date", key: "lastpurchasedate", width: 25 },
      { header: "last_paid", key: "lastpaid", width: 25 },
      { header: "payment_duration", key: "paymentduration", width: 25 },
      { header: "next_payment_date", key: "nextpaymentdate", width: 25 }
    ];

    // Style the header row
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "a2d2ff" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const data = await prisma.vendors.findMany({});
    await data.map((value) => {
      sheet.addRow({
        vendorname: value.vendor_name,
        vatnumber: value.vat_number,
        vendorcontact: value.vendor_contact,
        lastpurchasedate: value.last_purchase_date,
        lastpaid: value.last_paid,
        paymentduration: value.payment_duration,
        nextpaymentdate: value.next_payment_date
      });
    });

    // Set the headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="vendors.xlsx"');
    // Write the workbook to the response
    await workbook.xlsx.write(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error exporting bills");
  }
};

module.exports = {
  exportBill,
  exportItems,
  exportVendors,
};
