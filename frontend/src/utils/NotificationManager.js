import * as Notifications from "expo-notifications";
import { getNotificationCapability, scheduleLocalNotification, showInAppNotification, testLocalNotification } from "./LocalNotificationService";
import { registerForPushNotificationsAsync } from "./NotificationService";

class NotificationManager {
  constructor() {
    this.capability = null;
    this.pushToken = null;
  }

  async initialize() {
    // Configure global behavior for foreground notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    this.capability = getNotificationCapability();
    
    try {
      if (this.capability.canUsePush) {
        this.pushToken = await registerForPushNotificationsAsync();
      } else if (this.capability.canUseLocal) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log("Local notification permissions not granted");
        }
      }
    } catch (error) {
      console.log("Notification initialization error:", error);
    }

    return this.capability;
  }

  async sendNotification(title, body, data = {}) {
    if (this.capability?.canUsePush && this.pushToken) {
      console.log("Sending push notification:", { title, body, token: this.pushToken });
      return { success: true, type: "push" };
    } else if (this.capability?.canUseLocal) {
      const success = await scheduleLocalNotification(title, body, data);
      return { success, type: success ? "local" : "failed" };
    } else {
      showInAppNotification(title, body, "info");
      return { success: true, type: "in-app" };
    }
  }

  async testNotifications() {
    const capability = getNotificationCapability();
    
    if (capability.canUsePush) {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        showInAppNotification(
          "Push Notifications Ready",
          "You will receive shipment updates via push notifications.",
          "success"
        );
        return { success: true, type: "push" };
      }
    }

    if (capability.canUseLocal) {
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

    showInAppNotification(
      "Notifications Limited",
      "Please use a development build for full push notification support.",
      "warning"
    );
    return { success: false, type: "limited" };
  }

  async getCapability() {
    if (this.capability) return this.capability;
    return getNotificationCapability();
  }

  isReady() {
    return this.capability !== null;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;
