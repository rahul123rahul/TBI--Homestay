import mongoose from "mongoose";
import User from "../models/User.js";
import Homestay from "../models/Homestay.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Complaint from "../models/Complaint.js";
import VerificationRequest from "../models/VerificationRequest.js";
import { Coupon, Offer, AdCampaign, CmsSeo } from "../models/Marketing.js";

// Local in-memory database mock storage for offline mode
let offlineUsers = [
  { _id: new mongoose.Types.ObjectId().toString(), name: "System Administrator", email: "admin@trishul.com", role: "Admin", createdAt: new Date(), updatedAt: new Date() },
  { _id: new mongoose.Types.ObjectId().toString(), name: "Trishul Desk Staff", email: "staff@trishul.com", role: "Staff", createdAt: new Date(), updatedAt: new Date() },
  { _id: new mongoose.Types.ObjectId().toString(), name: "Homestay Owner", email: "owner@trishul.com", role: "Owner", createdAt: new Date(), updatedAt: new Date() }
];

let offlineVerifications = [
  { _id: new mongoose.Types.ObjectId().toString(), owner: { name: "Homestay Owner", email: "owner@trishul.com" }, propertyName: "Himalayan Woodhouse Cottage", documents: ["ID Proof (PAN/Aadhaar)", "Property Ownership Deed"], status: "Pending", comments: "" }
];

let offlineHomestays = [
  { _id: new mongoose.Types.ObjectId().toString(), name: "Trishul Eco-Homestay", location: "Peora, Uttarakhand", startingPrice: 3500, rating: 4.8, reviewsCount: 6, category: "Mountain", featured: true },
  { _id: new mongoose.Types.ObjectId().toString(), name: "Oak Forest Retreat", location: "Mukteshwar, Uttarakhand", startingPrice: 4200, rating: 4.5, reviewsCount: 2, category: "Forest Stay", featured: false }
];

let offlineBookings = [
  { _id: new mongoose.Types.ObjectId().toString(), homestay: { name: "Trishul Eco-Homestay" }, guestName: "Amit Kumar", guestEmail: "amit@gmail.com", startDate: new Date(), endDate: new Date(), totalAmount: 7000, status: "Confirmed", guestsCount: 2 }
];

let offlineReviews = [
  { _id: new mongoose.Types.ObjectId().toString(), id: "1", date: "June 20, 2026", source: "Direct Feedback", text: "Amazing wooden cottage and warm hosts!", sentiment: "Positive", theme: "Host", score: 98, overallRating: 5, homestay: { name: "Trishul Eco-Homestay" } }
];

let offlineComplaints = [
  { _id: new mongoose.Types.ObjectId().toString(), guestName: "Sanjay Sharma", guestEmail: "sanjay@outlook.com", homestay: { name: "Trishul Eco-Homestay" }, issue: "WiFi not working on ground floor", status: "Pending", resolutionNotes: "" }
];

let offlineAds = [
  { _id: new mongoose.Types.ObjectId().toString(), homestay: { name: "Trishul Eco-Homestay" }, promoSlot: "Homepage Banner Carousel", budget: 1500, isActive: true }
];

let offlineCmsSeo = {
  _id: new mongoose.Types.ObjectId().toString(),
  homepageHeroTitle: "Discover Authentic Homestays in the Heart of India",
  homepageHeroSubtitle: "Book local eco-homestays with real-time feedback ratings.",
  metaTitle: "Trishul Eco-Homestays",
  metaDescription: "AI-assisted feedback analysis.",
  activeCategories: ["Mountain", "Beach", "Farm Stay"]
};

// 1. GET /api/admin/overview
export const getAdminOverview = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const usersCount = offlineUsers.length;
      const homestaysCount = offlineHomestays.length;
      const bookingsCount = offlineBookings.length;
      const reviewsCount = offlineReviews.length;
      const totalRevenue = offlineBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const avgRating = 4.8;
      return res.status(200).json({
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
    }

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
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineUsers });
    }
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email,
        role: role || "Staff",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      offlineUsers.unshift(newUser);
      return res.status(201).json({ success: true, data: newUser });
    }
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const index = offlineUsers.findIndex(u => u._id === req.params.id);
      if (index !== -1) {
        offlineUsers[index] = {
          ...offlineUsers[index],
          name: name || offlineUsers[index].name,
          email: email || offlineUsers[index].email,
          role: role || offlineUsers[index].role,
          updatedAt: new Date()
        };
        return res.status(200).json({ success: true, data: offlineUsers[index] });
      }
      return res.status(404).json({ success: false, error: "User not found" });
    }
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
    if (mongoose.connection.readyState !== 1) {
      offlineUsers = offlineUsers.filter(u => u._id !== req.params.id);
      return res.status(200).json({ success: true, message: "User deleted successfully." });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// 3. Owners & Verifications Management
export const getVerificationRequests = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineVerifications });
    }
    const requests = await VerificationRequest.find({}).populate("owner").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const updateVerificationStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const index = offlineVerifications.findIndex(r => r._id === req.params.id);
      if (index !== -1) {
        offlineVerifications[index].status = status;
        offlineVerifications[index].comments = comments;
        if (status === "Approved") {
          const ownerEmail = offlineVerifications[index].owner.email;
          const uIndex = offlineUsers.findIndex(u => u.email === ownerEmail);
          if (uIndex !== -1) {
            offlineUsers[uIndex].role = "Owner";
          }
        }
        return res.status(200).json({ success: true, data: offlineVerifications[index] });
      }
      return res.status(404).json({ success: false, error: "Verification request not found" });
    }

    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status, comments },
      { new: true }
    ).populate("owner");

    if (status === "Approved" && request) {
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
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineHomestays });
    }
    const homestays = await Homestay.find({}).populate("owner");
    res.status(200).json({ success: true, data: homestays });
  } catch (error) {
    next(error);
  }
};

export const toggleHomestayFeatured = async (req, res, next) => {
  try {
    const { featured } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const index = offlineHomestays.findIndex(h => h._id === req.params.id);
      if (index !== -1) {
        offlineHomestays[index].featured = featured;
        if (featured) {
          offlineHomestays[index].category = "Top Rated";
        }
        return res.status(200).json({ success: true, data: offlineHomestays[index] });
      }
      return res.status(404).json({ success: false, error: "Homestay not found" });
    }

    const homestay = await Homestay.findById(req.params.id);
    if (!homestay) {
      return res.status(404).json({ success: false, error: "Homestay not found" });
    }
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
    if (mongoose.connection.readyState !== 1) {
      offlineHomestays = offlineHomestays.filter(h => h._id !== req.params.id);
      return res.status(200).json({ success: true, message: "Homestay deleted successfully." });
    }
    await Homestay.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Homestay deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// 5. Bookings Hub CRUD
export const getBookings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineBookings });
    }
    const bookings = await Booking.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const index = offlineBookings.findIndex(b => b._id === req.params.id);
      if (index !== -1) {
        offlineBookings[index].status = status;
        return res.status(200).json({ success: true, data: offlineBookings[index] });
      }
      return res.status(404).json({ success: false, error: "Booking not found" });
    }
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate("homestay");
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// 6. Reviews Flag/Delete
export const getReviewsList = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineReviews });
    }
    const reviews = await Review.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// 7. Complaints Helpdesk
export const getComplaints = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineComplaints });
    }
    const complaints = await Complaint.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const index = offlineComplaints.findIndex(c => c._id === req.params.id);
      if (index !== -1) {
        offlineComplaints[index].status = status;
        offlineComplaints[index].resolutionNotes = resolutionNotes;
        return res.status(200).json({ success: true, data: offlineComplaints[index] });
      }
      return res.status(404).json({ success: false, error: "Complaint not found" });
    }
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
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineAds });
    }
    const campaigns = await AdCampaign.find({}).populate("homestay").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

export const createAdCampaign = async (req, res, next) => {
  try {
    const { homestay, promoSlot, budget } = req.body;
    if (mongoose.connection.readyState !== 1) {
      const newAd = {
        _id: new mongoose.Types.ObjectId().toString(),
        homestay: offlineHomestays.find(h => h._id === homestay) || { name: "Mock Homestay" },
        promoSlot,
        budget: Number(budget),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      offlineAds.push(newAd);
      return res.status(201).json({ success: true, data: newAd });
    }
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
    if (mongoose.connection.readyState !== 1) {
      const index = offlineAds.findIndex(a => a._id === req.params.id);
      if (index !== -1) {
        offlineAds[index].isActive = isActive;
        return res.status(200).json({ success: true, data: offlineAds[index] });
      }
      return res.status(404).json({ success: false, error: "Ad Campaign not found" });
    }
    const campaign = await AdCampaign.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).populate("homestay");
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

// 9. CMS & SEO Settings
export const getCmsSeoSettings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, data: offlineCmsSeo });
    }
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
    if (mongoose.connection.readyState !== 1) {
      offlineCmsSeo.homepageHeroTitle = homepageHeroTitle || offlineCmsSeo.homepageHeroTitle;
      offlineCmsSeo.homepageHeroSubtitle = homepageHeroSubtitle || offlineCmsSeo.homepageHeroSubtitle;
      offlineCmsSeo.metaTitle = metaTitle || offlineCmsSeo.metaTitle;
      offlineCmsSeo.metaDescription = metaDescription || offlineCmsSeo.metaDescription;
      return res.status(200).json({ success: true, data: offlineCmsSeo });
    }
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
