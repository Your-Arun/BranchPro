import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppDataProvider } from "./src/utils/AppDataContext";
import { colors } from "./src/theme/colors";

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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" backgroundColor="transparent" translucent />
          <RootNavigator />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
