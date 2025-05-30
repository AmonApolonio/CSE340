const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Process logout request
* *************************************** */
async function accountLogout(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You've been logged out.")
  return res.redirect("/")
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  
  // Make sure logged in account matches the requested account_id
  if (res.locals.accountData.account_id !== account_id) {
    req.flash("notice", "You are not authorized to update this account.")
    return res.redirect("/account/")
  }
  
  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: account_id,
    account_firstname: res.locals.accountData.account_firstname,
    account_lastname: res.locals.accountData.account_lastname,
    account_email: res.locals.accountData.account_email
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  
  // Make sure logged in account matches the requested account_id
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "You are not authorized to update this account.")
    return res.redirect("/account/")
  }
  
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )
  
  if (updateResult) {
    // Update the JWT with the new data
    const accountData = {
      account_id: updateResult.account_id,
      account_firstname: updateResult.account_firstname,
      account_lastname: updateResult.account_lastname,
      account_email: updateResult.account_email,
      account_type: updateResult.account_type
    }
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash(
      "notice",
      `Congratulations, your information has been updated.`
    )
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
*  Update Account Type
* *************************************** */
async function updateAccountType(req, res, next) {
  const { account_id, account_type } = req.body
  const result = await accountModel.updateAccountType(account_id, account_type)
  if (result) {
    // Clear JWT cookie to force a logout so permissions are reloaded
    res.clearCookie("jwt")
    req.flash("notice", "Account type updated successfully. Please log in again for the changes to take effect.")
    return res.redirect("/account/login")
  } else {
    req.flash("notice", "Update failed.")
    return res.redirect("/account/")
  }
}

/* ****************************************
*  Process password change
* *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password, account_password_confirm } = req.body
  
  // Make sure logged in account matches the requested account_id
  if (res.locals.accountData.account_id !== parseInt(account_id)) {
    req.flash("notice", "You are not authorized to update this account.")
    return res.redirect("/account/")
  }
  
  // Check if passwords match
  if (account_password !== account_password_confirm) {
    req.flash("notice", "Passwords do not match.")
    return res.redirect(`/account/update/${account_id}`)
  }
  
  // Hash the password
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "There was an error processing your request.")
    return res.status(500).redirect(`/account/update/${account_id}`)
  }
  
  // Update the password
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)
  
  if (updateResult) {
    req.flash("notice", "Password has been successfully updated.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    return res.redirect(`/account/update/${account_id}`)
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  accountLogout, 
  buildAccountManagement, 
  buildAccountUpdate,
  updateAccount,
  updateAccountType,
  updatePassword 
}