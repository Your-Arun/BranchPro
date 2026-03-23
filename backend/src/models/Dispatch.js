import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    type: { type: String, enum: ["PDF", "IMAGE", "DOC"], default: "PDF" },
    sizeMb: { type: Number, default: 0 }
  },
  { _id: false }
);

const dispatchSchema = new mongoose.Schema(
  {
    trackingId: { type: String, required: true, unique: true, trim: true },
    fromBranchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    toBranchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    category: { type: String, required: true, trim: true },
    courierName: { type: String, required: true, trim: true },
    docketNumber: { type: String, trim: true },
    description: { type: String, default: "", trim: true },
    dispatchDate: { type: Date, required: true },
    geoTrackingEnabled: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["SENT", "IN_TRANSIT", "WAITING_RECEIPT", "RECEIVED", "PENDING", "OVERDUE", "FAILED"],
      default: "SENT"
    },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    timeline: {
      type: [
        {
          step: String,
          note: String,
          status: { type: String, enum: ["COMPLETED", "IN_PROGRESS", "PENDING"], default: "PENDING" },
          date: Date
        }
      ],
      default: []
    },
    attachments: { type: [attachmentSchema], default: [] }
  },
  { timestamps: true }
);

export const Dispatch = mongoose.model("Dispatch", dispatchSchema);
