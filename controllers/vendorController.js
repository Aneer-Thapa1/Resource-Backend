const prisma = require("../prismaClient");
const addVendor = async (req, res) => {
  const {
    vendor_name,
    vat_number,
    vendor_contact,
    vendor_profile,
    payment_duration,
    categories,
  } = req.body;


  if (!vendor_name || !vat_number || !vendor_contact) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }

  const existingVAT = await prisma.vendors.findFirst({
    where: {
      vat_number: vat_number,
    },
  });

  if (existingVAT) {
    return res.status(300).json({ message: "VAT Number already exists!" });
  }

  try {
    const checkCategory = await Promise.all(
      JSON.parse(categories).map((category) =>
        prisma.itemCategory.findFirst({
          where: {
            item_category_id: category.item_category_id,
          },
        })
      )
    );

    if (checkCategory.includes(null)) {
      return res
        .status(404)
        .json({ error: "One or more categories not found!" });
    }

    const vendorData = await prisma.vendors.create({
      data: {
        vendor_name,
        vat_number,
        vendor_profile,
        vendor_contact: vendor_contact,
        payment_duration: parseInt(payment_duration),
        vendorCategory: {
          create: JSON.parse(categories).map((category) => ({
            category: {
              connect: { item_category_id: category.item_category_id },
            },
          })),
        },
      },
    });

    return res
      .status(201)
      .json({ message: "New Vendor added successfully!", vendorData });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return res.status(500).json({ error: "Failed to add the vendor!" });
  }
};

//update vendor
const updateVendor = async (req, res) => {
  const {
    vendor_name,
    vat_number,
    vendor_contact,
    payment_duration,
    vendor_profile,
    vendorCategory,
  } = req.body;

  try {
    const vendor_id = Number(req.params.id);

    // Check if vendor categories exist
    const checkCategory = await Promise.all(
      vendorCategory.map((category) =>
        prisma.itemCategory.findFirst({
          where: {
            item_category_id: category.item_category_id,
          },
        })
      )
    );

    if (checkCategory.includes(null)) {
      return res
        .status(404)
        .json({ error: "One or more categories not found!" });
    }

    // Fetch the last payment date for the vendor
    const vendorDetails = await prisma.vendors.findUnique({
      where: { vendor_id },
      select: { last_paid: true },
    });

    // Calculate next payment date based on last paid date and payment duration
    let next_payment_date = null;
    if (vendorDetails?.last_paid) {
      next_payment_date = new Date(vendorDetails.last_paid);
      next_payment_date.setDate(next_payment_date.getDate() + Number(payment_duration));
    }

    // Update vendor details
    const updateData = await prisma.vendors.update({
      where: {
        vendor_id: vendor_id,
      },
      data: {
        vendor_name,
        vat_number,
        vendor_contact,
        payment_duration: Number(payment_duration),
        vendor_profile,
        next_payment_date,
        vendorCategory: {
          deleteMany: { vendor_id },
          create: vendorCategory.map((category) => ({
            category: {
              connect: { item_category_id: category.item_category_id },
            },
          })),
        },
      },
      include: {
        bills: true,
        vendorCategory: {
          include: {
            category: true,
          },
        }
      },
    });

    // Calculate total purchase amount and pending payment for the specific vendor
    const [totalPurchaseAmount, totalPendingAmount] = await Promise.all([
      prisma.$queryRaw`
      SELECT 
        SUM(bi.total_Amount) as total_purchase_amount
      FROM resource.bills b
      JOIN resource.BillItems bi ON b.bill_id = bi.bill_id
      WHERE b.vendor_ID = ${vendor_id}`,

      prisma.$queryRaw`
      SELECT 
        SUM(b.left_amount) as total_pending_amount 
      FROM resource.bills b
      WHERE b.vendor_ID = ${vendor_id}`,
    ]);

    // Respond with vendor details and calculated totals
    return res.status(200).json({
      ...updateData,
      vendorCategory: updateData.vendorCategory.map(vc => ({
        item_category_id: vc.category.item_category_id,
        item_category_name: vc.category.item_category_name,
      })),
      pending_payment: totalPendingAmount[0]?.total_pending_amount || 0,
      total_amount: totalPurchaseAmount[0]?.total_purchase_amount || 0,
    });

  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Error updating vendor" });
  }
};



//all vendor data
const getAllVendors = async (req, res) => {
  try {
    const getVendor = await prisma.vendors.findMany({
      include: {
        vendorCategory: {
          include: {
            category: true
          }
        }
      }
    });

    const vendorsWithTotalPayment = await Promise.all(
      getVendor.map(async (vendor) => {
        // Query to calculate the total purchase amount
        const specificData = await prisma.$queryRaw`
        SELECT 
          SUM(bi.total_Amount) as total_purchase_amount
        FROM resource.bills b
        JOIN resource.BillItems bi ON b.bill_id = bi.bill_id
        WHERE b.vendor_ID = ${vendor.vendor_id}`;

        // Query to calculate the total pending amount
        const specificPendingData = await prisma.$queryRaw`
        SELECT 
          SUM(b.left_amount) as total_pending_amount 
        FROM resource.bills b
        WHERE b.vendor_ID = ${vendor.vendor_id}`;

        // Query to calculate the total TDS
        const totalTDSData = await prisma.$queryRaw`
        SELECT
          COALESCE(SUM(bi.TDS_deduct_amount), 0) AS total_TDS
        FROM vendors v
        JOIN bills b ON v.vendor_id = b.vendor_ID
        JOIN BillItems bi ON b.bill_id = bi.bill_id
        WHERE v.vendor_id = ${vendor.vendor_id}`;

        return {
          ...vendor,
          pending_payment: specificPendingData[0]?.total_pending_amount || 0,
          total_amount: specificData[0]?.total_purchase_amount || 0,
          TDS: totalTDSData[0]?.total_TDS || 0,
        };
      })
    );

    return res.status(201).json({
      vendor: vendorsWithTotalPayment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const getVendorsByID = async (req, res) => {
  try {
    const vendor_id = req.params.vat;

    // Find vendor by ID
    const VendorById = await prisma.vendors.findUnique({
      where: {
        vendor_id: Number(vendor_id),
      },
      include: {
        bills: true,
        vendorCategory: {

          include: {
            category: true,
          },
        },
      },
    });

    // If vendor is not found
    if (!VendorById) {
      return res.status(404).json({ error: "Vendor not found!" });
    }

    // Calculate total purchase amount and pending payment for the specific vendor
    const [totalPurchaseAmount, totalPendingAmount] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          SUM(bi.total_Amount) as total_purchase_amount
        FROM resource.bills b
        JOIN resource.BillItems bi ON b.bill_id = bi.bill_id
        WHERE b.vendor_ID = ${vendor_id}`,

      prisma.$queryRaw`
        SELECT 
          SUM(b.left_amount) as total_pending_amount 
        FROM resource.bills b
        WHERE b.vendor_ID = ${vendor_id}`,
    ]);

    // Respond with vendor details and calculated totals
    return res.status(200).json({
      ...VendorById,

      vendorCategory: VendorById.vendorCategory.map((vc) => ({
        item_category_id: vc.category.item_category_id,
        item_category_name: vc.category.item_category_name,
      })),
      pending_payment: totalPendingAmount[0]?.total_pending_amount || 0,
      total_amount: totalPurchaseAmount[0]?.total_purchase_amount || 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

//Delete Vendor
const deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    console.log(vendorId);
    // #create# function is used to delete the vendor
    const deleteVendor = await prisma.vendors.delete({
      where: {
        vendor_id: Number(vendorId),
      },
    });
    if (!deleteVendor) {
      return res.status(404).json({ error: "Vendor not found !" });
    }
    return res
      .status(200)
      .json({ message: "Vendor Deleted Successfully !", deleteVendor });
  } catch (error) {
    return res.status(500).json({ error: "vendor failed to detele" });
  }
};

const blacklistVendor = async (req, res) => {
  try {
    const vendor_id = Number(req.params.id);

    const vendorDetails = await prisma.vendors.findFirst({
      where: {
        vendor_id: vendor_id,
      },
    });

    if (!vendorDetails)
      return res.status(401).json({ error: "vendor not found !" });

    const [totalPendingAmount] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          SUM(b.left_amount) as total_pending_amount 
        FROM resource.bills b
        WHERE b.vendor_ID = ${vendor_id}`,
    ]);

    const pending_payment = totalPendingAmount[0]?.total_pending_amount || 0;

    if (pending_payment != 0) {
      return res.status(400).json({
        error: `${vendorDetails.vendor_name} pending amount is not clear!`,
      });
    }

    const blacklistVendor = await prisma.vendors.update({
      where: {
        vendor_id: Number(vendor_id),
      },
      data: {
        black_list: true,
      },
    });

    return res.status(200).json({
      message: `${vendorDetails.vendor_name} has been blacklisted successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const whitelistVendor = async (req, res) => {
  try {
    const vendor_id = Number(req.params.id);

    const vendorDetails = await prisma.vendors.findFirst({
      where: {
        vendor_id: vendor_id,
      },
    });
    if (!vendorDetails)
      return res.status(401).json({ error: "vendor not found !" });

    const checkBlackListed = await prisma.vendors.findFirst({
      where: {
        vendor_id: vendorDetails.vendor_id,
        black_list: true
      },
    });
    if (!checkBlackListed)
      return res.status(401).json({ error: "vendor is not blacklisted!" });



    const whitelistVendor = await prisma.vendors.update({
      where: {
        vendor_id: Number(vendor_id),
      },
      data: {
        black_list: false,
      },
    });

    return res.status(200).json({
      message: `${vendorDetails.vendor_name} has been whitelisted successfully.`,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  addVendor,
  getAllVendors,
  deleteVendor,
  getVendorsByID,
  updateVendor,
  blacklistVendor,
  whitelistVendor,
};
