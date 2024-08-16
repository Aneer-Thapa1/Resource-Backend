const prisma = require("../prismaClient");
const Excel = require("exceljs");
const exportBill = async (req, res) => {
  try {

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet("bills");
    // const heading = [['bill_no', 'bill_date', 'invoice_no', 'paid_amount', 'left_amount', 'bill_type']];

    sheet.columns = [
      { header: "bill_no", key: "billno", width: 15 ,},
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
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'a2d2ff' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
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
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="bills.xlsx"'
      );
        // Write the workbook to the response
    await workbook.xlsx.write(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Error exporting bills");
  }
};

module.exports = {
  exportBill,
};
