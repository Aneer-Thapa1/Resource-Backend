const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const vendorController = require("../controllers/vendorController");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// Add vendor route
router.post("/addVendor", vendorController.addVendor);

// Delete vendor route
router.delete("/deleteVendor/:id", vendorController.deleteVendor);

router.get("/getVendor/:id", vendorController.getVendorsById);

//Fatch all vendor
router.get('/allVendor', vendorController.getAllVendors);

module.exports = router;