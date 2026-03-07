import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors } from "../theme/colors";
import { BranchesScreen } from "../screens/BranchesScreen";
import { CreateDispatchScreen } from "../screens/CreateDispatchScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { DispatchDetailsScreen } from "../screens/DispatchDetailsScreen";
import { IncomingScreen } from "../screens/IncomingScreen";
import { ReportsScreen } from "../screens/ReportsScreen";
import { UsersSettingsScreen } from "../screens/UsersSettingsScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignupScreen } from "../screens/SignupScreen";
import { useAppData } from "../utils/AppDataContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// MainTabs ko userRole pass kiya
const MainTabs = ({ userRole }) => {
  // Check karte hain ki user Admin ya Manager hai kya
  const isAdmin = userRole === "ADMIN";

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
            Branches: "business",
            Reports: "stats-chart",
            Settings: "settings"
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
      {/* ---------------- COMMON TABS (Dono ko dikhenge) ---------------- */}
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Incoming" component={IncomingScreen} options={{ tabBarLabel: "In (Receive)" }} />
      <Tab.Screen name="Dispatch" component={CreateDispatchScreen} options={{ tabBarLabel: "Out (Send)" }} />

      {/* ---------------- ADMIN ONLY TABS ---------------- */}
      {isAdmin && (
        <>
          <Tab.Screen name="Branches" component={BranchesScreen} />
          <Tab.Screen name="Reports" component={ReportsScreen} />
          <Tab.Screen name="Settings" component={UsersSettingsScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { userAuth } = useAppData();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userAuth ? (
        <>
          {/* MainTabs ko user ka role bhej rahe hain */}
          <Stack.Screen name="Main">
            {() => <MainTabs userRole={userAuth.role} />}
          </Stack.Screen>
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
