import * as React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";

export const ScreenLayout = ({ title, right, loading, error, children, scrollable = true }) => {
  const content = (
    <>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {(title || right) ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View>{right}</View>
        </View>
      ) : null}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : scrollable ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>
          {content}
        </View>
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
  scroll: { padding: 18, paddingBottom: 80, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: colors.danger, marginBottom: 8 }
});
