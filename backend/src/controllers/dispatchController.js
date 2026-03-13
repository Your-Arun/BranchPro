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

const toDto = (dispatch) => ({
  _id: dispatch._id,
  trackingId: dispatch.trackingId,
  fromBranch: dispatch.fromBranchId?.name ?? "",
  toBranch: dispatch.toBranchId?.name ?? "",
  category: dispatch.category,
  courierName: dispatch.courierName,
  description: dispatch.description,
  dispatchDate: dispatch.dispatchDate,
  status: dispatch.status,
  priority: dispatch.priority,
  geoTrackingEnabled: dispatch.geoTrackingEnabled,
  attachments: dispatch.attachments,
  timeline: dispatch.timeline,
  createdAt: dispatch.createdAt
});

export const listDispatches = async (req, res, next) => {
  try {
    const { status = "ALL", q = "" } = req.query;
    const statusFilter = statusMap[status] ?? null;

    const query = statusFilter ? { status: statusFilter } : {};
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
    const dispatch = await Dispatch.findById(req.params.id)
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
      .lean();

    if (!dispatch) {
      return res.status(404).json({ message: "Dispatch not found" });
    }

    res.json(toDto(dispatch));
  } catch (error) {
    next(error);
  }
};

const buildTrackingId = () => `BF-${Math.floor(10000 + Math.random() * 89999)}`;

export const createDispatch = async (req, res, next) => {
  try {
    const { fromBranchId, toBranchId, category, courierName, description, dispatchDate, geoTrackingEnabled } = req.body;

    if (!fromBranchId || !toBranchId || !category || !courierName || !dispatchDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [fromBranch, toBranch] = await Promise.all([Branch.findById(fromBranchId), Branch.findById(toBranchId)]);
    if (!fromBranch || !toBranch) {
      return res.status(400).json({ message: "Invalid branch selection" });
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
        { step: "Dispatched", note: "Shipment created", status: "COMPLETED", date: new Date() },
        { step: "In Transit", note: `En route to ${toBranch.name}`, status: "IN_PROGRESS", date: new Date() },
        { step: "Waiting for Receipt", note: "Awaiting digital signature", status: "PENDING" }
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
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Dispatch.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate("fromBranchId", "name")
      .populate("toBranchId", "name")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Dispatch not found" });
    }

    res.json(toDto(updated));
  } catch (error) {
    next(error);
  }
};

export const deleteDispatch = async (req, res, next) => {
  try {
    const dispatch = await Dispatch.findByIdAndDelete(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: "Dispatch not found" });
    }
    res.json({ message: "Dispatch removed" });
  } catch (error) {
    next(error);
  }
};
