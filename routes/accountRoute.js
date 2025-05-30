// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route to build account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Route to build the Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build the Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to handle registration POST
router.post(
  '/register',
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

// Update account type (for admin users)
router.post("/update-type", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(accountController.updateAccountType))

// Route to build the account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))

// Route to process the account update
router.post(
  "/update", 
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

// Route to process password change
router.post(
  "/update-password", 
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordData, 
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;
