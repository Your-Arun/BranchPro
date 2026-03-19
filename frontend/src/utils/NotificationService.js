import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
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
      return;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: "7aba52b7-91d7-471a-98a1-9903ebce01fe", // Taken from app.json
      })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log("Failed to get push token", e);
    }
  }

  return token;
};
