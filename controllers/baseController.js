const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    req.flash("notice", "This is a flash message.")
    res.render("index", { title: "Home", nav, errors: null })
  } catch (err) {
    next(err)
  }
}

module.exports = baseController