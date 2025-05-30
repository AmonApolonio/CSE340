// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build vehicle detail view
router.get("/detail/:invId", invController.buildDetailByInvId);

// Route to build inventory management view
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
// Route to handle add classification POST
router.post("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addClassification));

// Route to build add inventory view
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));
// Route to handle add inventory POST
router.post("/add-inventory",
  utilities.checkLogin, 
  utilities.checkAccountType,
  invValidate.newInventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory));

// Route to get inventory data as JSON
router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Route to build edit inventory view
router.get("/edit/:inventory_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildEditInventory));
// Route to handle update inventory POST
router.post("/update", 
  utilities.checkLogin,
  utilities.checkAccountType,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory));

// Route to build delete confirmation view
router.get("/delete/:inventory_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteView));
// Route to handle delete inventory POST
router.post("/delete", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

module.exports = router;