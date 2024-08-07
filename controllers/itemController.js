const prisma = require("../prismaClient");
const addItem = async (req, res) => {
  try {
    const {
      item_name,
      measuring_unit,
      category,
      itemCategory,
      features,
      low_limit,
    } = req.body;

    const categoryRecord = await prisma.category.findUnique({
      where: { category_name: category },
    });

    const itemCategoryRecord = await prisma.itemCategory.findUnique({
      where: { item_category_name: itemCategory },
    });

    // Validate inputs
    if (!categoryRecord || !itemCategoryRecord || !low_limit || !features) {
      return res
        .status(400)
        .json({ error: "Invalid category or item category name!" });
    }

    // Process features: convert key-value pairs into feature records
    const featureEntries = Object.entries(features); 
    const featureRecords = await Promise.all(
      featureEntries.map(async ([featureKey, featureValue]) => {
        let featureRecord = await prisma.feature.findFirst({
          where: { feature_name: featureKey },
        });

        if (!featureRecord) {
          return res.status(400).json({ error: "item not found!" });
        }
        return { feature: featureRecord, value: featureValue };
      })
    );

    // Create the new item and associate it with the features using the itemsOnFeatures model
    const newItem = await prisma.items.create({
      data: {
        item_name,
        measuring_unit,
        category_id: categoryRecord.category_id,
        item_category_id: itemCategoryRecord.item_category_id,
        low_limit: parseInt(low_limit),
        itemsOnFeatures: {
          create: featureRecords.map(({ feature, value }) => ({
            feature: { connect: { feature_id: feature.feature_id } },
            value: value,
          })),
        },
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
const getItems = async (req, res) => {
  try {
    const items = await prisma.items.findMany({
      include: {
        category: true,
        itemCategory: true,
        bills: true,
        itemsOnFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    const itemWithTotalPayment = await Promise.all(
      items.map(async (item) => {
        const stockStatus =
          item.quantity < item.low_limit ? "Low Stock" : "In Stock";

        const featuresObject = {};
        item.itemsOnFeatures.map(({ feature, value }) => {
          featuresObject[feature.feature_name] = value;
        });

        const specificData = await prisma.$queryRaw`
          SELECT SUM(bills.actual_amount) as total_purchase_amount, 
                 SUM(bills.left_amount) as total_pending_amount 
          FROM resource.bills 
          JOIN resource.items 
          ON bills.item_id = items.item_id 
          WHERE items.item_id = ${item.item_id}`;

        return {
          ...item,
          stockStatus,
          itemsOnFeatures: featuresObject,
          category: item.category.category_name,
          itemCategory: item.itemCategory.item_category_name,
          pending_payment: specificData[0]?.total_pending_amount || 0,
          total_amount: specificData[0]?.total_purchase_amount || 0,
        };
      })
    );

    return res.status(200).json(itemWithTotalPayment);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to retrieve items!" });
  }
};

const getItemsById = async (req, res) => {
  try {
    const item_id = Number(req.params.id);
    const itemData = await prisma.items.findUnique({
      where: {
        item_id,
      },
      include: {
        category: true,
        itemCategory: true,
        bills: {
          include: {
            vendors: true,
          },
        },
        itemsOnFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });
    if (!itemData) {
      return res.status(404).json({ error: "Item not found!" });
    }
    const stockStatus =
      itemData.quantity < itemData.low_limit ? "Low Stock" : "In Stock";

    const featuresObject = {};
    itemData.itemsOnFeatures.map(({ feature, value }) => {
      featuresObject[feature.feature_name] = value;
    });

    const specificData = await prisma.$queryRaw`
      SELECT SUM(bills.actual_amount) as total_purchase_amount, 
             SUM(bills.left_amount) as total_pending_amount 
      FROM resource.bills 
      JOIN resource.items 
      ON bills.item_id = items.item_id 
      WHERE items.item_id = ${item_id}`;

    const responseData = {
      ...itemData,
      stockStatus,
      itemsOnFeatures: featuresObject,
      category: itemData.category.category_name,
      itemCategory: itemData.itemCategory.item_category_name,
      pending_payment: specificData[0]?.total_pending_amount || 0,
      total_amount: specificData[0]?.total_purchase_amount || 0,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to retrieve item!" });
  }
};

//function to update the item data
const updateItem = async (req, res) => {
  try {
    const item_id = req.params.id;
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

//to delete
const deleteItem = async (req, res) => {
  try {
    const item_id = req.params.id;
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
