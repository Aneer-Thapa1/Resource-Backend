const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const vendorController = require("../controllers/vendorController");
const itemController = require("../controllers/itemController");
const categoryController = require("../controllers/categoryController");
const itemCategoryController = require("../controllers/itemCategoryController");
const productCategoryController = require("../controllers/productCategoryController");
const billController = require("../controllers/billController");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// logout route
router.post("/logout", authController.logout);

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
router.put("/updateVendor/:id", vendorController.updateVendor);

//fetch items
router.get("/items", itemController.getItems);

//items by id
router.get("/items/:id", itemController.getItemsById);

//update items
router.put("/updateItem/:id", itemController.updateItem);

//detele item
router.delete("/deleteItem/:id", itemController.deleteItem);

router.get("/category", categoryController.getCategories);

router.post("/addCategory", categoryController.addCategory);

router.delete("/deleteCategory/:id", categoryController.deleteCategory);

//add Item Category
router.post("/addItemCategory", itemCategoryController.addItemCategory);

//fetch itemCategoey
router.get("/itemCategory", itemCategoryController.getItemCategory);

router.delete(
  "/deleteItemCategory/:id",
  itemCategoryController.deleteItemCategory
);

router.get("/productCategory", productCategoryController.getProductCategory);

router.post(
  "/addProductCategory",
  productCategoryController.addProductCategory
);

router.delete(
  "/deleteProductCategory/:id",
  productCategoryController.deleteProductCategory
);

router.post("/addBill", billController.addBill);

router.get("/bill",billController.getBill);

router.put("/updateBill/:id", billController.updateBill);

module.exports = router;
