import express from "express";
import {
  getAdminOverview,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getVerificationRequests,
  updateVerificationStatus,
  getHomestaysList,
  toggleHomestayFeatured,
  deleteHomestay,
  getBookings,
  updateBookingStatus,
  getReviewsList,
  getComplaints,
  resolveComplaint,
  getAdCampaigns,
  createAdCampaign,
  toggleAdCampaign,
  getCmsSeoSettings,
  updateCmsSeoSettings
} from "../controllers/adminController.js";

const router = express.Router();

// Admin Stats Overview
router.get("/admin/overview", getAdminOverview);

// User Management
router.route("/admin/users")
  .get(getUsers)
  .post(createUser);
router.route("/admin/users/:id")
  .put(updateUser)
  .delete(deleteUser);

// Owner Verification Requests
router.get("/admin/verifications", getVerificationRequests);
router.put("/admin/verifications/:id", updateVerificationStatus);

// Homestays Hub
router.get("/admin/homestays", getHomestaysList);
router.put("/admin/homestays/:id/featured", toggleHomestayFeatured);
router.delete("/admin/homestays/:id", deleteHomestay);

// Bookings Master
router.get("/admin/bookings", getBookings);
router.put("/admin/bookings/:id/status", updateBookingStatus);

// Reviews Global Monitor
router.get("/admin/reviews", getReviewsList);

// Complaints Helpdesk
router.get("/admin/complaints", getComplaints);
router.put("/admin/complaints/:id/resolve", resolveComplaint);

// Promotional Advertisements
router.route("/admin/ads")
  .get(getAdCampaigns)
  .post(createAdCampaign);
router.put("/admin/ads/:id/toggle", toggleAdCampaign);

// CMS & SEO Editor
router.route("/admin/cms-seo")
  .get(getCmsSeoSettings)
  .put(updateCmsSeoSettings);

export default router;
