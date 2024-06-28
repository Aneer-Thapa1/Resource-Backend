const db = require("../config/dbConfig");
const prisma = require("../prismaClient");

// createing the vendor
const addVendor = async (req, res) => {
  const { vendor_name, vat_number, vendor_contact } = req.body;
  if (!vendor_name || !vat_number || !vendor_contact) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }
  try {
    const vendorData = await prisma.vendors.create({
      data: req.body,
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
  const vendor_id = req.params.id;
  const {
    vendor_name,
    vat_number,
    vendor_number,
    category,
    total_payment,
    pending_payment,
    last_purchase_date,
    last_paid,
    payment_duration,
    next_payment_date,
  } = req.body;

  try {
    // Update the vendor in the database
    const query = `
      UPDATE vendors
      SET vendor_name = ?, vat_number = ?, vendor_number = ?, category = ?, total_payment = ?, pending_payment = ?, last_purchase_date = ?, last_paid = ?, payment_duration = ?, next_payment_date = ?
      WHERE vendor_id = ?`;

    const values = [
      vendor_name,
      vat_number,
      vendor_number,
      category,
      total_payment,
      pending_payment,
      last_purchase_date,
      last_paid,
      payment_duration,
      next_payment_date,
      vendor_id,
    ];
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error updating vendor:", err);
        return res.status(500).json({ error: "Error updating vendor" });
      }

      // Check if any rows were affected
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Vendor not found!" });
      }

      // Return success response with updated vendor information
      return res
        .status(200)
        .json({ message: "successfully updated the vendors." });
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Error updating vendor" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const getVendor = await prisma.vendors.findMany({});
    return res.status(201).json({ getVendor });
  } catch (error) {
    return res.status(500).json({ error: "failed to get all vendors!" });
  }
};

//get by ID
const getVendorsById = async (req, res) => {
  try {
    const vendor_id = req.params.id;
    const VendorById = await prisma.vendors.findUnique({
      where: {
        vendor_id: Number(vendor_id),
      },
    });
    if (!VendorById) {
      return res.status(404).json({ error: "Vendor not found !" });
    }
    return res.status(200).json({ VendorById });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch vendor by id" });
  }
};

//Delete Vendor
const deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    console.log(vendorId);
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

module.exports = {
  addVendor,
  getAllVendors,
  deleteVendor,
  getVendorsById,
  updateVendor,
};
