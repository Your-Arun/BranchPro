import * as Device from "expo-device";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// Configure notification handler - this works in Expo Go too for local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Local notification scheduling function
export const scheduleLocalNotification = async (title, body, data = {}, seconds = 1) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
      },
      trigger: { seconds: seconds },
    });
  } catch (error) {
    console.log("Failed to schedule local notification:", error);
  }
};

// Show immediate notification
export const showImmediateNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: data,
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.log("Failed to show immediate notification:", error);
  }
};

// Request permissions and get push token for remote notifications
export const registerForPushNotificationsAsync = async () => {
  let token;

  // Check if we're running in Expo Go for warning purposes only
  const isExpoGo = Constants.appOwnership === 'expo';

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: "default",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "You won't receive shipment notifications. Enable in Settings.",
        position: "bottom"
      });
      return null;
    }

    try {
      // Remote Push Tokens are tricky in Expo Go, but local ones always work.
      // We try to get the token anyway.
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? "f2513b70-b448-4c5b-9946-e1b532541f61";
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log("Remote push token registration failed (Expected in some dev environments):", e.message);
      if (isExpoGo) {
         console.log("Push notifications in Expo Go require specific configuration. Local notifications will still work.");
      }
    }
  } else {
    console.log("Physical device required for remote push notifications.");
  }

  return token;
};

// Handle notification responses (when user taps on notification)
export const handleNotificationResponse = (response) => {
  const data = response.notification.request.content.data;
  console.log("Notification tapped:", data);
  
  if (data.type === "dispatch_update") {
    console.log("Navigating to dispatch details:", data.dispatchId);
  }
};

// Add listener for notification responses
Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

