// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

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

module.exports = router;