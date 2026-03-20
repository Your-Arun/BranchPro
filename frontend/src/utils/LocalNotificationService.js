import * as Device from "expo-device";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import * as Application from "expo-application";

const isExpoGo = Application.applicationId === "host.exp.exponent";

// Local notification service for Expo Go compatibility
export const scheduleLocalNotification = async (title, body, data = {}) => {
  try {
    // Check if we can use local notifications
    if (!Device.isDevice) {
      console.log("Local notifications not available on this device");
      return false;
    }

    // Dynamic import to avoid Expo Go startup errors
    const Notifications = await import("expo-notifications");

    // Request permissions for local notifications
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permissions not granted");
      return false;
    }


    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: null, // Show immediately
    });

    return true;
  } catch (error) {
    console.error("Failed to schedule local notification:", error);
    return false;
  }
};

// Test local notification
export const testLocalNotification = async () => {
  return await scheduleLocalNotification(
    "Test Notification",
    "This is a test notification to verify local notifications work.",
    { type: "test" }
  );
};

// Show in-app notification (fallback)
export const showInAppNotification = (title, message, type = "info") => {
  Toast.show({
    type: type,
    text1: title,
    text2: message,
    position: "bottom",
    visibilityTime: 3000,
  });
};

// Get notification capability status
export const getNotificationCapability = () => {
  const isExpoGo = Platform.OS === "android" && 
    require("expo-application").applicationId === "host.exp.exponent";

  return {
    isExpoGo: isExpoGo,
    canUseLocal: Device.isDevice,
    canUsePush: !isExpoGo && Device.isDevice,
    recommendation: isExpoGo 
      ? "Use development build for push notifications, local notifications available" 
      : "Push notifications available"
  };
};