const utilities = require(".");
const { body, validationResult } = require("express-validator");
const reviewModel = require("../models/review-model");

/**
 * Validation rules for adding or editing a review
 */
const reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review must be between 10 and 1000 characters"),
    
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars"),
  ];
};

const checkReviewData = async (req, res, next) => {
  const { inv_id, account_id } = req.body;
  let errors = [];
  
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    errors = validationErrors.array().map((error) => error.msg);
  }

  if (req.url === "/add-review" && req.method === "POST") {
    const existingReview = await reviewModel.checkExistingReview(inv_id, account_id);
    if (existingReview && !existingReview.error) {
      errors.push("You have already reviewed this vehicle. You can edit your existing review instead.");
    }
  }

  if (errors.length) {
    const inv = await utilities.getVehicleById(inv_id);
    const isEdit = req.url === "/edit" ? true : false;
    const title = `${isEdit ? 'Edit' : 'Add'} Review for ${inv.inv_make} ${inv.inv_model}`;
    res.render("reviews/review-form", {
      title,
      contentTitle: title,
      nav: await utilities.getNav(),
      errors,
      vehicle: inv,
      review: req.body,
      isEdit,
    });
    return;
  }
  next();
};

module.exports = { reviewRules, checkReviewData };
