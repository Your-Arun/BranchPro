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
import { useAppData } from "../utils/AppDataContext";
import { View, Text, Pressable, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Simple Profile Screen for Logout
const ProfileScreen = () => {
  const { userAuth, logout } = useAppData();
  return (
    <View style={styles.profileContainer}>
      <Ionicons name="person-circle" size={80} color={colors.primary} />
      <Text style={styles.profileName}>{userAuth?.fullName}</Text>
      <Text style={styles.profileRole}>{userAuth?.role}</Text>
      <Text style={styles.profileBranch}>{userAuth?.branch?.name || "No Branch"}</Text>
      
      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#08152f", borderTopColor: colors.border, height: 72, paddingBottom: 8, paddingTop: 8 },
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
  profileContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 20 },
  profileName: { color: colors.text, fontSize: 24, fontWeight: "bold", marginTop: 10 },
  profileRole: { color: colors.primary, fontSize: 16, marginTop: 4, fontWeight: "600" },
  profileBranch: { color: colors.muted, fontSize: 14, marginTop: 4 },
  logoutBtn: { marginTop: 40, backgroundColor: "#ff444433", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, borderWidth: 1, borderColor: "#ff4444" },
  logoutText: { color: "#ff4444", fontWeight: "bold", fontSize: 16 }
});
