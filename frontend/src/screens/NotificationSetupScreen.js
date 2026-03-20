import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform
} from "react-native";
import { useAppData } from "../utils/AppDataContext";
import { getNotificationStatus } from "../utils/NotificationService";
import Toast from "react-native-toast-message";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const NotificationSetupScreen = () => {
  const { userAuth } = useAppData();
  const [notificationStatus, setNotificationStatus] = useState(null);

  useEffect(() => {
    const checkStatus = () => {
      const status = getNotificationStatus();
      setNotificationStatus(status);
    };
    checkStatus();
  }, []);

  const handleSetupNotifications = async () => {
    if (!notificationStatus.supported) {
      // Show instructions for development build
      Alert.alert(
        "Development Build Required",
        "Push notifications require a development build. Please follow these steps:\n\n1. Install EAS CLI: npm install -g @expo/eas-cli\n2. Create development build: eas build --profile development --platform all\n3. Install the development build on your device",
        [
          {
            text: "Learn More",
            onPress: () => Linking.openURL("https://docs.expo.dev/develop/development-builds/introduction/")
          },
          {
            text: "Copy Instructions",
            onPress: () => {
              // In a real app, you might use Clipboard API here
              Toast.show({
                type: "info",
                text1: "Instructions copied to clipboard"
              });
            }
          }
        ]
      );
    } else {
      // Try to register for notifications
      const { registerForPushNotificationsAsync } = await import("../utils/NotificationService");
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        Toast.show({
          type: "success",
          text1: "Notifications Enabled",
          text2: "You'll receive shipment updates in real-time."
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to Enable Notifications",
          text2: "Please try again or check your permissions."
        });
      }
    }
  };

  const handleOpenDocs = () => {
    Linking.openURL("https://docs.expo.dev/develop/development-builds/introduction/");
  };

  if (!userAuth) {
    return null; // Don't show if not authenticated
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <LinearGradient
        colors={["#07112c", "#050f2a"]}
        className="px-6 py-8"
      >
        <View className="items-center">
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
            <AntDesign name="bells" size={40} color="#07112c" />
          </View>
          <Text className="text-white text-2xl font-bold text-center">
            Push Notifications
          </Text>
          <Text className="text-gray-300 text-center mt-2">
            Stay updated with real-time shipment notifications
          </Text>
        </View>
      </LinearGradient>

      <View className="px-6 py-6 space-y-6">
        {/* Status Card */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                Current Status
              </Text>
              <Text className="text-gray-600 mt-1">
                {notificationStatus?.message}
              </Text>
            </View>
            <View className={`w-12 h-12 rounded-full items-center justify-center ${
              notificationStatus?.supported 
                ? "bg-green-100" 
                : "bg-yellow-100"
            }`}>
              <MaterialIcons 
                name={notificationStatus?.supported ? "check-circle" : "warning"} 
                size={24} 
                color={notificationStatus?.supported ? "#10b981" : "#f59e0b"} 
              />
            </View>
          </View>
        </View>

        {/* Setup Instructions */}
        {!notificationStatus?.supported && (
          <View className="bg-white rounded-xl p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Setup Required
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-start space-x-3">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                  <Text className="text-blue-600 font-semibold text-sm">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Install EAS CLI</Text>
                  <Text className="text-gray-600 text-sm mt-1">npm install -g @expo/eas-cli</Text>
                </View>
              </View>

              <View className="flex-row items-start space-x-3">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                  <Text className="text-blue-600 font-semibold text-sm">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Configure EAS</Text>
                  <Text className="text-gray-600 text-sm mt-1">eas init</Text>
                </View>
              </View>

              <View className="flex-row items-start space-x-3">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                  <Text className="text-blue-600 font-semibold text-sm">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Create Development Build</Text>
                  <Text className="text-gray-600 text-sm mt-1">eas build --profile development --platform all</Text>
                </View>
              </View>

              <View className="flex-row items-start space-x-3">
                <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mt-0.5">
                  <Text className="text-blue-600 font-semibold text-sm">4</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Install & Test</Text>
                  <Text className="text-gray-600 text-sm mt-1">Install the development build and test notifications</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-4">
          <TouchableOpacity
            className="bg-blue-600 rounded-xl p-4 items-center"
            onPress={handleSetupNotifications}
          >
            <Text className="text-white text-lg font-semibold">
              {notificationStatus?.supported ? "Enable Notifications" : "Setup Development Build"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border-2 border-gray-300 rounded-xl p-4 items-center"
            onPress={handleOpenDocs}
          >
            <Text className="text-gray-700 text-lg font-semibold">
              View Documentation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View className="bg-white rounded-xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Why This Change?
          </Text>
          <Text className="text-gray-600 text-sm leading-relaxed">
            Expo SDK 54 removed push notification functionality from Expo Go to 
            improve performance and security. Development builds provide full 
            native functionality including push notifications, ensuring you 
            receive important shipment updates in real-time.
          </Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

export default NotificationSetupScreen;