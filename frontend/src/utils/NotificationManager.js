class NotificationManager {
  constructor() {
    this.capability = null;
    this.pushToken = null;
  }

  async initialize() {
    // Lazy load notification service only when needed
    const { getNotificationCapability } = await import("./LocalNotificationService");
    this.capability = getNotificationCapability();
    
    if (this.capability.canUsePush) {
      // Try to register for push notifications
      const { registerForPushNotificationsAsync } = await import("./NotificationService");
      this.pushToken = await registerForPushNotificationsAsync();
    } else if (this.capability.canUseLocal) {
      // Show guidance for development build
      const { showInAppNotification } = await import("./LocalNotificationService");
      showInAppNotification(
        "Limited Notifications",
        this.capability.recommendation,
        "warning"
      );
    }

    return this.capability;
  }

  async sendNotification(title, body, data = {}) {
    if (this.capability.canUsePush && this.pushToken) {
      // Use push notification (would need backend integration)
      console.log("Sending push notification:", { title, body, token: this.pushToken });
      return { success: true, type: "push" };
    } else if (this.capability.canUseLocal) {
      // Use local notification as fallback
      const { scheduleLocalNotification } = await import("./LocalNotificationService");
      const success = await scheduleLocalNotification(title, body, data);
      return { success, type: success ? "local" : "failed" };
    } else {
      // Use in-app notification as last resort
      const { showInAppNotification } = await import("./LocalNotificationService");
      showInAppNotification(title, body, "info");
      return { success: true, type: "in-app" };
    }
  }

  async testNotifications() {
    const { getNotificationCapability } = await import("./LocalNotificationService");
    const capability = getNotificationCapability();
    
    if (capability.canUsePush) {
      const { registerForPushNotificationsAsync } = await import("./NotificationService");
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const { showInAppNotification } = await import("./LocalNotificationService");
        showInAppNotification(
          "Push Notifications Ready",
          "You will receive shipment updates via push notifications.",
          "success"
        );
        return { success: true, type: "push" };
      }
    }

    if (capability.canUseLocal) {
      const { testLocalNotification, showInAppNotification } = await import("./LocalNotificationService");
      const success = await testLocalNotification();
      if (success) {
        showInAppNotification(
          "Local Notifications Working",
          "Test notification sent successfully.",
          "success"
        );
        return { success: true, type: "local" };
      }
    }

    const { showInAppNotification } = await import("./LocalNotificationService");
    showInAppNotification(
      "Notifications Limited",
      "Please use a development build for full push notification support.",
      "warning"
    );
    return { success: false, type: "limited" };
  }

  async getCapability() {
    if (this.capability) {
      return this.capability;
    }
    const { getNotificationCapability } = await import("./LocalNotificationService");
    return getNotificationCapability();
  }

  isReady() {
    return this.capability !== null;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
