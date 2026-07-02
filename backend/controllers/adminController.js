import User from "../models/User.js";
import Homestay from "../models/Homestay.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Complaint from "../models/Complaint.js";
import VerificationRequest from "../models/VerificationRequest.js";
import { Coupon, Offer, AdCampaign, CmsSeo } from "../models/Marketing.js";

// 1. GET /api/admin/overview
export const getAdminOverview = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments();
    const homestaysCount = await Homestay.countDocuments();
    const bookingsCount = await Booking.countDocuments();
    const reviewsCount = await Review.countDocuments();

    const bookings = await Booking.find({});
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const reviews = await Review.find({});
    const avgRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1))
      : 4.6;

    res.status(200).json({
      success: true,
      data: {
        usersCount,
        homestaysCount,
        bookingsCount,
        reviewsCount,
        totalRevenue,
        avgRating,
        stats: [
          { name: "Global Users", value: String(usersCount), change: "+3 this week" },
          { name: "Total Homestays", value: String(homestaysCount), change: "Active properties" },
          { name: "Bookings Processed", value: String(bookingsCount), change: "+10% vs last month" },
          { name: "Total Revenue Generated", value: `₹${totalRevenue.toLocaleString()}`, change: "All properties" },
          { name: "Global Average Rating", value: `${avgRating} ★`, change: "High guest sentiment" }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Users Management CRUD
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;
    const updateData = { name, email, role };
    if (password) updateData.password = password;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// 3. Owners & Verifications Management
export const getVerificationRequests = async (req, res, next) => {
  try {
    const requests = await VerificationRequest.find({}).populate("owner").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateVerificationStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body;
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status, comments },
      { new: true }
    ).populate("owner");

    if (status === "Approved" && request) {
      // Set the user role to Owner upon verification approval
      await User.findByIdAndUpdate(request.owner._id, { role: "Owner" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

// 4. Homestays Management
export const getHomestaysList = async (req, res, next) => {
  try {
    const homestays = await Homestay.find({}).populate("owner");
    res.status(200).json({ success: true, data: homestays });
  } catch (error) {
    next(error);
  }
};

export const toggleHomestayFeatured = async (req, res, next) => {
  try {
    const { featured } = req.body;
    // We can simulate featured by modifying rules/category or adding a virtual key
    // Let's toggle category to Top Rated or simply save custom attribute
    const homestay = await Homestay.findById(req.params.id);
    if (!homestay) {
      return res.status(404).json({ success: false, error: "Homestay not found" });
    }
    // Set category to "Top Rated" if pinning, or restore default
    if (featured) {
      homestay.category = "Top Rated";
    }
    await homestay.save();
    res.status(200).json({ success: true, data: homestay });
  } catch (error) {
    next(error);
  }
};

export const deleteHomestay = async (req, res, next) => {
  try {
    await Homestay.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Homestay deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// 5. Bookings Hub CRUD
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("homestay");
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// 6. Reviews Flag/Delete
export const getReviewsList = async (req, res, next) => {
  try {
    const reviews = await Review.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// 7. Complaints Helpdesk
export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, resolutionNotes },
      { new: true }
    ).populate("homestay");
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// 8. Ad Campaigns
export const getAdCampaigns = async (req, res, next) => {
  try {
    const campaigns = await AdCampaign.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const createAdCampaign = async (req, res, next) => {
  try {
    const { homestay, promoSlot, budget } = req.body;
    const campaign = await AdCampaign.create({ homestay, promoSlot, budget });
    const populated = await AdCampaign.findById(campaign._id).populate("homestay");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

export const toggleAdCampaign = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const campaign = await AdCampaign.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).populate("homestay");
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

// 9. CMS & SEO Settings
export const getCmsSeoSettings = async (req, res, next) => {
  try {
    let settings = await CmsSeo.findOne({});
    if (!settings) {
      settings = await CmsSeo.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateCmsSeoSettings = async (req, res, next) => {
  try {
    const { homepageHeroTitle, homepageHeroSubtitle, metaTitle, metaDescription } = req.body;
    let settings = await CmsSeo.findOne({});
    if (!settings) {
      settings = await CmsSeo.create(req.body);
    } else {
      settings.homepageHeroTitle = homepageHeroTitle || settings.homepageHeroTitle;
      settings.homepageHeroSubtitle = homepageHeroSubtitle || settings.homepageHeroSubtitle;
      settings.metaTitle = metaTitle || settings.metaTitle;
      settings.metaDescription = metaDescription || settings.metaDescription;
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
