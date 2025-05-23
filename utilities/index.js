const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = '';
  if(data.length > 0){
    grid = '<div id="inv-display" class="classification-grid">';
    data.forEach(vehicle => { 
      grid += '<div class="classification-item">';
      grid += '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>';
      grid += '<div class="vehicle-info">';
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" class="vehicle-name" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '<span class="vehicle-price">$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</div>';
    });
    grid += '</div>';
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

/* **************************************
* Build the vehicle detail HTML
* ************************************ */
Util.buildVehicleDetail = async function(vehicle) {
  if (!vehicle) return '<p>Vehicle not found.</p>';
  let html = `<div class="vehicle-detail-container">
    <div class="vehicle-detail-image">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
    </div>
    <div class="vehicle-detail-info">
      <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <p class="vehicle-detail-price">Price: <span>$${Number(vehicle.inv_price).toLocaleString('en-US')}</span></p>
      <ul class="vehicle-detail-list">
        <li><strong>Mileage:</strong> ${Number(vehicle.inv_miles).toLocaleString('en-US')} miles</li>
        <li><strong>Color:</strong> ${vehicle.inv_color}</li>
        <li><strong>Description:</strong> ${vehicle.inv_description}</li>
      </ul>
    </div>
  </div>`;
  return html;
}

/* **************************************
* Build the classification select list for add inventory
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  ...Util,
  handleErrors
};