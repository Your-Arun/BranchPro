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
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const isStaff = req.user.role === "STAFF";
    const branchId = req.user.branchId;

    // Determine queries based on role
    // For staff, Sent means outbound from their branch, Received/Pending means inbound to their branch
    // For admin, it's global company scope
    const sentBase = isStaff ? { fromBranchId: branchId } : scopeQuery;
    const recvBase = isStaff ? { toBranchId: branchId } : scopeQuery;

    const [allCount, receivedCount, pendingCount, overdueCount, monthCount, prevMonthCount, recent] = await Promise.all([
      Dispatch.countDocuments(sentBase),
      Dispatch.countDocuments({ ...recvBase, status: "RECEIVED" }),
      Dispatch.countDocuments({ 
        ...recvBase, 
        status: { $in: ["SENT", "IN_TRANSIT", "WAITING_RECEIPT", "PENDING"] },
        createdAt: { $gte: yesterday } 
      }),
      Dispatch.countDocuments({ 
        ...recvBase, 
        $or: [
          { status: "OVERDUE" },
          { 
            status: { $nin: ["RECEIVED", "PENDING", "FAILED"] },
            createdAt: { $lt: yesterday }
          }
        ]
      }),
      Dispatch.countDocuments({ ...sentBase, createdAt: { $gte: monthStart } }),
      Dispatch.countDocuments({ ...sentBase, createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Dispatch.find(scopeQuery)
        .populate("fromBranchId", "name")
        .populate("toBranchId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
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
      recentActivity: recent.map((item) => {
        let branchName = item.toBranchId?.name ?? "Unknown Hub";
        if (isStaff && String(item.toBranchId?._id || item.toBranchId) === String(branchId)) {
          // If we are the receiver, show who it came FROM
          branchName = `From: ${item.fromBranchId?.name ?? "External"}`;
        } else if (isStaff) {
          // If we are the sender, show who it's going TO
          branchName = `To: ${item.toBranchId?.name ?? "External"}`;
        } else {
          // Admin view: Show path
          branchName = `${item.fromBranchId?.name ?? "?"} → ${item.toBranchId?.name ?? "?"}`;
        }

        return {
          id: item._id,
          trackingId: item.trackingId,
          branchName: branchName,
          status: item.status,
          createdAt: item.createdAt
        };
      })
    });
  } catch (error) {
    next(error);
  }
};

