import * as React from "react";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { StatusPill } from "../components/StatusPill";

const dotColor = {
  COMPLETED: colors.success,
  IN_PROGRESS: colors.primary,
  PENDING: colors.warning,
  OVERDUE: colors.danger
};

const dotIcon = {
  COMPLETED: "checkmark-circle",
  IN_PROGRESS: "radio-button-on",
  PENDING: "ellipse-outline",
  OVERDUE: "alert-circle"
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
  const uId = (userAuth?.branch?._id || userAuth?.branch || userAuth?.branchId)?.toString();
  const tId = (item.toBranchId?._id || item.toBranchId)?.toString();
  const fId = (item.fromBranchId?._id || item.fromBranchId)?.toString();
  
  const uName = userAuth?.branch?.name?.toLowerCase().trim();
  const tName = item.toBranch?.toLowerCase().trim();
  const fName = item.fromBranch?.toLowerCase().trim();

  const isDestination = (uId && tId && uId === tId) || (uName && tName && uName === tName);
  const isOrigin = (uId && fId && uId === fId) || (uName && fName && uName === fName);
  
  const canConfirm = (isDestination || userAuth?.role === "ADMIN") && item.status !== "RECEIVED" && item.status !== "FAILED";
  const canWithdraw = (isOrigin || userAuth?.role === "ADMIN") && item.status === "SENT";

  const onConfirm = async () => {
    try {
      setLoading(true);
      await updateStatus(item._id, "RECEIVED");
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Main", { screen: "Incoming" });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  const onWithdraw = async () => {
    try {
      setLoading(true);
      await updateStatus(item._id, "FAILED");
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Main", { screen: "Incoming" });
      }
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Shipment</Text>
            <StatusPill status={item.status} />
          </View>
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
      <View style={styles.timelineBox}>
        {(item.timeline || []).map((t, idx) => (
          <View key={idx} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.dotContainer, { borderColor: dotColor[t.status] || colors.border }]}>
                 <Ionicons name={dotIcon[t.status] || "ellipse"} size={14} color={dotColor[t.status] || colors.muted} />
              </View>
              {idx < item.timeline.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.stepText, t.status === "IN_PROGRESS" && { color: colors.primary }]}>{t.step}</Text>
              <Text style={styles.stepNote}>{t.note}</Text>
              {t.date && <Text style={styles.stepDate}>{new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</Text>}
            </View>
          </View>
        ))}
      </View>

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
      ) : canWithdraw ? (
        <Pressable style={[styles.confirmBtn, { backgroundColor: colors.danger }]} onPress={onWithdraw} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="close-circle" size={22} color="#fff" />
              <Text style={styles.confirmText}>Withdraw Shipment</Text>
            </>
          )}
        </Pressable>
      ) : item.status === "RECEIVED" ? (
        <View style={styles.lockBadge}>
          <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
          <Text style={styles.lockText}>Shipment Delivered</Text>
        </View>
      ) : item.status === "FAILED" ? (
        <View style={styles.lockBadge}>
          <Ionicons name="close-circle" size={20} color={colors.danger} />
          <Text style={styles.lockText}>Shipment Withdrawn</Text>
        </View>
      ) : (
        <View style={styles.lockBadge}>
          <Ionicons name="lock-closed" size={18} color={colors.muted} />
          <Text style={styles.lockText}>Confirmation restricted to {item.toBranch}</Text>
          {userAuth?.branch?.name && userAuth.branch.name !== item.toBranch && (
             <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>You are assigned to {userAuth.branch.name}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 40 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, gap: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 2 },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  subtitle: { color: colors.primary, fontSize: 16, fontWeight: "700" },
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
  timelineBox: { backgroundColor: colors.card, borderRadius: 28, padding: 24, borderWidth: 1, borderColor: colors.border },
  timelineRow: { flexDirection: "row", gap: 20 },
  timelineLeft: { alignItems: "center", width: 24 },
  dotContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, zIndex: 2 },
  dot: { width: 16, height: 16, borderRadius: 8, zIndex: 2 },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  stepText: { color: colors.text, fontSize: 17, fontWeight: "800" },
  stepNote: { color: colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 },
  stepDate: { color: colors.muted, fontSize: 11, fontWeight: "600", marginTop: 6, textTransform: "uppercase" },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: "auto" },
  confirmText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  lockBadge: { backgroundColor: colors.card, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: "auto", borderWidth: 1, borderColor: colors.border },
  lockText: { color: colors.muted, fontWeight: "600", fontSize: 14 }
});
