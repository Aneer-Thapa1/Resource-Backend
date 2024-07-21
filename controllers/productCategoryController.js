const prisma = require("../prismaClient");

const addProductCategory = async (req, res) => {
  try {
    const { product_category_name } = req.body;
    if (!product_category_name) {
      return res.status(501).json({ error: "provide the necessary data!" });  
    }

    const existingProductCategory = await prisma.productCategory.findUnique({
      where: { product_category_name },
    });
    //uppercase
    if (existingProductCategory) {
      const upperCategory = product_category_name.toUpperCase();
      const upperExistingCategory =
      existingProductCategory.product_category_name.toUpperCase();

      if (upperExistingCategory === upperCategory) {
        return res.status(400).json({ error: "Product category already exists!" });
      }
    }
    const addProdCategory = await prisma.productCategory.create({
      data: {
        product_category_name: product_category_name,
      },
    });
    return res.status(201).json({
      message: "Successfully added the productCategory !",
      addProdCategory,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .json({ error: "Failed to add the product category !" });
  }
};

const getProductCategory = async (req, res) => {
  try {
    const allData = await prisma.productCategory.findMany({
      include: { items: true },
    });
    return res.status(200).json({ allData });
  } catch (error) {
    return res
      .status(501)
      .json({ error: "Failed to get the productCategory !" });
  }
};

const deleteProductCategory = async (req, res) => {
  try {
    const delete_id = req.params.id;
    const deleteProCategory = await prisma.productCategory.delete({
      where: {
        product_category_id: Number(delete_id),
      },
    });
    return res
      .status(200)
      .json({ message: "successfully deleted the product category !" });
  } catch (error) {
    return res
      .status(501)
      .json({ error: "Failed to delete the product category !" });
  }
};

module.exports = {
  addProductCategory,
  getProductCategory,
  deleteProductCategory,
};
