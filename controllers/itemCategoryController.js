const prisma = require("../prismaClient");

// Function to add a new item category
const addItemCategory = async (req, res) => {
  try {


    // Extract item_category_name from the request body
    const { item_category_name } = req.body;

     // Check if item_category_name is provided
    if (!item_category_name) {
      return res.status(501).json({ error: "Provide the necessary data!" });
    }


    // Check if the item category already exists in the database
    const existingItemCategory = await prisma.itemCategory.findUnique({
      where: { item_category_name },
    });


    // Compare item category names in uppercase to handle case sensitivity
    if (existingItemCategory) {
      const upperCategory = item_category_name.toUpperCase();
      const upperExistingCategory = existingItemCategory.item_category_name.toUpperCase();
      
      if (upperExistingCategory === upperCategory) {
        return res.status(400).json({ error: "Item category already exists!" });
      }
    }
  

    // Create a new item category if it does not exist
    const addData = await prisma.itemCategory.create({
      data: {
        item_category_name: item_category_name,
      },
    });
    return res.status(201).json({ message: "Successfully added the category!", addData });
  } catch (error) {
    console.log(error);
    return res.status(501).json({ error: "Failed to add the item category" });
  }
};

// Function to get all item categories with their associated items

const getItemCategory = async (req, res) => {
  try {
    const allData = await prisma.itemCategory.findMany({
      include: { items: true },
    });
    return res.status(200).json({ allData });
  } catch (error) {
    return res
      .status(501)
      .json({ error: "failed to fetch all itemsCategories !" });
  }
};

const deleteItemCategory = async (req, res) => {
  try {
    const cate_id = req.params.id;
    const deleteData = await prisma.itemCategory.delete({
      where: {
        item_category_id: Number(cate_id),
      },
    });

    // Send success response after deletion
    return res
      .status(200)
      .json({ message: "successfully deleted the item category !" });
  } catch (error) {

     // Return error response if an exception occurs
    return res.status(501).json({ error: "failed to delete the category !" });
  }
};

module.exports = {
  addItemCategory,
  getItemCategory,
  deleteItemCategory,
};
