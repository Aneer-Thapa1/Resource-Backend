const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const vendorController = require("../controllers/vendorController");
const itemController = require("../controllers/itemController");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// Add vendor route
router.post("/addVendor", vendorController.addVendor);

// Delete vendor route
router.delete("/deleteVendor/:id", vendorController.deleteVendor);

//Fetch all vendor
router.get("/getVendor", vendorController.getAllVendors);

//
router.post("/addItem", itemController.addItem);

module.exports = router;
