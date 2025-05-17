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
        vehicleDetail
      });
    } else {
      res.status(404).render("./inventory/detail", { title: "Vehicle Not Found", nav, vehicle: null, vehicleDetail: null });
    }
  } catch (err) {
    next(err)
  }
}

module.exports = invCont