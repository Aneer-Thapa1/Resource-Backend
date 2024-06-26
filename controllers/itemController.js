const db = require("../config/dbConfig");

// createing the vendor
const addItem = (req, res) => {
  const { item_name, category, item_category, measuring_unit } = req.body;

  if (!item_name || !category || !item_category || !measuring_unit) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }

  const itemData = {
    item_name: item_name,
    category: category,
    item_category: item_category,
    measuring_unit: measuring_unit,
  };

  const addVendorQuery = "INSERT INTO items SET ? ";

  try {
    db.query(addVendorQuery, itemData, (error, result) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed adding vendor!" });
      } else {
        return res.status(201).json({ message: "Item added successfully!" });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addItem,
};
