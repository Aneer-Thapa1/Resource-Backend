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

  console.log(categories);

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
  const { vendor_name, vendor_contact, vat_number, categories } = req.body;
  try {
    console.log(categories);
    const vendor_id = Number(req.params.id);

    const checkCategory = await Promise.all(
      categories.map((category) =>
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

    const updateData = await prisma.vendors.update({
      where: {
        vendor_id: vendor_id,
      },
      data: {
        vendor_name,
        vat_number,
        vendor_contact: vendor_contact,
        vendorCategory: {
          deleteMany: { vendor_id },
          create: categories.map((category) => ({
            category: {
              connect: { item_category_id: category.item_category_id },
            },
          })),
        },
      },
    });
    return res
      .status(201)
      .json({ message: "Vendor update successfully !", updateData });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Error updating vendor" });
  }
};
const getAllVendors = async (req, res) => {
  try {
    const getVendor = await prisma.vendors.findMany({});

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

const balckListVendor = async (req, res) => {
  try {
    const vendor_id = req.params.id;
    const balckListVendor = await prisma.vendors.update({
      where: {
        vendor_id: Number(vendor_id),
      },
      data: {
        black_list: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addVendor,
  getAllVendors,
  deleteVendor,
  getVendorsByID,
  updateVendor,
  balckListVendor,
};
