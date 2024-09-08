const prisma = require("../prismaClient");

const getCategories = async (req, res) => {
  try {
    const category = await prisma.category.findMany({
      include: { items: true },
    });
    return res.status(201).json({ category });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch the items!" });
  }
};

const addCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) {
      return res
        .status(400)
        .json({ error: "Please provide the category name!" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { category_name },
    });

    if (existingCategory) {
      const upperCategory = category_name.toUpperCase();
      const upperExistingCategory =
        existingCategory.category_name.toUpperCase();

      if (upperExistingCategory === upperCategory) {
        return res.status(400).json({ error: "Category already exists!" });
      }
    }

    const addData = await prisma.category.create({
      data: {
        category_name: category_name,
      },
    });

    return res
      .status(201)
      .json({ message: "Successfully added the category", addData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to add the category!" });
  }
};

const editCategory = async (req, res) => {
  try {
    const { type, name } = req.body;
   
    const id = Number(req.params.id);

    if (type === "category") {
      const category = await prisma.category.findFirst({
        where: {
          category_id: id,
        },
      });

      if (!category)
        return res.status(400).json({ error: "Category not found" });

      const data = await prisma.category.update({
        where: {
          category_id: parseInt(id),
        },
        data: {
          category_name: name,
        },
      });
      return res
        .status(200)
        .json({ message: "category updated successfully !" });
    } else if (type == "ItemCategory") {
      const itemCategory = await prisma.itemCategory.findFirst({
        where: {
          item_category_id: parseInt(id),
        },
      });

      if (!itemCategory)
        return res.status(400).json({ error: " Item Category not found" });

      const data = await prisma.itemCategory.update({
        where: {
          item_category_id: id,
        },
        data: {
          item_category_name: name,
        },
      });
      return res
        .status(200)
        .json({ message: "Item Category updated successfully !" });
    } else if (type == "Feature") {
      const feature = await prisma.feature.findFirst({
        where: {
          feature_id: id,
        },
      });

      if (!feature) return res.status(400).json({ error: "Feature not found" });

      const data = await prisma.feature.update({
        where: {
          feature_id: id,
        },
        data: {
          feature_name: name,
        },
      });
      return res
        .status(200)
        .json({ message: "Feature updated successfully !" });
    } else {
      return res.status(400).json({ error: "invalid Type!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Sever Error!" });
  }
};
module.exports = {
  addCategory,
  getCategories,
  editCategory,
};
