const prisma = require("../prismaClient");

//adding the vendor
const addItem = async (req, res) => {
  try {
    const {
      item_name,
      measuring_unit,
      category,
      itemCategory,
      productCategory,
      low_limit,
    } = req.body;

    //fimd teh product categroy
    const productCategoryRecord = await prisma.productCategory.findUnique({
      where: {
        product_category_name: productCategory,
      },
    });

    // Find the category by name
    const categoryRecord = await prisma.category.findUnique({
      where: { category_name: category },
    });

    // Find the item category by name
    const itemCategoryRecord = await prisma.itemCategory.findUnique({
      where: { item_category_name: itemCategory },
    });

    if (!categoryRecord || !itemCategoryRecord || !productCategoryRecord) {
      return res
        .status(400)
        .json({ error: "Invalid category or item category name!" });
    }

    // Create the new item with the retrieved category and item category IDs
    const newItem = await prisma.items.create({
      data: {
        item_name,
        measuring_unit,
        category_id: categoryRecord.category_id,
        item_category_id: itemCategoryRecord.item_category_id,
        product_category_id: productCategoryRecord.product_category_id,
        low_limit: parseInt("69", 10),
      },
    });

    return res
      .status(201)
      .json({ message: "Item added successfully!", newItem });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed adding item!" });
  }
};

//funtion for getting the items
const getItems = async (req, res) => {
  try {
    const items = await prisma.items.findMany({
      include: {
        category: true,
        itemCategory: true,
        productCategory: true,
      },
    });

    const itemsWithStockStatus = items.map((item) => {
      const stockStatus =
        item.quantity < item.low_limit ? "Low Stock" : "In Stock";
      return { ...item, stockStatus };
    });

    if (req.query.search) {
      const filterItem = itemsWithStockStatus.filter((item) =>
        item.item_name.includes(req.query.search)
      );
      return res.status(201).json({ filterItem });
    }

    console.log(itemsWithStockStatus);
    return res.status(200).json({ items: itemsWithStockStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get all the items!" });
  }
};

//function to get all the items by id
const getItemsById = async (req, res) => {
  try {
    const item_id = req.params.id;
    console.log(item_id);
    const itemData = await prisma.items.findUnique({
      where: {
        item_id: Number(item_id),
      },
    });
    if (!itemData) {
      return res.status(500).json({ error: "Item is not found !" });
    }

    const stockStatus =
      itemData.quantity < itemData.low_limit ? "Low Stock" : "In Stock";
    return res.status(201).json({
      message: "Successfully fetched the item by id!",
      itemData: { ...itemData, stockStatus },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch the items !" });
  }
};

//function to update the item data
const updateItem = async (req, res) => {
  try {
    const item_id = req.params.id;
    console.log(item_id);
    const itemData = await prisma.items.update({
      where: {
        item_id: Number(item_id),
      },
      data: req.body,
    });
    if (!item_id) {
      return res.status(500).json({ error: "Items not found !" });
    }
    return res
      .status(201)
      .json({ message: "Item updated successfully !", itemData });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update the items !" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item_id = req.params.id;
    console.log(item_id);
    const deleteData = await prisma.items.delete({
      where: {
        item_id: Number(item_id),
      },
    });
    return res.status(201).json({ message: "Successfully Deleted the item !" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete items !" });
  }
};

module.exports = {
  addItem,
  getItemsById,
  getItems,
  updateItem,
  deleteItem,
};
