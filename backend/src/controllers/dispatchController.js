import { Branch } from "../models/Branch.js";
import { Company } from "../models/Company.js";
import { Dispatch } from "../models/Dispatch.js";
import { User } from "../models/User.js";
import { sendDispatchEmail, sendStatusUpdateEmail } from "../utils/mailer.js";

const statusMap = {
  ALL: null,
  IN_TRANSIT: "IN_TRANSIT",
  WAITING_RECEIPT: "WAITING_RECEIPT",
  RECEIVED: "RECEIVED",
  PENDING: "PENDING",
  OVERDUE: "OVERDUE",
  SENT: "SENT"
};

const toDto = (dispatch) => {
  let status = dispatch.status;
  
  const createdAt = dispatch.createdAt instanceof Date ? dispatch.createdAt : new Date(dispatch.createdAt);
  const hrsOld = (new Date() - createdAt) / (1000 * 60 * 60);
  const daysOld = hrsOld / 24;

  // Dynamic status for active shipments
  if (status !== "RECEIVED" && status !== "FAILED") {
    if (daysOld >= 3) {
      status = "OVERDUE";
    } else if (daysOld >= 1) {
      if (status === "SENT" || status === "IN_TRANSITION" || status === "WAITING_RECEIPT") {
        status = "PENDING";
      }
    }
  }

  // Update timeline steps based on top-level status
  const timeline = (dispatch.timeline || []).map(step => {
    let stepStatus = step.status || "PENDING";
    let stepNote = step.note;

    if (stepStatus !== "COMPLETED") {
       if (status === "OVERDUE") {
         stepStatus = "OVERDUE";
         if (!stepNote.includes("(OVERDUE)")) stepNote = stepNote + " (OVERDUE)";
       } else if (status === "PENDING") {
         stepStatus = "PENDING";
         if (!stepNote.includes("(DELAYED)")) stepNote = stepNote + " (DELAYED)";
       }
    }

    return {
      ...step.toObject ? step.toObject() : step,
      status: stepStatus,
      note: stepNote
    };
  });

  return {
    _id: dispatch._id,
    trackingId: dispatch.trackingId,
    fromBranch: dispatch.fromBranchId?.name ?? "External/Unknown",
    toBranch: dispatch.toBranchId?.name ?? "External/Unknown",
    fromBranchCode: dispatch.fromBranchId?.code ?? "N/A",
    toBranchCode: dispatch.toBranchId?.code ?? "N/A",
    fromBranchId: dispatch.fromBranchId?._id || dispatch.fromBranchId,
    toBranchId: dispatch.toBranchId?._id || dispatch.toBranchId,
    category: dispatch.category,
    courierName: dispatch.courierName,
    docketNumber: dispatch.docketNumber,
    description: dispatch.description,
    dispatchDate: dispatch.dispatchDate,
    status: status,
    priority: dispatch.priority,
    geoTrackingEnabled: dispatch.geoTrackingEnabled,
    attachments: dispatch.attachments,
    timeline: timeline,
    createdAt: dispatch.createdAt
  };
};

const syncTimelineWithStatus = (doc, newStatus, user) => {
  doc.status = newStatus;
  
  if (newStatus === "RECEIVED") {
    // 1. Ensure all existing steps are COMPLETED using a fresh array for Mongoose safety
    const updatedTimeline = doc.timeline.map((item) => {
      const plainItem = item.toObject ? item.toObject() : item;
      if (plainItem.status !== "COMPLETED") {
        plainItem.status = "COMPLETED";
        if (!plainItem.date) plainItem.date = new Date();
      }
      return plainItem;
    });

    // 2. Add Delivered step
    const hasDelivered = updatedTimeline.some(t => t.step === "Delivered");
    if (!hasDelivered) {
      updatedTimeline.push({
        step: "Delivered",
        note: `Shipment successfully delivered and verified by ${user?.fullName || "Staff"} at destination.`,
        status: "COMPLETED",
        date: new Date()
      });
    }

    doc.timeline = updatedTimeline;
    doc.markModified("timeline");
  } else if (newStatus === "FAILED") {
    // 1. Mark existing open steps as failed/overdue
    const updatedTimeline = doc.timeline.map((item) => {
      const plainItem = item.toObject ? item.toObject() : item;
      if (plainItem.status !== "COMPLETED") {
        plainItem.status = "PENDING"; 
        if (!plainItem.date) plainItem.date = new Date();
      }
      return plainItem;
    });

    // 2. Add Withdrawn step
    const hasFailed = updatedTimeline.some(t => t.step === "Withdrawn");
    if (!hasFailed) {
      updatedTimeline.push({
        step: "Withdrawn",
        note: `Shipment was withdrawn/cancelled by ${user?.fullName || "Staff"}.`,
        status: "COMPLETED",
        date: new Date()
      });
    }

    doc.timeline = updatedTimeline;
    doc.markModified("timeline");
  }
};

// Build query scoped to a user's branch (STAFF) or company branches (ADMIN)
export const buildScopeQuery = async (user) => {
  if (!user || typeof user !== "object") return { _id: null };

  const role = user.role || "UNKNOWN";
  const companyId = user.companyId;
  const branchId = user.branchId;

  if (role === "ADMIN") {
    if (!companyId) return { _id: null };
    // Admin sees everything related to their company's branches
    const companyBranches = await Branch.find({ companyId }).select("_id").lean();
    const branchIds = companyBranches.map((b) => b._id);
    return { 
      $or: [
        { fromBranchId: { $in: branchIds } }, 
        { toBranchId: { $in: branchIds } }
      ] 
    };
  }
  
  // Staff only sees dispatches involving their branch
  if (user.branchId) {
    return { 
      $or: [
        { fromBranchId: user.branchId }, 
        { toBranchId: user.branchId }
      ] 
    };
  }
  
  return { _id: null };
};

export const listDispatches = async (req, res, next) => {
  try {
    const { status = "ALL", q = "" } = req.query;
    const statusFilter = statusMap[status] ?? null;

    const scopeQuery = await buildScopeQuery(req.user);
    const query = statusFilter ? { ...scopeQuery, status: statusFilter } : scopeQuery;

    const dispatches = await Dispatch.find(query)
      .populate("fromBranchId", "name code")
      .populate("toBranchId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    const search = q.trim().toLowerCase();
    const filtered = search
      ? dispatches.filter((d) => {
          const haystack = `${d.trackingId} ${d.category} ${d.fromBranchId?.name ?? ""} ${d.toBranchId?.name ?? ""}`.toLowerCase();
          return haystack.includes(search);
        })
      : dispatches;

    res.json(filtered.map(toDto));
  } catch (error) {
    next(error);
  }
};

export const getDispatchById = async (req, res, next) => {
  try {
    const scopeQuery = await buildScopeQuery(req.user);
    const dispatch = await Dispatch.findOne({ _id: req.params.id, ...scopeQuery })
      .populate("fromBranchId", "name code")
      .populate("toBranchId", "name code")
      .lean();

    if (!dispatch) {
      return res.status(404).json({ message: "Dispatch not found or access denied" });
    }

    res.json(toDto(dispatch));
  } catch (error) {
    next(error);
  }
};

const buildTrackingId = () => `BF-${Math.floor(100000 + Math.random() * 899999)}`;

export const createDispatch = async (req, res, next) => {
  try {
    const { fromBranchId, toBranchId, category, courierName, description, dispatchDate, geoTrackingEnabled, docketNumber } = req.body;

    if (!fromBranchId || !toBranchId || !category || !courierName || !dispatchDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Security check: Verify branches belong to user's company
    const [fromBranch, toBranch, company] = await Promise.all([
      Branch.findOne({ _id: fromBranchId, companyId: req.user.companyId }),
      Branch.findOne({ _id: toBranchId, companyId: req.user.companyId }),
      Company.findById(req.user.companyId)
    ]);

    if (!fromBranch || !toBranch) {
      return res.status(403).json({ message: "Invalid branch selection for your company" });
    }

    // Role-based check: Staff must send from their own branch
    if (req.user.role === "STAFF" && !fromBranch._id.equals(req.user.branchId)) {
      return res.status(403).json({ message: "You can only initiate dispatches from your assigned branch" });
    }

    const newDispatch = await Dispatch.create({
      trackingId: buildTrackingId(),
      fromBranchId,
      toBranchId,
      category,
      courierName,
      docketNumber: docketNumber ?? "",
      description: description ?? "",
      dispatchDate,
      geoTrackingEnabled: geoTrackingEnabled ?? true,
      status: "SENT",
      timeline: [
        { step: "Initiated", note: "Dispatch record created.", status: "COMPLETED", date: new Date() },
        { step: "Status Update", note: `En route to ${toBranch.name}`, status: "IN_PROGRESS", date: new Date() },
        { step: "Awaiting Receipt", note: "Waiting for destination acknowledgment.", status: "PENDING" }
      ]
    });

    const populated = await Dispatch.findById(newDispatch._id)
      .populate("fromBranchId", "name code")
      .populate("toBranchId", "name code")
      .lean();

    // Trigger email alert in the background
    try {
      const destUsers = await User.find({ branchId: toBranchId }).select("email fullName").lean();
      const destEmails = destUsers.map(u => u.email).filter(Boolean);
      
      // Only include destination branch staff as recipients
      const allRecipients = Array.from(new Set([...destEmails])).filter(Boolean);

      console.log(`[Email Dispatch] Target Branch: ${toBranchId}, Found ${destUsers.length} staff members.`);
      console.log(`[Email Dispatch] Recipients: ${allRecipients.join(', ')}`);

      if (allRecipients.length > 0) {
        sendDispatchEmail(allRecipients, populated, populated.fromBranchId?.name, populated.toBranchId?.name).catch(err => {
            console.error('[Email Dispatch] Async Error:', err.message);
        });
      } else {
        console.warn(`[Email Dispatch] No recipients found at target branch. No email sent.`);
      }
    } catch (err) {
      console.error('[Email Dispatch] Trigger Error:', err.message);
    }

    res.status(201).json(toDto(populated));
  } catch (error) {
    next(error);
  }
};

export const updateDispatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["RECEIVED", "IN_TRANSIT", "WAITING_RECEIPT", "OVERDUE", "PENDING", "SENT", "FAILED"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status code" });
    }

    const scopeQuery = await buildScopeQuery(req.user);
    const doc = await Dispatch.findOne({ _id: req.params.id, ...scopeQuery });
    if (!doc) {
      return res.status(404).json({ message: "Dispatch not found or unauthorized" });
    }

    syncTimelineWithStatus(doc, status, req.user);

    await doc.save();
    const updated = await Dispatch.findById(doc._id)
      .populate("fromBranchId", "name code")
      .populate("toBranchId", "name code")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Dispatch not found or unauthorized" });
    }

    // Send email notification to both branches on status change
    try {
      const fromBranchId = updated.fromBranchId?._id || doc.fromBranchId;
      const toBranchId = updated.toBranchId?._id || doc.toBranchId;

      const [fromStaff, toStaff] = await Promise.all([
        User.find({ branchId: fromBranchId }).select("email").lean(),
        User.find({ branchId: toBranchId }).select("email").lean()
      ]);

      const allEmails = Array.from(new Set([
        ...fromStaff.map(u => u.email),
        ...toStaff.map(u => u.email)
      ])).filter(Boolean);

      console.log(`[Status Update Email] Status: ${status}, Recipients: ${allEmails.join(', ')}`);

      if (allEmails.length > 0) {
        sendStatusUpdateEmail(
          allEmails,
          updated,
          updated.fromBranchId?.name || 'Unknown',
          updated.toBranchId?.name || 'Unknown',
          status,
          req.user?.fullName
        ).catch(err => console.error('[Status Update Email] Error:', err.message));
      }
    } catch (emailErr) {
      console.error('[Status Update Email] Trigger Error:', emailErr.message);
    }

    res.json(toDto(updated));
  } catch (error) {
    next(error);
  }
};

export const updateDispatch = async (req, res, next) => {
  try {
    const { 
      category, 
      courierName, 
      description, 
      dispatchDate, 
      geoTrackingEnabled, 
      toBranchId,
      status 
    } = req.body;

    const scopeQuery = await buildScopeQuery(req.user);
    const updateData = {};
    if (category) updateData.category = category;
    if (courierName) updateData.courierName = courierName;
    if (description !== undefined) updateData.description = description;
    if (dispatchDate) updateData.dispatchDate = dispatchDate;
    if (geoTrackingEnabled !== undefined) updateData.geoTrackingEnabled = geoTrackingEnabled;
    if (toBranchId) updateData.toBranchId = toBranchId;

    const doc = await Dispatch.findOne({ _id: req.params.id, ...scopeQuery });
    if (!doc) {
      return res.status(404).json({ message: "Dispatch record not found or unauthorized" });
    }

    // Apply basic updates
    Object.keys(updateData).forEach(key => {
      if (key !== 'status') doc[key] = updateData[key];
    });

    // Handle status with timeline sync
    if (status) {
      syncTimelineWithStatus(doc, status, req.user);
    }

    await doc.save();
    const updated = await Dispatch.findById(doc._id)
      .populate("fromBranchId", "name code")
      .populate("toBranchId", "name code")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Dispatch record not found or unauthorized" });
    }

    res.json(toDto(updated));
  } catch (error) {
    next(error);
  }
};

export const deleteDispatch = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Deletion is restricted to administrators" });
    }

    const scopeQuery = await buildScopeQuery(req.user);
    const dispatch = await Dispatch.findOneAndDelete({ _id: req.params.id, ...scopeQuery });
    
    if (!dispatch) {
      return res.status(404).json({ message: "Dispatch record not found" });
    }
    res.json({ message: "Dispatch record removed from network" });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteDispatches = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bulk deletion is restricted to administrators" });
    }

    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "ids array is required" });
    }

    const scopeQuery = await buildScopeQuery(req.user);
    const result = await Dispatch.deleteMany({ _id: { $in: ids }, ...scopeQuery });
    
    res.json({ message: `${result.deletedCount} dispatch records removed from network` });
  } catch (error) {
    next(error);
  }
};

