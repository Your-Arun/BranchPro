import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppDataProvider } from "./src/utils/AppDataContext";
import { colors } from "./src/theme/colors";
import Toast from "react-native-toast-message";


const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary
  }
};

const toastConfig = {
  warning: ({ text1, text2 }) => (
    <View style={styles.warningToast}>
      <View style={styles.toastIcon}>
        <Ionicons name="warning" size={20} color={colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.toastTitle}>{text1}</Text>
        <Text style={styles.toastSub}>{text2}</Text>
      </View>
    </View>
  )
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <RootNavigator />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  warningToast: {
    width: "90%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  toastIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.warning}1A`,
    alignItems: "center",
    justifyContent: "center"
  },
  toastTitle: { color: colors.text, fontWeight: "700", fontSize: 16 },
  toastSub: { color: colors.muted, fontSize: 13, marginTop: 2 }
});
