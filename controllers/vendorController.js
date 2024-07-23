const prisma = require("../prismaClient");

// createing the vendor
const addVendor = async (req, res) => {
  const { vendor_name, vat_number, vendor_contact, payment_duration } =
    req.body;
  if (!vendor_name || !vat_number || !vendor_contact) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields!" });
  }

  const existingVAT = await prisma.vendors.findFirst({
    where: {
      vat_number: vat_number,
    },
  });

  if (existingVAT) {
    return res.status(300).json({ message: "VAT Number already exisit !" });
  }

  try {
    const vendorData = await prisma.vendors.create({
      data: {
        vendor_name,
        vat_number,
        vendor_contact: parseInt(vendor_contact),
        payment_duration: parseInt(payment_duration),
      },
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
  const { vendor_name, vendor_contact, vat_number } = req.body;
  try {
    const vendor_id = req.params.id;
    const updateData = await prisma.vendors.update({
      where: {
        vendor_id: Number(vendor_id),
      },
      data: {
        vendor_name,
        vat_number,
        vendor_contact: parseInt(vendor_contact),
      },
    });
    return res
      .status(201)
      .json({ message: "Vendor update successfully !", updateData });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ error: "Error updating vendor" });
  }
};

const getAllVendors = async (req, res) => {
  try {
    
    const getVendor = await prisma.vendors.findMany({
      include: {
        bills: {
          include: {
            items: true,
          },
        },
      },
    });


      if(req.query.search){
        const searchVendor = getVendor.filter((vendor)=>
          vendor.vendor_name.toLowerCase().includes(req.query.search.toLowerCase())
        );
        return res.status(201).json(searchVendor);
      }
    return res.status(201).json({ vendors: getVendor });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "failed to get all vendors!" });
  }
};

//get by ID
const getVendorsByVAT = async (req, res) => {
  try {
    const vendor_id = req.params.vat;

    const VendorById = await prisma.vendors.findUnique({
      where: {
        vendor_id: Number(vendor_id),
      },
      include: {
        bills: {
          include: {
            items: true,
          },
        },
      },
    });
    //if vendor is not found this condition is called
    if (!VendorById) {
      return res.status(404).json({ error: "Vendor not found !" });
    }
    return res.status(200).json({ VendorById });
  } catch (error) {
    console.log(error);
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

const balckListVendor = async (req, res) => {
  try {
    const vendor_id = req.params.id;
    const balckListVendor = await prisma.vendors.update({
      where: {
        vendor_id: Number(vendor_id),
      },
      data: {
        black_list: true,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addVendor,
  getAllVendors,
  deleteVendor,
  getVendorsByVAT,
  updateVendor,
  balckListVendor,
};
