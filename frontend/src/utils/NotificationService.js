
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

// Check if running in Expo Go
const isExpoGo = Application.applicationId === "host.exp.exponent";

export const registerForPushNotificationsAsync = async () => {
  // Check if running in Expo Go (limitations in SDK 54+)
  if (isExpoGo) {
    console.log("Push notifications not available in Expo Go. Use a development build.");
    return null;
  }

  try {
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
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? "996d0de3-8166-42bd-a5ae-b96ad5fc6dca";
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
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
        // Only show error toast if NOT in Expo Go (where it's expected to fail)
        if (!isExpoGo) {
          Toast.show({
            type: "error",
            text1: "Notification Setup Failed",
            text2: "Please try again or check your internet connection.",
            position: "bottom"
          });
        }
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
