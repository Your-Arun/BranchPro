import { Branch } from "../models/Branch.js";
import { Dispatch } from "../models/Dispatch.js";

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
  
  // Dynamic Overdue calculation: If not received and older than 24 hours
  if (status !== "RECEIVED" && status !== "PENDING" && status !== "FAILED") {
    const createdAt = dispatch.createdAt instanceof Date ? dispatch.createdAt : new Date(dispatch.createdAt);
    const hrsOld = (new Date() - createdAt) / (1000 * 60 * 60);
    if (hrsOld > 24) {
      status = "OVERDUE";
    }
  }

  return {
    _id: dispatch._id,
    trackingId: dispatch.trackingId,
    fromBranch: dispatch.fromBranchId?.name ?? "External/Unknown",
    toBranch: dispatch.toBranchId?.name ?? "External/Unknown",
    fromBranchId: dispatch.fromBranchId?._id || dispatch.fromBranchId,
    toBranchId: dispatch.toBranchId?._id || dispatch.toBranchId,
    category: dispatch.category,
    courierName: dispatch.courierName,
    description: dispatch.description,
    dispatchDate: dispatch.dispatchDate,
    status: status,
    priority: dispatch.priority,
    geoTrackingEnabled: dispatch.geoTrackingEnabled,
    attachments: dispatch.attachments,
    timeline: dispatch.timeline,
    createdAt: dispatch.createdAt
  };
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
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
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
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
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
    const { fromBranchId, toBranchId, category, courierName, description, dispatchDate, geoTrackingEnabled } = req.body;

    if (!fromBranchId || !toBranchId || !category || !courierName || !dispatchDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Security check: Verify branches belong to user's company
    const [fromBranch, toBranch] = await Promise.all([
      Branch.findOne({ _id: fromBranchId, companyId: req.user.companyId }),
      Branch.findOne({ _id: toBranchId, companyId: req.user.companyId })
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
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
      .lean();

    res.status(201).json(toDto(populated));
  } catch (error) {
    next(error);
  }
};

export const updateDispatchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["RECEIVED", "IN_TRANSIT", "WAITING_RECEIPT", "OVERDUE", "PENDING", "SENT"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status code" });
    }

    const scopeQuery = await buildScopeQuery(req.user);
    const update = { status };

    if (status === "RECEIVED") {
      update.$push = {
        timeline: {
          step: "Received",
          note: "Shipment successfully received and verified at destination.",
          status: "COMPLETED",
          date: new Date()
        }
      };
      // Mark previous steps as COMPLETED if they were not
      await Dispatch.updateOne(
        { _id: req.params.id, ...scopeQuery, "timeline.status": "IN_PROGRESS" },
        { $set: { "timeline.$.status": "COMPLETED", "timeline.$.date": new Date() } }
      );
    }

    const updated = await Dispatch.findOneAndUpdate(
      { _id: req.params.id, ...scopeQuery }, 
      update, 
      { new: true }
    )
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Dispatch not found or unauthorized" });
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

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Editing dispatch details is restricted to administrators" });
    }

    const scopeQuery = await buildScopeQuery(req.user);
    const updateData = {};
    if (category) updateData.category = category;
    if (courierName) updateData.courierName = courierName;
    if (description !== undefined) updateData.description = description;
    if (dispatchDate) updateData.dispatchDate = dispatchDate;
    if (geoTrackingEnabled !== undefined) updateData.geoTrackingEnabled = geoTrackingEnabled;
    if (toBranchId) updateData.toBranchId = toBranchId;
    if (status) updateData.status = status;

    const updated = await Dispatch.findOneAndUpdate(
      { _id: req.params.id, ...scopeQuery },
      { $set: updateData },
      { new: true }
    )
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
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

