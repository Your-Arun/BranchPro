import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" }
  },
  { timestamps: true }
);

export const Branch = mongoose.model("Branch", branchSchema);
