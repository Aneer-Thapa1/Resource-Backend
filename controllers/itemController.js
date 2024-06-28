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

//funtion for getting the items 
const getItems = async (req,res) => {
  try{
    const getItems = await prisma.items.findMany({});
    return res.status(200).json({getItems});
  }
  catch(error){
    return res.status(500).json({error: "failed to get all the items !"});
  }
}


module.exports = {
  addItem,
  getItems
};
