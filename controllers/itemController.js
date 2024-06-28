const prisma = require("../prismaClient");

//adding the vendor
const addItem = async (req, res) => {
  const { item_name, category, item_category, measuring_unit } = req.body;

  if (!item_name || !category || !item_category || !measuring_unit) {
    return res.status(400).json({ error: "Please provide all the required fields!" });
  }
  try {
    const newItem = await prisma.items.create({
      data: req.body,
    });
    return res.status(201).json({ message: "Item added successfully!", newItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed adding item!" });
  }
};

module.exports = {
  addItem,
};
