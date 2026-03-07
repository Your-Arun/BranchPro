import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

export const ScreenLayout = ({ title, right, loading, error, children }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View>{right}</View>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: { color: colors.text, fontSize: 34, fontWeight: "800" },
  scroll: { padding: 18, paddingBottom: 120, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: colors.danger, marginBottom: 8 }
});
