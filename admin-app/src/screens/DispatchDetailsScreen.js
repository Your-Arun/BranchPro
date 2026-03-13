import { useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const dotColor = {
  COMPLETED: colors.success,
  IN_PROGRESS: colors.primary,
  PENDING: colors.muted
};

export const DispatchDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { dispatches, updateStatus, refresh } = useAppData();

  const item = useMemo(() => dispatches.find((d) => d._id === id), [dispatches, id]);

  if (!item) {
    return (
      <View style={[styles.safe, styles.center]}>
        <Text style={styles.title}>Dispatch not found</Text>
      </View>
    );
  }

  const onConfirm = async () => {
    try {
      await updateStatus(item._id, "RECEIVED");
      await refresh();
      Alert.alert("Updated", "Dispatch marked as received");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Failed", e.response?.data?.message || e.message);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Dispatch Details</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.code}>TRACKING ID: {item.trackingId}</Text>
        <Text style={styles.sub}>{item.fromBranch} ? {item.toBranch}</Text>
      </View>

      <Text style={styles.section}>Movement Status</Text>
      {(item.timeline || []).map((t, idx) => (
        <View key={`${t.step}-${idx}`} style={styles.timelineRow}>
          <View style={[styles.timelineDot, { backgroundColor: dotColor[t.status] || colors.muted }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.step, t.status === "IN_PROGRESS" && { color: colors.primary }]}>{t.step}</Text>
            <Text style={styles.stepSub}>{t.note}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Attachments</Text>
      <View style={styles.files}>
        {(item.attachments || []).map((a, idx) => (
          <View key={`${a.fileName}-${idx}`} style={styles.fileCard}>
            <Ionicons name={a.type === "PDF" ? "document-text" : "image"} size={18} color={colors.primary} />
            <View>
              <Text style={styles.fileName}>{a.fileName}</Text>
              <Text style={styles.fileSize}>{a.sizeMb} MB</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={onConfirm}>
        <Ionicons name="checkmark-circle" size={20} color={colors.text} />
        <Text style={styles.btnText}>Confirm Receive</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingTop: 54, paddingHorizontal: 20, paddingBottom: 24 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  closeBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 34, fontWeight: "800" },
  card: { marginTop: 16, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16 },
  code: { color: colors.primary, fontWeight: "700", fontSize: 15 },
  sub: { color: colors.text, fontWeight: "800", marginTop: 8, fontSize: 20 },
  section: { marginTop: 20, color: colors.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: "700", fontSize: 14 },
  timelineRow: { flexDirection: "row", gap: 12, marginTop: 14, alignItems: "flex-start" },
  timelineDot: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
  step: { color: colors.text, fontWeight: "700", fontSize: 24 },
  stepSub: { color: colors.muted, marginTop: 2, fontSize: 15 },
  files: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  fileCard: { backgroundColor: colors.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 150 },
  fileName: { color: colors.text, fontWeight: "700" },
  fileSize: { color: colors.muted, fontSize: 13 },
  btn: { marginTop: "auto", backgroundColor: colors.primary, borderRadius: 20, padding: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  btnText: { color: colors.text, fontWeight: "800", fontSize: 20 }
});
