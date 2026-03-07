import { Branch } from "../models/Branch.js";
import { Dispatch } from "../models/Dispatch.js";

export const getReports = async (_req, res, next) => {
  try {
    const [totalDispatches, totalReceived, pending, overdue, branches, categories] = await Promise.all([
      Dispatch.countDocuments(),
      Dispatch.countDocuments({ status: "RECEIVED" }),
      Dispatch.countDocuments({ status: { $in: ["PENDING", "WAITING_RECEIPT"] } }),
      Dispatch.countDocuments({ status: "OVERDUE" }),
      Branch.find({}).lean(),
      Dispatch.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
    ]);

    const branchPerformance = await Promise.all(
      branches.map(async (b) => {
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
      monthly: [
        { label: "Jan", value: 620 },
        { label: "Feb", value: 710 },
        { label: "Mar", value: 680 },
        { label: "Apr", value: 790 },
        { label: "May", value: 860 },
        { label: "Jun", value: 940 }
      ],
      branchPerformance,
      categories: categories.map((c) => ({ category: c._id, value: c.count })),
      recentRecords: await Dispatch.find({})
        .populate("toBranchId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("trackingId status createdAt")
        .lean()
    });
  } catch (error) {
    next(error);
  }
};
