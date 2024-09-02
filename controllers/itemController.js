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

    if (
      !item_name ||
      !measuring_unit ||
      !category ||
      !itemCategory ||
      !features ||
      !low_limit
    ) {
      return res.status(400).json({
        error: "All fields are required !",
      });
    }

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

//get items

const getItems = async (req, res) => {
  try {
    const items = await prisma.items.findMany({
      include: {
        category: true,
        itemCategory: true,
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
        SELECT SUM(bi.total_Amount) as total_purchase_amount
        FROM resource.billItems bi
        JOIN resource.items i
        ON bi.item_id = i.item_id 
        WHERE i.item_id = ${item.item_id}`;

        return {
          ...item,
          stockStatus,
          itemsOnFeatures: featuresObject,
          category: item.category.category_name,
          itemCategory: item.itemCategory.item_category_name,
          total_Amount: specificData[0]?.total_purchase_amount || 0,
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
        BillItems: {
          include: {
            bill: {
              include: {
                vendors: true,
              },
            },
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
    itemData.itemsOnFeatures.forEach(({ feature, value }) => {
      featuresObject[feature.feature_name] = value;
    });

    const specificData = await prisma.$queryRaw`
      SELECT SUM(bi.total_Amount) as total_purchase_amount
      FROM resource.billItems bi
      JOIN resource.items i
      ON bi.item_id = i.item_id 
      WHERE i.item_id = ${itemData.item_id}`;

    const responseData = {
      ...itemData,
      stockStatus,
      itemsOnFeatures: featuresObject,
      category: itemData.category.category_name,
      itemCategory: itemData.itemCategory.item_category_name,
      total_Amount: specificData[0]?.total_purchase_amount || 0,
      BillItems: itemData.BillItems.map((billItem) => ({
        id: billItem.id,
        bill_id: billItem.bill_id,
        item_id: billItem.item_id,
        quantity: billItem.quantity,
        unit_price: billItem.unit_price,
        withVATAmount: billItem.withVATAmount,
        TDS_deduct_amount: billItem.TDS_deduct_amount,
        total_Amount: billItem.total_Amount,
        TDS: billItem.TDS,
        bill_no: billItem.bill.bill_no,
        bill_date: billItem.bill.bill_date,
        bill_type: billItem.bill.bill_type,
        created_At: billItem.bill.created_At,
        vendor_name: billItem.bill.vendors.vendor_name,
        vat_number: billItem.bill.vendors.vat_number,
      })),
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Failed to retrieve item!" });
  }
};
const updateItem = async (req, res) => {
  try {
    const item_id = parseInt(req.params.id);
    const {
      item_name,
      measuring_unit,
      category,
      itemCategory,
      features,
      low_limit,
    } = req.body;

    if (
      !item_name ||
      !measuring_unit ||
      !category ||
      !itemCategory ||
      !features ||
      !low_limit
    ) {
      return res.status(400).json({
        error: "All fields are required!",
      });
    }

    const item = await prisma.items.findUnique({
      where: { item_id },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found!" });
    }

    const categoryRecord = await prisma.category.findUnique({
      where: { category_name: category },
    });

    const itemCategoryRecord = await prisma.itemCategory.findUnique({
      where: { item_category_name: itemCategory },
    });

    if (!categoryRecord || !itemCategoryRecord) {
      return res
        .status(400)
        .json({ error: "Invalid category or item category name!" });
    }

    const featureEntries = Object.entries(features);
    const featureRecords = await Promise.all(
      featureEntries.map(async ([featureKey, featureValue]) => {
        const featureRecord = await prisma.feature.findFirst({
          where: { feature_name: featureKey },
        });

        if (!featureRecord) {
          return res
            .status(400)
            .json({ error: `Feature '${featureKey}' not found!` });
        }
        return { feature: featureRecord, value: featureValue };
      })
    );

    await prisma.itemsOnFeatures.deleteMany({
      where: {
        item_id,
      },
    });

    const updatedItem = await prisma.items.update({
      where: {
        item_id,
      },
      data: {
        item_name,
        measuring_unit,
        category_id: categoryRecord.category_id,
        item_category_id: itemCategoryRecord.item_category_id,
        low_limit: parseInt(low_limit),
        itemsOnFeatures: {
          create: featureRecords.map(({ feature, value }) => ({
            feature: { connect: { feature_id: feature.feature_id } },
            value,
          })),
        },
      },
      include: {
        category: true,
        itemsOnFeatures: {
          include: {
            feature: true,
          },
        },
        itemCategory: true,
      },
    });

    // Creating the featuresObject
    const featuresObject = {};
    updatedItem.itemsOnFeatures.map(({ feature, value }) => {
      featuresObject[feature.feature_name] = value;
    });

    const responseData = {
      item_id: updatedItem.item_id,
      item_name: updatedItem.item_name,
      measuring_unit: updatedItem.measuring_unit,
      low_limit: updatedItem.low_limit,
      category: updatedItem.category.category_name,
      itemCategory: updatedItem.itemCategory.item_category_name,
      itemsOnFeatures: featuresObject,
      message: "Item updated successfully!",
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Internal server error!" });
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

const units = async (req, res) => {
  try {
    const data = await prisma.items.findMany({});
    const measuringUnits = data.map(item => item.measuring_unit);
    const uniqueUnits = [...new Set(measuringUnits)];    
    return res.status(200).json({ measuring_unit: uniqueUnits });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error !" });
  }
}




module.exports = {
  addItem,
  getItemsById,
  getItems,
  updateItem,
  deleteItem,
  units
};
