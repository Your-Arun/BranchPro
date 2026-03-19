import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

// Set up notification handler for mobile devices
if (Device.isDevice) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Local notification scheduling function
export const scheduleLocalNotification = async (title, body, data = {}, seconds = 1) => {
  if (!Device.isDevice) {
    console.log("Local notifications not available on simulator/emulator");
    return;
  }

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
  if (!Device.isDevice) {
    console.log("Immediate notifications not available on simulator/emulator");
    return;
  }

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

  // Check if we're running in Expo Go
  const isExpoGo = !Device.isDevice || __DEV__;
  
  if (isExpoGo) {
    console.log("Running in Expo Go - remote push notifications disabled");
    Toast.show({
      type: "info",
      text1: "Expo Go Limitation",
      text2: "Remote push notifications require a development build. Use 'expo run:android' or 'expo run:ios' for full functionality.",
      position: "bottom"
    });
    
    // For development, we can still use local notifications
    return null;
  }

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
      Toast.show({
        type: "info",
        text1: "Push Notifications",
        text2: "Enable notifications to receive shipment updates and alerts.",
        position: "bottom"
      });
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "You won't receive shipment notifications. Enable in Settings > Notifications.",
        position: "bottom"
      });
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: "f2513b70-b448-4c5b-9946-e1b532541f61",
      })).data;
      console.log("Expo Push Token:", token);
      
      Toast.show({
        type: "success",
        text1: "Notifications Enabled",
        text2: "You'll receive shipment updates and alerts.",
        position: "bottom"
      });
    } catch (e) {
      console.log("Failed to get push token", e);
      Toast.show({
        type: "error",
        text1: "Notification Error",
        text2: "Unable to register for push notifications.",
        position: "bottom"
      });
    }
  } else {
    Toast.show({ 
      type: "info", 
      text1: "Simulator/Emulator", 
      text2: "Push notifications require a physical device." 
    });
  }

  return token;
};

// Handle notification responses (when user taps on notification)
export const handleNotificationResponse = (response) => {
  const data = response.notification.request.content.data;
  console.log("Notification tapped:", data);
  
  // You can navigate to specific screens based on notification data
  // For example, navigate to dispatch details if it's a dispatch notification
  if (data.type === "dispatch_update") {
    // Navigate to dispatch details screen
    console.log("Navigating to dispatch details:", data.dispatchId);
  }
};

// Set up notification response handler
if (Device.isDevice) {
  Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
}
