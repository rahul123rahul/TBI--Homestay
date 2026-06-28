import express from "express";
import {
  getReviews,
  searchReviews,
  getReviewById,
  createReview,
  bulkAnalyzeReviews,
  updateReview,
  deleteReview,
  getStats
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

export default router;
