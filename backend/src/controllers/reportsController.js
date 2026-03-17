import { Branch } from "../models/Branch.js";
import { Dispatch } from "../models/Dispatch.js";
import { buildScopeQuery } from "./dispatchController.js";

export const getReports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ message: "Network synchronization error: User profile incomplete" });
    }

    const scopeQuery = await buildScopeQuery(req.user);
    
    // Aggregate data scoped to the user's company/branch
    const [totalDispatches, totalReceived, pending, overdue, companyBranches, categories] = await Promise.all([
      Dispatch.countDocuments(scopeQuery),
      Dispatch.countDocuments({ ...scopeQuery, status: "RECEIVED" }),
      Dispatch.countDocuments({ ...scopeQuery, status: { $in: ["PENDING", "WAITING_RECEIPT"] } }),
      Dispatch.countDocuments({ ...scopeQuery, status: "OVERDUE" }),
      Branch.find({ companyId: req.user.companyId }).lean(),
      Dispatch.aggregate([
        { $match: scopeQuery },
        { $group: { _id: "$category", count: { $sum: 1 } } }, 
        { $sort: { count: -1 } }
      ])
    ]);

    const branchPerformance = await Promise.all(
      companyBranches.map(async (b) => {
        // Count dispatches received by this branch
        const count = await Dispatch.countDocuments({ toBranchId: b._id });
        return { branchName: b.name, value: count };
      })
    );

    res.json({
      summary: {
        totalDispatches,
        totalReceived,
        pending,
        overdue
      },
      // Sample trend data — in a real app this would be aggregated by month from the DB
      monthly: [
        { label: "Jan", value: Math.floor(totalDispatches * 0.1) },
        { label: "Feb", value: Math.floor(totalDispatches * 0.15) },
        { label: "Mar", value: Math.floor(totalDispatches * 0.12) },
        { label: "Apr", value: Math.floor(totalDispatches * 0.18) },
        { label: "May", value: Math.floor(totalDispatches * 0.2) },
        { label: "Jun", value: Math.floor(totalDispatches * 0.25) }
      ],
      branchPerformance,
      categories: categories.map((c) => ({ category: c._id || "Other", value: c.count })),
      recentRecords: await Dispatch.find(scopeQuery)
        .populate("toBranchId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("trackingId status createdAt")
        .lean()
    });
  } catch (error) {
    next(error);
  }
};

