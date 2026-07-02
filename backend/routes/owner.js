import express from "express";
import {
  getOwnerStats,
  getOwnerReviews,
  replyToReview,
  getOwnerHomestay,
  updateHomestayPhotos,
  blockDates,
  unblockDates,
  getOffersAndCoupons,
  createCoupon,
  deleteCoupon,
  createOffer,
  deleteOffer,
  getNotifications,
  markNotificationRead
} from "../controllers/ownerController.js";

const router = express.Router();

// Owner Stats
router.get("/owner/stats", getOwnerStats);

// Owner Reviews & Replies
router.get("/owner/reviews", getOwnerReviews);
router.post("/owner/reviews/:id/reply", replyToReview);

// Owner Homestay & Photos
router.get("/owner/homestay", getOwnerHomestay);
router.put("/owner/homestay/photos", updateHomestayPhotos);

// Availability Calendar blocking
router.post("/owner/calendar/block", blockDates);
router.delete("/owner/calendar/block", unblockDates);

// Offers & Coupons
router.get("/owner/marketing", getOffersAndCoupons);
router.post("/owner/coupons", createCoupon);
router.delete("/owner/coupons/:id", deleteCoupon);
router.post("/owner/offers", createOffer);
router.delete("/owner/offers/:id", deleteOffer);

// Notifications
router.get("/owner/notifications", getNotifications);
router.put("/owner/notifications/:id/read", markNotificationRead);

export default router;
