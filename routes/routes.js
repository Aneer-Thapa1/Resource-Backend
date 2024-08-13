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
const featureController = require("../controllers/featureContoller");
const NotiController = require("../controllers/notificationController");
const messageController = require("../controllers/messagesController");
const departmentController = require("../controllers/departmentController");


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
// router.get("/bill", billController.getBill);
// router.get("/singleBill/:bill_id", billController.getBillById);
// router.put("/updateBill/:id", authMiddleware(), billController.updateBill);

// Request routes
router.post("/addRequest", authMiddleware(), requestController.sentRequest);
router.get("/request", authMiddleware(), requestController.getRequest);
router.put("/returnRequest/:id", requestController.returnItem);
router.put("/approveRequest/:id", requestController.approveRequest);

// role User routes
router.post("/role/addUser", userController.addUser);
router.get("/role/allUsers", userController.getUser);
router.put("/role/activateUser/:id", userController.setActiveUser);


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

//department
router.post("/addDepartment", departmentController.addDepartment);
router.get("/getDepartment", departmentController.getDepartment);


module.exports = router;
