import { Branch } from "../models/Branch.js";
import { Dispatch } from "../models/Dispatch.js";
import { User } from "../models/User.js";

const generateKey = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const decorateWithActiveDispatches = async (branches) => {
  const activeDispatches = await Dispatch.aggregate([
    { $match: { status: { $in: ["SENT", "IN_TRANSIT", "WAITING_RECEIPT", "PENDING", "OVERDUE"] } } },
    { $group: { _id: "$toBranchId", count: { $sum: 1 } } }
  ]);

  const countMap = new Map(activeDispatches.map((a) => [String(a._id), a.count]));
  return branches.map((b) => ({ ...b, activeDispatches: countMap.get(String(b._id)) ?? 0 }));
};

export const getBranches = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    if (!companyId) {
      // Admin with no company yet, or unaffiliated user
      return res.json([]);
    }

    // Both ADMIN and STAFF see all branches of their company
    // ADMIN: manages them | STAFF: needs the list to pick a "To Branch"
    const branches = await Branch.find({ companyId }).sort({ name: 1 }).lean();
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

    if (!req.user.companyId) {
        return res.status(400).json({ message: "Create a company first" });
    }

    const codeExists = await Branch.findOne({ code: code.trim().toUpperCase() });
    if (codeExists) {
      return res.status(400).json({ message: "Branch code already exists" });
    }

    // Generate unique registration key
    let registrationKey;
    while (true) {
        registrationKey = generateKey();
        const keyExists = await Branch.findOne({ registrationKey });
        if (!keyExists) break;
    }

    const branch = await Branch.create({
      name,
      city,
      address,
      code: code.trim().toUpperCase(),
      registrationKey,
      companyId: req.user.companyId,
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

    const branch = await Branch.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!branch) {
      return res.status(404).json({ message: "Branch not found or unauthorized" });
    }

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

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!branch) {
      return res.status(404).json({ message: "Branch not found or unauthorized" });
    }

    const inUse = await Dispatch.countDocuments({
      $or: [{ fromBranchId: req.params.id }, { toBranchId: req.params.id }]
    });

    if (inUse > 0) {
      return res.status(400).json({ message: "Cannot delete branch with dispatch history" });
    }

    await Branch.findByIdAndDelete(req.params.id);
    res.json({ message: "Branch deleted" });
  } catch (error) {
    next(error);
  }
};
