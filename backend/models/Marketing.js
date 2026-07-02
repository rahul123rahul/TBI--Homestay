import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    validityDate: { type: Date, required: true },
    minSpend: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const OfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountRate: { type: Number, required: true },
    validityDate: { type: Date, required: true },
    homestay: { type: mongoose.Schema.Types.ObjectId, ref: "Homestay", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AdCampaignSchema = new mongoose.Schema(
  {
    homestay: { type: mongoose.Schema.Types.ObjectId, ref: "Homestay", required: true },
    promoSlot: { type: String, required: true },
    budget: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CmsSeoSchema = new mongoose.Schema(
  {
    homepageHeroTitle: { type: String, default: "Discover Authentic Homestays in the Heart of India" },
    homepageHeroSubtitle: { type: String, default: "Book local eco-homestays with real-time feedback ratings, validated hospitality, and home-cooked regional delicacies." },
    metaTitle: { type: String, default: "Trishul Eco-Homestays - Guest Review Sentiment Classifier" },
    metaDescription: { type: String, default: "AI-assisted feedback analysis, theme tagging, and automated management responses." },
    activeCategories: { type: [String], default: ["Mountain", "Beach", "Farm Stay", "Lake View", "Heritage", "Luxury", "Budget", "Pet Friendly", "Top Rated"] },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
export const Offer = mongoose.models.Offer || mongoose.model("Offer", OfferSchema);
export const AdCampaign = mongoose.models.AdCampaign || mongoose.model("AdCampaign", AdCampaignSchema);
export const CmsSeo = mongoose.models.CmsSeo || mongoose.model("CmsSeo", CmsSeoSchema);
