import express from "express";
import {
  getReviews,
  searchReviews,
  getReviewById,
  createReview,
  bulkAnalyzeReviews,
  updateReview,
  deleteReview,
  getStats,
  voteHelpful,
  reportReview,
  translateReview
} from "../controllers/reviewsController.js";

const router = express.Router();

// Define specific routes first (to prevent Express route matching conflicts with :id)
router.get("/reviews/search", searchReviews);
router.get("/reviews/stats", getStats);
router.post("/reviews/analyze", bulkAnalyzeReviews);

// General resource routes
router.get("/reviews", getReviews);
router.post("/reviews", createReview);
router.get("/reviews/:id", getReviewById);
router.put("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);
router.post("/reviews/:id/vote", voteHelpful);
router.post("/reviews/:id/report", reportReview);
router.get("/reviews/:id/translate", translateReview);

export default router;
