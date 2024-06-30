const prisma = require("../prismaClient");

//adding the vendor
const addItem = async (req, res) => {
  const { item_name, category, item_category, measuring_unit } = req.body;

  if (!item_name || !category || !item_category || !measuring_unit) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }
  try {
    const newItem = await prisma.items.create({
      data: req.body,
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
        categry: true,
      },
    });
    return res.status(200).json({ items });
  } catch (error) {
    console.error(error); // Log the error to the console
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
    if(!itemData){
      return res.status(500).json({error:"Item is not found !"});
    }
    return res
      .status(201)
      .json({ message: "Succeffuly fech the items by id !", itemData });
  } catch (error) {
    return res.status(500).json({ error: "failed to fetch the items !" });
  }
};

//function to update the item data
const updateItem= async (req, res) => {
  try {
    const item_id = req.params.id;
    console.log(item_id);
    const itemData = await prisma.items.update({
      where: {
        item_id: Number(item_id),
      },
      data: req.body,
    });
    if(!item_id){
      return res.status(500).json({error:"Items not found !"});
    }
    return res.status(201).json({message:"Item updated successfully !", itemData});
  } catch (error) {
    return res.status(500).json({ error: "Failed to update the items !" });
  }
};

const deleteItem = async (req, res) => {
 try{
  const item_id = req.params.id;
  console.log(item_id);
  const deleteData = await prisma.items.delete({
    where:{
      item_id: Number(item_id)
    }
  })
  return res.status(201).json({message:"Successfully Deleted the item !"});
 }
 catch(error){
  return res.status(500).json({error:"Failed to delete items !"});
 }

}

module.exports = {
  addItem,
  getItemsById,
  getItems,
  updateItem,
  deleteItem
};
