const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Build vehicle detail view by inv_id
 * ************************** */
invCont.buildDetailByInvId = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const vehicle = await invModel.getVehicleByInvId(inv_id);
    let nav = await utilities.getNav();
    let vehicleDetail = await utilities.buildVehicleDetail(vehicle);
    if (vehicle) {
      res.render("./inventory/detail", {
        title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
        nav,
        vehicle,
        vehicleDetail,
        errors: null
      });
    } else {
      res.status(404).render("./inventory/detail", { title: "Vehicle Not Found", nav, vehicle: null, vehicleDetail: null, errors: null });
    }
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    
    const classificationList = await utilities.buildClassificationList();
    
    const flash = req.flash();
    let flashMessage = null;
    if (flash && Object.keys(flash).length > 0) {
      const type = Object.keys(flash)[0];
      flashMessage = { message: flash[type][0], type };
    }    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      flash: flashMessage,
      classificationList
    });
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const flash = req.flash();
    let flashMessage = null;
    if (flash && Object.keys(flash).length > 0) {
      const type = Object.keys(flash)[0];
      flashMessage = { message: flash[type][0], type };
    }    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      flash: flashMessage,
      errors: []
    });
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Handle add classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { classification_name } = req.body;
    // Server-side validation: only alphanumeric, no spaces or special chars
    const regex = /^[A-Za-z0-9]+$/;
    let errors = [];
    if (!classification_name || !regex.test(classification_name)) {
      errors.push({ msg: "Classification name must be alphanumeric with no spaces or special characters." });
    }
    const allClassifications = await invModel.getClassifications();
    if (allClassifications && allClassifications.rows.some(row => row.classification_name.toLowerCase() === classification_name.toLowerCase())) {
      errors.push({ msg: "A classification with this name already exists." });
    }
    if (errors.length > 0) {      return res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        flash: null,
        errors
      });
    }
    // Insert into DB
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("message", "Classification added successfully.");
      req.flash("type", "success");
      res.redirect("/inv");
    } else {
      errors.push({ msg: "Failed to add classification. Please try again." });      res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        flash: null,
        errors
      });
    }
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    const flash = req.flash();
    let flashMessage = null;
    if (flash && Object.keys(flash).length > 0) {
      const type = Object.keys(flash)[0];
      flashMessage = { message: flash[type][0], type };
    }    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      flash: flashMessage,
      classificationList,
      errors: [],
      sticky: {}
    });
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Handle add inventory POST
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    } = req.body;
    
    if (inv_image && inv_image.includes('&#x2F;')) {
      inv_image = inv_image.replace(/&#x2F;/g, '/')
    }
    
    if (inv_thumbnail && inv_thumbnail.includes('&#x2F;')) {
      inv_thumbnail = inv_thumbnail.replace(/&#x2F;/g, '/')
    }
    let errors = [];
    // Server-side validation
    if (!classification_id) errors.push({ msg: 'Classification is required.' });
    if (!inv_make) errors.push({ msg: 'Make is required.' });
    if (!inv_model) errors.push({ msg: 'Model is required.' });
    if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > 2099) errors.push({ msg: 'Year must be between 1900 and 2099.' });
    if (!inv_description) errors.push({ msg: 'Description is required.' });
    if (!inv_image) errors.push({ msg: 'Image path is required.' });
    if (!inv_thumbnail) errors.push({ msg: 'Thumbnail path is required.' });
    if (!inv_price || isNaN(inv_price) || inv_price < 0) errors.push({ msg: 'Price must be a positive number.' });
    if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) errors.push({ msg: 'Miles must be a positive number.' });
    if (!inv_color) errors.push({ msg: 'Color is required.' });
    let sticky = {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    };
    let classificationList = await utilities.buildClassificationList(classification_id);
    if (errors.length > 0) {
      return res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        flash: null,
        errors,
        sticky
      });
    }
    // Insert into DB
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    });    
    if (result) {
      nav = await utilities.getNav();
      req.flash("message", "Inventory item added successfully!");
      req.flash("type", "success");
      return res.redirect("/inv/");
    } else {
      return res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        flash: { message: 'Failed to add inventory item.', type: 'error' },
        errors: [],
        sticky
      });
    }
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    console.log("Returning inventory data as JSON");
    console.log(invData);
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id);
    let nav = await utilities.getNav();
    
    const itemData = await invModel.getVehicleByInvId(inv_id);
    
    if (!itemData) {
      req.flash("error", "Sorry, we couldn't find that inventory item");
      return res.redirect("/inv");
    }
    
    let classificationList = await utilities.buildClassificationList(itemData.classification_id);
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    const flash = req.flash();
    let flashMessage = null;
    if (flash && Object.keys(flash).length > 0) {
      const type = Object.keys(flash)[0];
      flashMessage = { message: flash[type][0], type };
    }
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      flash: flashMessage,
      classificationList,
      errors: [],
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    let {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body
    
    if (inv_image && inv_image.includes('&#x2F;')) {
      inv_image = inv_image.replace(/&#x2F;/g, '/')
    }
    
    if (inv_thumbnail && inv_thumbnail.includes('&#x2F;')) {
      inv_thumbnail = inv_thumbnail.replace(/&#x2F;/g, '/')
    }
    
    let errors = [];
    // Server-side validation
    if (!classification_id) errors.push({ msg: 'Classification is required.' });
    if (!inv_make) errors.push({ msg: 'Make is required.' });
    if (!inv_model) errors.push({ msg: 'Model is required.' });
    if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > 2099) errors.push({ msg: 'Year must be between 1900 and 2099.' });
    if (!inv_description) errors.push({ msg: 'Description is required.' });
    if (!inv_image) errors.push({ msg: 'Image path is required.' });
    if (!inv_thumbnail) errors.push({ msg: 'Thumbnail path is required.' });
    if (!inv_price || isNaN(inv_price) || inv_price < 0) errors.push({ msg: 'Price must be a positive number.' });
    if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) errors.push({ msg: 'Miles must be a positive number.' });
    if (!inv_color) errors.push({ msg: 'Color is required.' });

    if (errors.length > 0) {
      const itemName = `${inv_make} ${inv_model}`;
      let classificationList = await utilities.buildClassificationList(classification_id);
      return res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        flash: null,
        classificationList,
        errors,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }

    const updateResult = await invModel.updateInventory(
      inv_id,  
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );
      if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model;
      req.flash("success", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      req.flash("error", "Update failed. Please try again.");
      res.redirect(`/inv/edit/${inv_id}`);
    }
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inventory_id);
    let nav = await utilities.getNav();
    
    const itemData = await invModel.getVehicleByInvId(inv_id);
    
    if (!itemData) {
      req.flash("error", "Sorry, we couldn't find that inventory item");
      return res.redirect("/inv");
    }
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    const flash = req.flash();
    let flashMessage = null;
    if (flash && Object.keys(flash).length > 0) {
      const type = Object.keys(flash)[0];
      flashMessage = { message: flash[type][0], type };
    }
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      flash: flashMessage,
      errors: [],
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (err) {
    next(err);
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    
    const deleteResult = await invModel.deleteInventory(inv_id);
    
    if (deleteResult) {
      const itemName = deleteResult.inv_make + " " + deleteResult.inv_model;
      req.flash("success", `The ${itemName} was successfully deleted.`);
      res.redirect("/inv/");
    } else {
      req.flash("error", "Delete failed. Please try again.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (err) {
    next(err);
  }
}

module.exports = invCont;