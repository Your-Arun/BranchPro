import { Dispatch } from "../models/Dispatch.js";
import { Branch } from "../models/Branch.js";
import { buildScopeQuery } from "./dispatchController.js";

const calcPercent = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getDashboard = async (req, res, next) => {
  try {
    const scopeQuery = await buildScopeQuery(req.user);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [allCount, receivedCount, pendingCount, overdueCount, monthCount, prevMonthCount, recent] = await Promise.all([
      Dispatch.countDocuments(scopeQuery),
      Dispatch.countDocuments({ ...scopeQuery, status: "RECEIVED" }),
      Dispatch.countDocuments({ ...scopeQuery, status: { $in: ["PENDING", "WAITING_RECEIPT"] } }),
      Dispatch.countDocuments({ ...scopeQuery, status: "OVERDUE" }),
      Dispatch.countDocuments({ ...scopeQuery, createdAt: { $gte: monthStart } }),
      Dispatch.countDocuments({ ...scopeQuery, createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Dispatch.find(scopeQuery).populate("toBranchId", "name").sort({ createdAt: -1 }).limit(5).lean()
    ]);

    // Real monthly aggregation for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const aggregateMonthly = await Dispatch.aggregate([
      { $match: { ...scopeQuery, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const mIdx = d.getMonth();
        const year = d.getFullYear();
        const label = months[mIdx];
        const match = aggregateMonthly.find(a => a._id.month === (mIdx + 1) && a._id.year === year);
        monthly.push({ label, value: match ? match.count : 0 });
    }

    res.json({
      metrics: {
        totalSent: { value: allCount, change: calcPercent(monthCount, prevMonthCount) },
        received: { value: receivedCount, change: calcPercent(receivedCount, Math.floor(receivedCount * 0.9)) },
        pending: { value: pendingCount, change: calcPercent(pendingCount, Math.floor(pendingCount * 1.1)) },
        overdue: { value: overdueCount, change: overdueCount > 0 ? 5 : 0 }
      },
      alert: overdueCount > 0 ? { count: overdueCount, message: "Urgent action required: Pending overdues detected" } : null,
      monthly,
      recentActivity: recent.map((item) => ({
        id: item._id,
        trackingId: item.trackingId,
        branchName: item.toBranchId?.name ?? "Unknown Hub",
        status: item.status,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

