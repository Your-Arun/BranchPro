import mongoose from "mongoose";

const generalEntrySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, "Item name is required"],
    trim: true,
    maxlength: [200, "Item name cannot exceed 200 characters"]
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    validate: {
      validator: Number.isInteger,
      message: "Quantity must be a whole number"
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
    default: ""
  },
  entryType: {
    type: String,
    enum: ["IN", "OUT"],
    required: [true, "Entry type is required"],
    default: "IN"
  },
  category: {
    type: String,
    enum: ["GENERAL", "OFFICE_SUPPLIES", "EQUIPMENT", "DOCUMENTS", "POSTAL", "OTHER"],
    default: "GENERAL"
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: [true, "Branch is required"]
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Company is required"]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Created by user is required"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
generalEntrySchema.index({ branchId: 1, createdAt: -1 });
generalEntrySchema.index({ companyId: 1, createdAt: -1 });
generalEntrySchema.index({ entryType: 1, category: 1 });

// Update the updatedAt field before saving
generalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const GeneralEntry = mongoose.model("GeneralEntry", generalEntrySchema);