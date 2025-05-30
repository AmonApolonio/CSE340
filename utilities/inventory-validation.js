const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.newInventoryRules = () => {
  return [
    // classification_id is required
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification is required."),

    // make is required and must be string
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Make is required."),

    // model is required and must be string
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Model is required."),
      
    // year is required, must be between 1900 and 2099
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 1900, max: 2099 })
      .withMessage("Year must be between 1900 and 2099."),
      
    // description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),
  // image path is required
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),
      
    // thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
      
    // price is required and must be a positive number
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric({ min: 0 })
      .withMessage("Price must be a positive number."),
      
    // miles is required and must be a positive number
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
      
    // color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Color is required.")
  ]
}

/* ******************************
 * Check inventory data and return errors or continue to add inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    
    let displayImage = inv_image
    let displayThumbnail = inv_thumbnail
    
    if (inv_image && inv_image.includes('&#x2F;')) {
      displayImage = inv_image.replace(/&#x2F;/g, '/')
    }
    
    if (inv_thumbnail && inv_thumbnail.includes('&#x2F;')) {
      displayThumbnail = inv_thumbnail.replace(/&#x2F;/g, '/')
    }
    
    res.render("./inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year, 
      inv_description,
      inv_image: displayImage,
      inv_thumbnail: displayThumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

/* ******************************
 * Check update data and return errors or continue to edit inventory view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    let displayImage = inv_image
    let displayThumbnail = inv_thumbnail
    
    if (inv_image && inv_image.includes('&#x2F;')) {
      displayImage = inv_image.replace(/&#x2F;/g, '/')
    }
    
    if (inv_thumbnail && inv_thumbnail.includes('&#x2F;')) {
      displayThumbnail = inv_thumbnail.replace(/&#x2F;/g, '/')
    }
    
    res.render("./inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_year, 
      inv_description,
      inv_image: displayImage,
      inv_thumbnail: displayThumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

module.exports = validate
