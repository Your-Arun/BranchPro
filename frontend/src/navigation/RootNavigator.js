import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors } from "../theme/colors";
import { CreateDispatchScreen } from "../screens/CreateDispatchScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DispatchDetailsScreen } from "../screens/DispatchDetailsScreen";
import { IncomingScreen } from "../screens/IncomingScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { useAppData } from "../utils/AppDataContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        lazy: false,
        tabBarStyle: { 
          backgroundColor: "#08152f", 
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: 10,
          height: 65,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size, focused }) => {
          const map = {
            Dashboard: "grid",
            Incoming: "download",
            Dispatch: "add",
            Profile: "person"
          };

          if (route.name === "Dispatch") {
            return (
              <Ionicons
                name={map[route.name]}
                size={focused ? 30 : 26}
                color={colors.text}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 18,
                  width: 36,
                  height: 36,
                  textAlign: "center",
                  textAlignVertical: "center",
                  overflow: "hidden"
                }}
              />
            );
          }

          return <Ionicons name={map[route.name]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Incoming" component={IncomingScreen} options={{ tabBarLabel: "Receive" }} />
      <Tab.Screen name="Dispatch" component={CreateDispatchScreen} options={{ tabBarLabel: "Send" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { userAuth } = useAppData();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userAuth ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="DispatchDetails"
            component={DispatchDetailsScreen}
            options={{ presentation: "modal" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }
});
