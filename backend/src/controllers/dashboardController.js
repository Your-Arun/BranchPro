import { Dispatch } from "../models/Dispatch.js";

const calcPercent = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getDashboard = async (_req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [allCount, receivedCount, pendingCount, overdueCount, monthCount, prevMonthCount, recent] = await Promise.all([
      Dispatch.countDocuments(),
      Dispatch.countDocuments({ status: "RECEIVED" }),
      Dispatch.countDocuments({ status: { $in: ["PENDING", "WAITING_RECEIPT"] } }),
      Dispatch.countDocuments({ status: "OVERDUE" }),
      Dispatch.countDocuments({ createdAt: { $gte: monthStart } }),
      Dispatch.countDocuments({ createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
      Dispatch.find({}).populate("toBranchId", "name").sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const monthly = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, idx) => ({
      label,
      value: 50 + idx * 15 + (idx % 2 === 0 ? 10 : -5)
    }));

    res.json({
      metrics: {
        totalSent: { value: allCount, change: calcPercent(monthCount, prevMonthCount) },
        received: { value: receivedCount, change: 8 },
        pending: { value: pendingCount, change: -3 },
        overdue: { value: overdueCount, change: overdueCount > 0 ? 5 : -2 }
      },
      alert: overdueCount > 0 ? { count: overdueCount, message: "Urgent action required" } : null,
      monthly,
      recentActivity: recent.map((item) => ({
        id: item._id,
        trackingId: item.trackingId,
        branchName: item.toBranchId?.name ?? "Unknown",
        status: item.status,
        createdAt: item.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};
