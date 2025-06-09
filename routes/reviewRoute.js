// Review routes
const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");

// Route to display the review form for a specific vehicle
router.get("/add/:inv_id", utilities.checkLogin, reviewController.displayReviewForm);

// Route to process the review form submission
router.post("/add-review", utilities.checkLogin, reviewController.processReview);

// Route to display reviews for a specific vehicle
router.get("/vehicle/:inv_id", reviewController.displayReviews);

// Route to display all reviews submitted by the logged-in user
router.get("/user", utilities.checkLogin, reviewController.displayUserReviews);

// Route to display the form to edit a review
router.get("/edit/:review_id", utilities.checkLogin, reviewController.displayEditReview);

// Route to process the edited review
router.post("/edit", utilities.checkLogin, reviewController.processEditReview);

// Route to process the deletion of a review
router.get("/delete/:review_id", utilities.checkLogin, reviewController.processDeleteReview);

module.exports = router;
