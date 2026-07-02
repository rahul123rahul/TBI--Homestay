import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: "Direct Feedback",
    },
    text: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      required: true,
    },
    theme: {
      type: String,
      enum: ["Food", "Host", "Location", "Cleanliness", "Value", "Experience"],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    response: {
      type: String,
      default: "",
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: false,
    },
    overallRating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    ratings: {
      cleanliness: { type: Number, required: false, min: 1, max: 5 },
      hospitality: { type: Number, required: false, min: 1, max: 5 },
      food: { type: Number, required: false, min: 1, max: 5 },
      location: { type: Number, required: false, min: 1, max: 5 },
      value: { type: Number, required: false, min: 1, max: 5 },
      comfort: { type: Number, required: false, min: 1, max: 5 },
      wifi: { type: Number, required: false, min: 1, max: 5 },
      safety: { type: Number, required: false, min: 1, max: 5 },
    },
    images: [{ type: String }],
    videos: [{ type: String }],
    travelType: {
      type: String,
      enum: ["Family", "Solo", "Friends", "Couple", "Business"],
      required: false,
    },
    stayedDuring: {
      type: String,
      required: false,
    },
    recommend: {
      type: Boolean,
      required: false,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    isVerifiedStay: {
      type: Boolean,
      default: true,
    },
    spamScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Map _id to virtual id if needed by front-end when serializing
// We already have a physical `id` string field, but virtual getter provides flexibility
ReviewSchema.virtual("dbId").get(function () {
  return this._id.toHexString();
});

const Review = mongoose.model("Review", ReviewSchema);
export default Review;
