import { Branch } from "../models/Branch.js";
import { Dispatch } from "../models/Dispatch.js";

const decorateWithActiveDispatches = async (branches) => {
  const activeDispatches = await Dispatch.aggregate([
    { $match: { status: { $in: ["SENT", "IN_TRANSIT", "WAITING_RECEIPT", "PENDING", "OVERDUE"] } } },
    { $group: { _id: "$toBranchId", count: { $sum: 1 } } }
  ]);

  const countMap = new Map(activeDispatches.map((a) => [String(a._id), a.count]));
  return branches.map((b) => ({ ...b, activeDispatches: countMap.get(String(b._id)) ?? 0 }));
};

export const getBranches = async (_req, res, next) => {
  try {
    const branches = await Branch.find({}).sort({ name: 1 }).lean();
    res.json(await decorateWithActiveDispatches(branches));
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const { name, city, address, code, status = "ACTIVE" } = req.body;
    if (!name || !city || !address || !code) {
      return res.status(400).json({ message: "name, city, address and code are required" });
    }

    const exists = await Branch.findOne({ code: code.trim().toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Branch code already exists" });
    }

    const branch = await Branch.create({
      name,
      city,
      address,
      code: code.trim().toUpperCase(),
      status
    });

    res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const { name, city, address, code, status } = req.body;

    if (code) {
      const existing = await Branch.findOne({ code: code.trim().toUpperCase(), _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: "Branch code already exists" });
      }
    }

    const updated = await Branch.findByIdAndUpdate(
      req.params.id,
      {
        ...(name ? { name } : {}),
        ...(city ? { city } : {}),
        ...(address ? { address } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(status ? { status } : {})
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const inUse = await Dispatch.countDocuments({
      $or: [{ fromBranchId: req.params.id }, { toBranchId: req.params.id }]
    });

    if (inUse > 0) {
      return res.status(400).json({ message: "Cannot delete branch with dispatch history" });
    }

    const deleted = await Branch.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Branch not found" });
    }

    res.json({ message: "Branch deleted" });
  } catch (error) {
    next(error);
  }
};
