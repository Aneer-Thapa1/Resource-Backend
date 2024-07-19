const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const vendorController = require("../controllers/vendorController");
const itemController = require("../controllers/itemController");
const categoryController = require("../controllers/categoryController");
const itemCategoryController = require("../controllers/itemCategoryController");
const productCategoryController = require("../controllers/productCategoryController");
const billController = require("../controllers/billController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const requestController = require("../controllers/requestController");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// logout route
router.post("/logout", authController.logout);
// Add vendor route
router.post(
  "/addVendor",
  authMiddleware(),
  adminMiddleware,
  vendorController.addVendor
);

// Delete vendor route
router.delete("/deleteVendor/:id", vendorController.deleteVendor);

//Fetch all vendor
router.get("/vendor", authMiddleware(), vendorController.getAllVendors);

//add item route
router.post("/addItem", itemController.addItem);

router.get("/vendor/:vat", vendorController.getVendorsByVAT);

//update vendor
router.put("/updateVendor/:id", vendorController.updateVendor);

// set blacklist to a vendor
router.put("/blacklist/:id", vendorController.balckListVendor);

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

//delete itemCategoey

router.delete(
  "/deleteItemCategory/:id",
  itemCategoryController.deleteItemCategory
);
//get  productCategoey

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

router.get("/bill", billController.getBill);

router.get("/singleBill/:bill_id", billController.getBillById);

router.put("/updateBill/:id", billController.updateBill);
router.post("/addRequest", authMiddleware(), requestController.sentRequest);
router.get("/request", authMiddleware(), requestController.getRequest);

module.exports = router;
