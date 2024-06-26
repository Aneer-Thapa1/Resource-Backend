const db = require("../config/dbConfig");

// createing the vendor
const addVendor = (req, res) => {
  const { vendor_name, vendor_owner, vendor_contact } = req.body;
  if (!vendor_name || !vendor_owner || !vendor_contact) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }

  const vendorData = {
    vendor_name: vendor_name,
    vendor_number: vendor_number,
    vat_number: vat_number,
    category: category,
  };
  const addVendorQuery = "INSERT INTO vendors SET ?";
  db.query(addVendorQuery, vendorData, (error, result) => {

    if (result) {
      return res.status(201).json({ message: "Vendor added successfully!" });
    } else { 
      console.log(error);
      return res.status(500).json({ error: "Failed adding vendor!" });
    }
  });

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
      return res.status(200).json({message:"successfully updated the vendors."});
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Error updating vendor" });
  }
};



const getAllVendors = (req, res) => {
  const getAllVendorsQuery = "SELECT * FROM vendors";
  db.query(getAllVendorsQuery, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Error Fetching Vendors" });
    } else {
      return res.status(200).json(result);
    }
  });
};
//get Vendor by Id
const getVendorsById = (req, res) => {
  const vendorId = req.params.id;
  const getVendorsByIdQuery = "SELECT * FROM vendors WHERE vendor_id = ?";
  db.query(getVendorsByIdQuery, [vendorId], (error, result) => {
    if (error) {
      console.error("Error fetching vendor by ID:", error);
      return res.status(500).json({ error: "Error Fetching Vendor by ID" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    return res.status(200).json(result[0]);
  });
};

//Delete Vendor
const deleteVendor = (req, res) => {
  const vendorId = req.params.id;
  const deleteVendorQuery = "DELETE FROM vendors WHERE vendor_id = ?";
  db.query(deleteVendorQuery, [vendorId], (error, result) => {
    if (error) {
      console.error("Error deleting vendor:", error);
      return res.status(500).json({ error: "Error Deleting Vendor" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    return res.status(200).json({ message: "Deleting vendor successful" });
  });
};

module.exports = {
  addVendor,
  getAllVendors,
  deleteVendor,
  getVendorsById,
  updateVendor,
};


