import mongoose from "mongoose";

const QASchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  askedBy: { type: String, default: "Guest" },
  answeredBy: { type: String, default: "Host" },
  createdAt: { type: Date, default: Date.now }
});

const HomestaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["Mountain", "Beach", "Farm Stay", "Lake View", "Heritage", "Luxury", "Budget", "Pet Friendly", "Top Rated"],
      required: true,
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    rules: [{ type: String }],
    locationMap: {
      lat: { type: Number, default: 29.74 },
      lng: { type: Number, default: 79.45 },
      address: { type: String }
    },
    hostDetails: {
      name: { type: String, required: true },
      photo: { type: String },
      bio: { type: String },
      joined: { type: String }
    },
    nearbyAttractions: [{
      name: { type: String },
      distance: { type: String }
    }],
    questionsAndAnswers: [QASchema],
    bookings: [{
      startDate: { type: Date },
      endDate: { type: Date }
    }],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    aiReviewSummary: {
      type: String,
      default: "Guests loved the breathtaking mountain vistas, clean and comfortable wooden cottage design, and warm hosting. The home-cooked Kumaoni regional meals received top ratings.",
    },
  },
  {
    timestamps: true,
  }
);

const Homestay = mongoose.model("Homestay", HomestaySchema);
export default Homestay;
