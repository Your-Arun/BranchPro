
import * as React from "react";
import * as Device from "expo-device";
import * as Application from "expo-application";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

// Check if running in Expo Go
const isExpoGo = Application.applicationId === "host.exp.exponent";

export const registerForPushNotificationsAsync = async () => {
  // Check if running in Expo Go on Android
  if (Platform.OS === "android" && isExpoGo) {
    Toast.show({
      type: "warning",
      text1: "Development Build Required",
      text2: "Push notifications require a development build. Please use a development build instead of Expo Go.",
      position: "bottom"
    });
    console.warn("Push notifications not available in Expo Go on Android. Use a development build.");
    return null;
  }

  try {
    // Lazy load expo-notifications only when needed (not in Expo Go)
    const Notifications = await import("expo-notifications");

    // Set up notification handler only for development builds
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        Toast.show({
          type: "info",
          text1: "Push Notifications",
          text2: "We need your permission to send you real-time updates.",
          position: "bottom"
        });
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "You won't receive important shipment notifications.",
          position: "bottom"
        });
        return null;
      }

      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: "7aba52b7-91d7-471a-98a1-9903ebce01fe", // Taken from app.json
        })).data;
        console.log("Expo Push Token:", token);
        
        // Success toast for development build users
        Toast.show({
          type: "success",
          text1: "Notifications Enabled",
          text2: "You'll receive shipment updates in real-time.",
          position: "bottom"
        });
      } catch (e) {
        console.log("Failed to get push token", e);
        Toast.show({
          type: "error",
          text1: "Notification Setup Failed",
          text2: "Please try again or check your internet connection.",
          position: "bottom"
        });
      }
    }

    return token;
  } catch (error) {
    console.log("Failed to load expo-notifications:", error);
    return null;
  }
};

// Helper function to check if notifications are supported
export const isNotificationSupported = () => {
  return !(Platform.OS === "android" && isExpoGo);
};

// Helper function to get notification setup status
export const getNotificationStatus = () => {
  if (Platform.OS === "android" && isExpoGo) {
    return {
      supported: false,
      message: "Push notifications require a development build. Please use a development build instead of Expo Go.",
      action: "Create development build"
    };
  }
  
  return {
    supported: true,
    message: "Push notifications are supported on this device.",
    action: "Enable notifications"
  };
};
