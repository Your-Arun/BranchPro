import * as React from "react";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

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
  const { dispatches, updateStatus, refresh, userAuth } = useAppData();
  const [loading, setLoading] = useState(false);

  const item = useMemo(() => dispatches.find((d) => d._id === id), [dispatches, id]);

  if (!item) {
    return (
      <View style={[styles.safe, styles.center]}>
        <Text style={styles.title}>Dispatch not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
           <Text style={{color: colors.primary, marginTop: 20}}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Staff can only confirm if they are the destination branch and it's not already received
  const isDestination = item.toBranch === userAuth?.branch?.name;
  const canConfirm = isDestination && item.status !== "RECEIVED";

  const onConfirm = async () => {
    try {
      setLoading(true);
      await updateStatus(item._id, "RECEIVED");
      await refresh();
      Toast.show({ type: "success", text1: "Success", text2: "Shipment marked as RECEIVED and finalized." });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shipment</Text>
          <Text style={styles.subtitle}>ID: {item.trackingId}</Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.routeRow}>
          <View style={styles.routeNode}>
            <Text style={styles.routeLabel}>FROM</Text>
            <Text style={styles.routeName}>{item.fromBranch}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} style={{ marginTop: 20 }} />
          <View style={[styles.routeNode, { alignItems: "flex-end" }]}>
            <Text style={styles.routeLabel}>TO</Text>
            <Text style={styles.routeName}>{item.toBranch}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoGrid}>
          <View>
            <Text style={styles.infoLabel}>CATEGORY</Text>
            <Text style={styles.infoVal}>{item.category}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>COURIER</Text>
            <Text style={styles.infoVal}>{item.courierName}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Movement Timeline</Text>
      {(item.timeline || []).map((t, idx) => (
        <View key={idx} style={styles.timelineRow}>
          <View style={styles.timelineLeft}>
            <View style={[styles.dot, { backgroundColor: dotColor[t.status] || colors.muted }]} />
            {idx < item.timeline.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.timelineContent}>
            <Text style={[styles.stepText, t.status === "IN_PROGRESS" && { color: colors.primary }]}>{t.step}</Text>
            <Text style={styles.stepNote}>{t.note}</Text>
            {t.date && <Text style={styles.stepDate}>{new Date(t.date).toLocaleString()}</Text>}
          </View>
        </View>
      ))}

      {canConfirm ? (
        <Pressable style={styles.confirmBtn} onPress={onConfirm} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.confirmText}>Confirm Receipt</Text>
            </>
          )}
        </Pressable>
      ) : isDestination ? (
        <View style={styles.lockBadge}>
          <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
          <Text style={styles.lockText}>Shipment Received</Text>
        </View>
      ) : (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={18} color={colors.muted} />
          <Text style={styles.lockText}>Only destination branch can confirm</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 40 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  subtitle: { color: colors.primary, fontSize: 16, fontWeight: "700", marginTop: 2 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  card: { backgroundColor: colors.card, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  routeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  routeNode: { flex: 1 },
  routeLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  routeName: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  infoGrid: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  infoVal: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 16 },
  timelineRow: { flexDirection: "row", gap: 16 },
  timelineLeft: { alignItems: "center", width: 20 },
  dot: { width: 16, height: 16, borderRadius: 8, zIndex: 2 },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  stepText: { color: colors.text, fontSize: 18, fontWeight: "700" },
  stepNote: { color: colors.muted, fontSize: 14, marginTop: 2 },
  stepDate: { color: colors.muted, fontSize: 11, marginTop: 4 },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: "auto" },
  confirmText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  lockBadge: { backgroundColor: colors.card, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: "auto", borderWidth: 1, borderColor: colors.border },
  lockText: { color: colors.muted, fontWeight: "600", fontSize: 14 }
});
