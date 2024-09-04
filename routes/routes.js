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
const superAdminMiddleware = require("../middleware/superAdminMiddleware");
const requestController = require("../controllers/requestController");
const dashboardController = require("../controllers/dashboardController");
const issueController = require("../controllers/issueController");
const userController = require("../controllers/userController");
const featureController = require("../controllers/featureContoller");
const NotiController = require("../controllers/notificationController");
const messageController = require("../controllers/messagesController");
const departmentController = require("../controllers/departmentController");
const exportToExcel = require("../controllers/exportToExcel");
const forgotPassword = require("../controllers/forgotPassword");

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
router.put("/blacklist/:id", vendorController.blacklistVendor);
router.put("/whitelist/:id", vendorController.whitelistVendor);

// Item routes
router.post("/addItem", itemController.addItem);
router.get("/items", itemController.getItems);
router.get("/items/:id", itemController.getItemsById);
router.put("/updateItem/:id", itemController.updateItem);
router.delete("/deleteItem/:id", itemController.deleteItem);
router.get("/units", itemController.units);

// Category routes
router.get("/category", categoryController.getCategories);
router.post("/addCategory", categoryController.addCategory);
router.put("/editCategory/:id", categoryController.editCategory);

// Item Category routes
router.post("/addItemCategory", itemCategoryController.addItemCategory);
router.get("/itemCategory", itemCategoryController.getItemCategory);

// Bill routes
router.post("/addBill", authMiddleware(), billController.addBill);
router.get("/bill", billController.getBill);
router.get("/singleBill/:bill_id", billController.getBillById);
router.put("/updateBill/:id", authMiddleware(), billController.updateBill);
router.put(
  "/approveBill/:bill_id",
  authMiddleware(),
  superAdminMiddleware,
  billController.approveBill
);
router.put(
  "/declineBill/:bill_id",
  authMiddleware(),
  // superAdminMiddleware,
  billController.declineBill
);

// Request routes
router.post("/addRequest", authMiddleware(), requestController.sentRequest);
router.get("/request", authMiddleware(), requestController.getRequest);
router.get(
  "/requestHistory",
  authMiddleware(),
  requestController.requestHistory
);
router.get(
  "/singleRequest/:id",
  authMiddleware(),
  requestController.singleRequest
);
router.put("/returnRequest/:id", requestController.returnItem);
router.put(
  "/approveRequest/:id",
  authMiddleware(),
  requestController.approveRequest
);
router.put(
  "/deliverRequest/:id",
  // authMiddleware(),
  requestController.deliverRequest
);

// role User routes
router.post("/role/addUser", userController.addUser);
router.get("/role/allUsers", userController.getUser);
router.get("/role/activeUser", userController.NoOfActiveUser);
router.put("/role/activateUser/:user_id", userController.setActiveUser);
router.put("/role/deactivateUser/:user_id", userController.setInActiveUser);
router.put("/role/updateRole/:user_id", userController.updateUserRole);
router.put("/role/editUser/:user_id", userController.editUser);
//change password
router.put("/changePassword", authMiddleware(), userController.changePassword);

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

router.put("/updateNotification",  authMiddleware(), NotiController.updateNotification);
router.put("/singleNotification/:id",authMiddleware(), NotiController.singleUpdateNotification);


//message

router.get("/messages/:id", authMiddleware(), messageController.getMessages);
router.get(
  "/message/allUser",
  authMiddleware(),
  userController.allUserForMessage
);
router.post(
  "/messages/send/:id",
  authMiddleware(),
  messageController.sendMessage
);

//department
router.post("/addDepartment", departmentController.addDepartment);
router.get("/getDepartment", departmentController.getDepartment);
router.put("/editDepartment/:id", departmentController.editDepartment);

//export excel
router.get("/bill/exportBill", exportToExcel.exportBill);
router.get("/bill/exportItem", exportToExcel.exportItems);
router.get("/bill/exportVendor", exportToExcel.exportVendors);

//issue
router.get("/issue", issueController.getIssue);
router.post("/addIssue", authMiddleware(), issueController.addIssue);
router.put("/editIssue/:id", authMiddleware(), issueController.editIssue);

//dashboard
router.get("/dashboard", dashboardController.dashboard);

// forgot password
router.post("/requestOTP", forgotPassword.requestOTP);
router.post("/submitOTP", forgotPassword.checkOTP);
router.post("/changePassword", forgotPassword.changePassword);

module.exports = router;
