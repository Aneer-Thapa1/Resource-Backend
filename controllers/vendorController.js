const db = require("../config/dbConfig");

// createing the vendor
const addVendor = (req, res) => {
  const { vendor_name, vendor_owner, vendor_contact } = req.body;
  if (!vendor_name || !vendor_owner || !vendor_contact) {
    return res.status(400).json({ error: "Please provide all the required fields!" });
  }
  const addVendorQuery = "INSERT INTO vendors (vendor_name, vendor_owner, vendor_contact) VALUES (?, ?, ?)";
  db.query(addVendorQuery, [vendor_name, vendor_owner, vendor_contact], (error, result) => {
    if (result) {
      return res.status(201).json({ message: "Vendor added successfully!" });
    } else { 
      console.log(error);
      return res.status(500).json({ error: "Failed adding vendor!" });
    }
  });
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

// //update vendor 
// const updateVendor = (req,res)=>{
//   const vendorId = req.params.id;
//   const { name, email, phone } = req.body;
//   const updateVendor = db.query
// }


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
  getAllVendors,
  deleteVendor,
  addVendor,
  getVendorsById
};