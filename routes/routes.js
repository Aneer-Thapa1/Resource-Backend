const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const vendorController = require("../controllers/vendorController");
const itemController = require("../controllers/itemController");
const categoryController = require("../controllers/categoryController");
const itemCategoryController = require("../controllers/itemCategoryController");
const billController = require("../controllers/billController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const requestController = require("../controllers/requestController");
const userController = require("../controllers/userController");
const userPoolController = require("../controllers/userPoolController");
const featureController = require("../controllers/featureContoller");
const NotiController = require("../controllers/notificationController");
const messageController = require("../controllers/messagesController");

// Authentication routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Vendor routes
router.post(
  "/addVendor",
  authMiddleware(),
  adminMiddleware,
  vendorController.addVendor
);
router.delete("/deleteVendor/:id", vendorController.deleteVendor);
router.get("/vendor", authMiddleware(), vendorController.getAllVendors);
router.get("/vendor/:vat", vendorController.getVendorsByID);
router.put("/updateVendor/:id", vendorController.updateVendor);
router.put("/blacklist/:id", vendorController.balckListVendor);

// Item routes
router.post("/addItem", itemController.addItem);
router.get("/items", itemController.getItems);
router.get("/items/:id", itemController.getItemsById);
router.put("/updateItem/:id", itemController.updateItem);
router.delete("/deleteItem/:id", itemController.deleteItem);

// Category routes
router.get("/category", categoryController.getCategories);
router.post("/addCategory", categoryController.addCategory);
router.delete("/deleteCategory/:id", categoryController.deleteCategory);

// Item Category routes
router.post("/addItemCategory", itemCategoryController.addItemCategory);
router.get("/itemCategory", itemCategoryController.getItemCategory);
router.delete(
  "/deleteItemCategory/:id",
  itemCategoryController.deleteItemCategory
);

// Bill routes
router.post("/addBill", billController.addBill);
router.get("/bill", billController.getBill);
router.get("/singleBill/:bill_id", billController.getBillById);
router.put("/updateBill/:id", authMiddleware(), billController.updateBill);

// Request routes
router.post("/addRequest", authMiddleware(), requestController.sentRequest);
router.get("/request", authMiddleware(), requestController.getRequest);
router.put("/returnRequest/:id", requestController.returnItem);

// User routes
router.post("/addUser", userPoolController.addUser);
router.get("/allUsers", userPoolController.getAllUsers);
router.get("/activeUsers/", authMiddleware(), userController.activeUser);
router.post(
  "/setUserActive/:id",
  // authMiddleware(),
  userPoolController.setUserActive
);

// Feature routes
router.post("/addFeature", authMiddleware(), featureController.addFeature);
router.get("/feature", authMiddleware(), featureController.getFeature);
router.delete(
  "/deleteFeature/:id",
  authMiddleware(),
  featureController.deleteFeature
);

// Feature routes
router.get("/notificaiton", authMiddleware(), NotiController.getNotification);
router.put(
  "/updateNotification/:id",
  authMiddleware(),
  NotiController.updateNotification
);
router.put("/updateNotification", NotiController.updateNotification);
router.put("/singleNotification/:id", NotiController.singleUpdateNotification);

//message

router.get("/messages/:id", authMiddleware(), messageController.getMessages);
router.post(
  "/messages/send/:id",
  authMiddleware(),
  messageController.sendMessage
);

//verify otp
router.post("/verifyOTP", userPoolController.verifyOTP);

module.exports = router;
