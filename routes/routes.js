const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const vendorController = require("../controllers/vendorController");
const itemController = require("../controllers/itemController");
const prisma = require("../prismaClient");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// Add vendor route
router.post("/addVendor", vendorController.addVendor);

// Delete vendor route
router.delete("/deleteVendor/:id", vendorController.deleteVendor);


//Fetch all vendor
router.get("/vendor", vendorController.getAllVendors);

//add item route
router.post("/addItem", itemController.addItem);

router.get("/vendor/:id", vendorController.getVendorsById);

//update vendor 
router.put('/updateVendor/:id', vendorController.updateVendor);

module.exports = router;