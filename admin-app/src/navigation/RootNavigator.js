import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors } from "../theme/colors";
import { BranchesScreen } from "../screens/BranchesScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DispatchDetailsScreen } from "../screens/DispatchDetailsScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { UsersSettingsScreen } from "../screens/UsersSettingsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { CompanySetupScreen } from "../screens/CompanySetupScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { useAppData } from "../utils/AppDataContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();



const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 5 },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Overview: "analytics",
            Branches: "business",
            Staff: "people",
            Reports: "stats-chart",
            Profile: "settings"
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Overview" component={DashboardScreen} />
      <Tab.Screen name="Branches" component={BranchesScreen} />
      <Tab.Screen name="Staff" component={UsersSettingsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { userAuth, company, loading } = useAppData();

  if (loading && !userAuth) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userAuth ? (
        !company && userAuth.role === "ADMIN" ? (
          <Stack.Screen name="CompanySetup" component={CompanySetupScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="DispatchDetails"
              component={DispatchDetailsScreen}
              options={{ presentation: "modal" }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};


