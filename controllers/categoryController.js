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
      return res.status(400).json({ error: "Please provide the category name!" });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { category_name },
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists!" });
    }

    const addData = await prisma.category.create({
      data: { category_name },
    });

    return res.status(201).json({ message: "Successfully added the category", addData });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add the category!" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const cate_id = req.params.id;
    const deleteData = await prisma.category.delete({
      where: {
        category_id: Number(cate_id),
      },
    });
    return res.status(201).json({ message: "Successfully Deleted the category!" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete the category!" });
  }
};

module.exports = {
  addCategory,
  getCategories,
  deleteCategory,
};
