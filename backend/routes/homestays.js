import express from "express";
import {
  getHomestays,
  getHomestayById,
  createHomestayReview,
  createHomestayBooking,
  createHomestayQA,
  createHomestay
} from "../controllers/homestaysController.js";

const router = express.Router();

router.route("/homestays")
  .get(getHomestays)
  .post(createHomestay);

router.route("/homestays/:id")
  .get(getHomestayById);

router.route("/homestays/:id/reviews")
  .post(createHomestayReview);

router.route("/homestays/:id/bookings")
  .post(createHomestayBooking);

router.route("/homestays/:id/questions")
  .post(createHomestayQA);

export default router;
