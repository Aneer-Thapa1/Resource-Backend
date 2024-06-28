const db = require("../config/dbConfig");
const prisma = require("../prismaClient");

// createing the vendor
const addVendor = async (req, res) => {
  const { vendor_name, vat_number, vendor_contact } = req.body;
  if (!vendor_name || !vat_number || !vendor_contact) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }
  try {
    // #create# function is called from the ORM package, it is used to crate the vendor with out the query
    // query is create in the migration file.... 
    const vendorData = await prisma.vendors.create({    
      data: req.body,
    });
    return res
      .status(201)
      .json({ message: "New Vendor added successfully!", vendorData });
  } catch (error) {
    console.error("Error adding vendor:", error);
    return res.status(500).json({ error: "Failed to add the vendor!" });
  }
};

//update vendor
const updateVendor = async (req, res) => {
  try{
  const vendor_id = req.params.id;
    const updateData = await prisma.vendors.update({
      where:{
        vendor_id: Number(vendor_id)
      },
      data: req.body,
    })
    return res.status(201).json({message:"Vendor update successfully !", updateData});
  }catch(error){
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Error updating vendor" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    // #findMany# function is called from the ORM package, it is used to fetch the vendor from the database with out the query
    const getVendor = await prisma.vendors.findMany({});
    return res.status(201).json({ getVendor });
  } catch (error) {
    return res.status(500).json({ error: "failed to get all vendors!" });
  }
};

//get by ID
const getVendorsById = async (req, res) => {
  try {
    
    const vendor_id = req.params.id;   //req.paramas.id get the vendor_id fromo the URL  
    // #findUnique#, it is used to fetch the vendor by the id
    const VendorById = await prisma.vendors.findUnique({
      where: {
        vendor_id: Number(vendor_id),
      },
    });

    //if vendor is not found this condition is called    
    if (!VendorById) {
      return res.status(404).json({ error: "Vendor not found !" });
    }
    return res.status(200).json({ VendorById });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch vendor by id" });
  }
};

//Delete Vendor
const deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    console.log(vendorId);
    // #create# function is used to delete the vendor
    const deleteVendor = await prisma.vendors.delete({
      where: {
        vendor_id: Number(vendorId),
      },
    });
    if (!deleteVendor) {
      return res.status(404).json({ error: "Vendor not found !" });
    }
    return res
      .status(200)
      .json({ message: "Vendor Deleted Successfully !", deleteVendor });
  } catch (error) {
    return res.status(500).json({ error: "vendor failed to detele" });
  }
};

module.exports = {
  addVendor,
  getAllVendors,
  deleteVendor,
  getVendorsById,
  updateVendor,
};
