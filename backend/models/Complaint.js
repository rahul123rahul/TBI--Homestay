import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homestay",
      required: true,
    },
    issue: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Investigating", "Resolved"],
      default: "Pending",
    },
    resolutionNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;
