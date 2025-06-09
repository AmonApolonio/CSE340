const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");
const { reviewRules, checkReviewData } = require("../utilities/review-validation");
const { handleErrors } = require("../utilities/");

async function displayReviewForm(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  const vehicle = await utilities.getVehicleById(inv_id);
  
  if (!vehicle) {
    req.flash("notice", "The specified vehicle was not found.");
    return res.redirect("/");
  }
    let nav = await utilities.getNav();
  res.render("reviews/review-form", {
    title: `Review ${vehicle.inv_make} ${vehicle.inv_model}`,
    contentTitle: `Add Review for ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    errors: null,
    vehicle,
    review: null,
    isEdit: false
  });
}

async function processReview(req, res, next) {
  const { inv_id, account_id, review_text, rating } = req.body;
  
  let result = await reviewModel.addReview(
    inv_id,
    account_id,
    review_text,
    rating
  );
  
  if (result && !result.error) {
    res.redirect(`/inv/detail/${inv_id}`);
  } else {
    req.flash("error", result.error || "Failed to submit review.");
    res.redirect(`/reviews/add/${inv_id}`);
  }
}

async function displayReviews(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  const vehicle = await utilities.getVehicleById(inv_id);
  
  if (!vehicle) {
    req.flash("notice", "The specified vehicle was not found.");
    return res.redirect("/");
  }
  
  const reviews = await reviewModel.getReviewsByVehicle(inv_id);
  let nav = await utilities.getNav();
  
  res.render("reviews/vehicle-reviews", {
    title: `Reviews for ${vehicle.inv_make} ${vehicle.inv_model}`,
    contentTitle: `<h1>Reviews for ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>`,
    nav,
    vehicle,
    reviews,
  });
}

async function displayUserReviews(req, res, next) {
  const account_id = res.locals.accountData && res.locals.accountData.account_id;
  if (!account_id) {
    req.flash("notice", "Unable to find your account information. Please log in again.");
    return res.redirect("/account/login");
  }
  const reviews = await reviewModel.getReviewsByAccount(account_id);
  let nav = await utilities.getNav();
  
  res.render("reviews/account-reviews", {
    title: "My Reviews",
    contentTitle: "My Reviews",
    nav,
    reviews,
  });
}

async function displayEditReview(req, res, next) {
  const review_id = parseInt(req.params.review_id);
  const review = await reviewModel.getReviewById(review_id);
  
  if (!review) {
    req.flash("notice", "The specified review was not found.");
    return res.redirect("/account/");
  }
  
  if (review.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You don't have permission to edit this review.");
    return res.redirect("/account/");
  }
  
  const vehicle = await utilities.getVehicleById(review.inv_id);
  let nav = await utilities.getNav();
  
  res.render("reviews/review-form", {
    title: `Edit Review for ${vehicle.inv_make} ${vehicle.inv_model}`,
    contentTitle: `Edit Review for ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    errors: null,
    vehicle,
    review,
    isEdit: true,
  });
}

async function processEditReview(req, res, next) {
  const { review_id, review_text, rating } = req.body;
  const existingReview = await reviewModel.getReviewById(review_id);
  
  if (existingReview.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You don't have permission to edit this review.");
    return res.redirect("/account/");
  }
  
  const result = await reviewModel.updateReview(review_id, review_text, rating);
  
  if (result && !result.error) {
    req.flash("notice", "Review updated successfully.");
    res.redirect("/reviews/user");
  } else {
    req.flash("error", result.error || "Failed to update review.");
    res.redirect(`/reviews/edit/${review_id}`);
  }
}

async function processDeleteReview(req, res, next) {
  const review_id = parseInt(req.params.review_id);
  const review = await reviewModel.getReviewById(review_id);
  
  if (!review) {
    req.flash("notice", "The specified review was not found.");
    return res.redirect("/account/");
  }

  const account_type = res.locals.accountData.account_type;
  const is_admin = account_type === "Admin" || account_type === "Employee";
  
  if (review.account_id !== res.locals.accountData.account_id && !is_admin) {
    req.flash("notice", "You don't have permission to delete this review.");
    return res.redirect("/account/");
  }
  
  const result = await reviewModel.deleteReview(review_id);
  
  if (result && !result.error) {
    req.flash("notice", "Review deleted successfully.");
    res.redirect("/reviews/user");
  } else {
    req.flash("error", result.error || "Failed to delete review.");
    res.redirect("/reviews/user");
  }
}

module.exports = {
  displayReviewForm: handleErrors(displayReviewForm),
  processReview: [reviewRules(), checkReviewData, handleErrors(processReview)],
  displayReviews: handleErrors(displayReviews),
  displayUserReviews: handleErrors(displayUserReviews),
  displayEditReview: handleErrors(displayEditReview),
  processEditReview: [reviewRules(), checkReviewData, handleErrors(processEditReview)],
  processDeleteReview: handleErrors(processDeleteReview),
};
