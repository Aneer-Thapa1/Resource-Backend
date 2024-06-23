const db = require("../config/dbConfig");

// createing the vendor
const addVendor = (req, res) => {
  const { vendor_name, vendor_owner, vendor_contact } = req.body;

  if (!vendor_name || !vendor_owner || !vendor_contact) {
    return res.status(400).json({ error: "Please provide all the required fields!" });
  }
  const addVendorQuery = "INSERT INTO vendors (vendor_name, vendor_owner, vendor_contact) VALUES (?, ?, ?)";
  db.query(addVendorQuery, [vendor_name, vendor_owner, vendor_contact], (error, result) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed adding vendor!" });
    } else { 
      return res.status(201).json({ message: "Vendor added successfully!" });
    }
  });
};
module.exports = {
  addVendor,
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

//fetch vendor by id
const getVendorsById = (req,res)=>{
  const [vendorId] = req.body;
  const getVendorsByIdQuery = "SELECT * FROM vendors WHERE vendorId =?";
  
  db.query(getVendorsById, vendorId, (error, result) =>{
    if(error){
      
    }
  }
)};

//delete vendor
const deleteVendor = (req, res) => {
  const {vendor_id} = req.body;

  const deleteVendorQuery = "DELETE FROM vendors WHERE vendor_id = ? ";

  db.query(deleteVendorQuery, [vendor_id], (error, result) => {
    if (error) {
      return res.status(401).json({ error: "Error Deleting Vendor" });
    } else {
      return res.status(200).json({ message: "Deleting vendor successful" });
    }
  });
};

module.exports = {
  getAllVendors,
  deleteVendor,
  addVendor,
};