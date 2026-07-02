import mongoose from "mongoose";

const VerificationRequestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    documents: {
      type: [String],
      default: ["ID Proof (PAN/Aadhaar)", "Property Ownership Deed", "Tax Registration Certificate"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    comments: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const VerificationRequest = mongoose.model("VerificationRequest", VerificationRequestSchema);
export default VerificationRequest;
