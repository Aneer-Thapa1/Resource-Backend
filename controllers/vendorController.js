const db = require("../config/dbConfig");

const addVendor = (req, res) => {
  const [vendorName, vendorOwner, vendorContact] = req.body;

  const vendor = {
    vendorName: vendorName,
    vendorOwner: vendorOwner,
    vendorContact: vendorContact,
  };

  const addVendorQuery = "INSERT INTO vendors values ?,?,?;";

  db.query(addVendorQuery, vendor, (error, result) => {
    if (error) {
      return res.json({ error: "Failed adding vendor!" });
    } else {
      return res.json({ message: "Vendor added successfully!" });
    }
  });
};

const deleteVendor = (req, res) => {
  const [vendorId] = req.body;

  const deleteVendorQuery = "DELETE FROM vendors WHERE vendorId = ? ";

  db.query(deleteVendorQuery, vendorId, (error, result) => {
    if (error) {
      return res.json({ error: "Error Deleting Vendor" });
    } else {
      return res.json({ message: "Deleting vendor successful" });
    }
  });
};

module.exports = {
  deleteVendor,
  addVendor,
};
