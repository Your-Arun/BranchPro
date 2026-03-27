import { GeneralEntry } from "../models/GeneralEntry.js";
import { Branch } from "../models/Branch.js";
import { Company } from "../models/Company.js";
import { User } from "../models/User.js";

// Build query scoped to a user's branch (STAFF) or company branches (ADMIN)
const buildScopeQuery = async (user) => {
  if (!user || typeof user !== "object") return { _id: null };

  const role = user.role || "UNKNOWN";
  const companyId = user.companyId;
  const branchId = user.branchId;

  if (role === "ADMIN") {
    if (!companyId) return { _id: null };
    // Admin sees everything related to their company
    return { companyId };
  }
  
  // Staff only sees entries from their branch
  if (user.branchId) {
    return { branchId: user.branchId };
  }
  
  return { _id: null };
};

export const listGeneralEntries = async (req, res, next) => {
  try {
    const { type = "ALL", category = "ALL", q = "" } = req.query;
    
    const scopeQuery = await buildScopeQuery(req.user);
    let query = { ...scopeQuery };

    // Filter by entry type
    if (type !== "ALL") {
      query.entryType = type;
    }

    // Filter by category
    if (category !== "ALL") {
      query.category = category;
    }

    const entries = await GeneralEntry.find(query)
      .populate("branchId", "name code")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    const search = q.trim().toLowerCase();
    const filtered = search
      ? entries.filter((entry) => {
          const haystack = `${entry.itemName} ${entry.description} ${entry.category} ${entry.branchId?.name ?? ""}`.toLowerCase();
          return haystack.includes(search);
        })
      : entries;

    res.json(filtered);
  } catch (error) {
    next(error);
  }
};

export const getGeneralEntryById = async (req, res, next) => {
  try {
    const scopeQuery = await buildScopeQuery(req.user);
    const entry = await GeneralEntry.findOne({ _id: req.params.id, ...scopeQuery })
      .populate("branchId", "name code")
      .populate("createdBy", "fullName")
      .lean();

    if (!entry) {
      return res.status(404).json({ message: "Entry not found or access denied" });
    }

    res.json(entry);
  } catch (error) {
    next(error);
  }
};

export const createGeneralEntry = async (req, res, next) => {
  try {
    const { itemName, quantity, description, entryType, category } = req.body;

    if (!itemName || !quantity) {
      return res.status(400).json({ message: "Item name and quantity are required" });
    }

    // Security check: Verify branch belongs to user's company
    const [branch, company] = await Promise.all([
      Branch.findOne({ _id: req.user.branchId, companyId: req.user.companyId }),
      Company.findById(req.user.companyId)
    ]);

    if (!branch || !company) {
      return res.status(403).json({ message: "Invalid branch or company" });
    }

    const newEntry = await GeneralEntry.create({
      itemName: itemName.trim(),
      quantity: parseInt(quantity),
      description: description?.trim() || "",
      entryType: entryType || "IN",
      category: category || "GENERAL",
      branchId: req.user.branchId,
      companyId: req.user.companyId,
      createdBy: req.user._id
    });

    const populated = await GeneralEntry.findById(newEntry._id)
      .populate("branchId", "name code")
      .populate("createdBy", "fullName")
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateGeneralEntry = async (req, res, next) => {
  try {
    const { itemName, quantity, description, entryType, category } = req.body;

    const scopeQuery = await buildScopeQuery(req.user);
    const entry = await GeneralEntry.findOne({ _id: req.params.id, ...scopeQuery });

    if (!entry) {
      return res.status(404).json({ message: "Entry not found or unauthorized" });
    }

    // Update fields
    if (itemName) entry.itemName = itemName.trim();
    if (quantity) entry.quantity = parseInt(quantity);
    if (description !== undefined) entry.description = description?.trim() || "";
    if (entryType) entry.entryType = entryType;
    if (category) entry.category = category;

    await entry.save();
    const updated = await GeneralEntry.findById(entry._id)
      .populate("branchId", "name code")
      .populate("createdBy", "fullName")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Entry not found or unauthorized" });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteGeneralEntry = async (req, res, next) => {
  try {
    const scopeQuery = await buildScopeQuery(req.user);
    const entry = await GeneralEntry.findOneAndDelete({ _id: req.params.id, ...scopeQuery });
    
    if (!entry) {
      return res.status(404).json({ message: "Entry not found or unauthorized" });
    }
    
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getEntryStats = async (req, res, next) => {
  try {
    const scopeQuery = await buildScopeQuery(req.user);
    
    const stats = await GeneralEntry.aggregate([
      { $match: scopeQuery },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalIn: { $sum: { $cond: [{ $eq: ["$entryType", "IN"] }, 1, 0] } },
          totalOut: { $sum: { $cond: [{ $eq: ["$entryType", "OUT"] }, 1, 0] } },
          totalQuantityIn: { $sum: { $cond: [{ $eq: ["$entryType", "IN"] }, "$quantity", 0] } },
          totalQuantityOut: { $sum: { $cond: [{ $eq: ["$entryType", "OUT"] }, "$quantity", 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalEntries: 0,
      totalIn: 0,
      totalOut: 0,
      totalQuantityIn: 0,
      totalQuantityOut: 0
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
};