// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build vehicle detail view
router.get("/detail/:invId", invController.buildDetailByInvId);

// Route to build inventory management view
router.get("/", invController.buildManagement);

// Route to build add classification view
router.get("/add-classification", invController.buildAddClassification);
// Route to handle add classification POST
router.post("/add-classification", invController.addClassification);

// Route to build add inventory view
router.get("/add-inventory", invController.buildAddInventory);
// Route to handle add inventory POST
router.post("/add-inventory", invController.addInventory);

// Route to get inventory data as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

module.exports = router;