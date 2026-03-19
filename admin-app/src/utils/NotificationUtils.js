import { scheduleLocalNotification, showImmediateNotification } from "./NotificationService";

// Notification types for different events
export const NOTIFICATION_TYPES = {
  DISPATCH_CREATED: "dispatch_created",
  DISPATCH_UPDATED: "dispatch_updated",
  DISPATCH_RECEIVED: "dispatch_received",
  OVERDUE_DISPATCH: "overdue_dispatch",
  SYSTEM_ALERT: "system_alert"
};

// Send dispatch creation notification
export const sendDispatchCreatedNotification = async (dispatch) => {
  await showImmediateNotification(
    "New Shipment Created",
    `Tracking ID: ${dispatch.trackingId}\nFrom: ${dispatch.fromBranch}\nTo: ${dispatch.toBranch}`,
    {
      type: NOTIFICATION_TYPES.DISPATCH_CREATED,
      dispatchId: dispatch._id,
      trackingId: dispatch.trackingId
    }
  );
};

// Send dispatch status update notification
export const sendDispatchStatusNotification = async (dispatch, oldStatus, newStatus) => {
  const statusMessages = {
    "SENT": "Shipment is now in transit",
    "IN_TRANSIT": "Shipment is moving to destination",
    "RECEIVED": "Shipment has been delivered",
    "PENDING": "Shipment is waiting for processing",
    "OVERDUE": "Shipment is overdue - immediate attention required"
  };

  await showImmediateNotification(
    "Shipment Status Updated",
    `${statusMessages[newStatus] || "Status changed"}\nTracking ID: ${dispatch.trackingId}`,
    {
      type: NOTIFICATION_TYPES.DISPATCH_UPDATED,
      dispatchId: dispatch._id,
      trackingId: dispatch.trackingId,
      oldStatus: oldStatus,
      newStatus: newStatus
    }
  );
};

// Send overdue dispatch notification
export const sendOverdueNotification = async (dispatch) => {
  await showImmediateNotification(
    "⚠️ Overdue Shipment Alert",
    `Shipment ${dispatch.trackingId} is overdue!\nFrom: ${dispatch.fromBranch}\nTo: ${dispatch.toBranch}`,
    {
      type: NOTIFICATION_TYPES.OVERDUE_DISPATCH,
      dispatchId: dispatch._id,
      trackingId: dispatch.trackingId
    }
  );
};

// Send system alert notification
export const sendSystemAlertNotification = async (message, priority = "normal") => {
  const title = priority === "high" ? "🚨 System Alert" : "System Notification";
  
  await showImmediateNotification(
    title,
    message,
    {
      type: NOTIFICATION_TYPES.SYSTEM_ALERT,
      priority: priority
    }
  );
};

// Schedule a reminder notification
export const scheduleReminderNotification = async (title, message, delayMinutes = 30, data = {}) => {
  await scheduleLocalNotification(
    title,
    message,
    {
      ...data,
      type: "reminder"
    },
    delayMinutes * 60 // Convert minutes to seconds
  );
};