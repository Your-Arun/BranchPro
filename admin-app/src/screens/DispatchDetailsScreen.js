import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator, ScrollView, TextInput } from "react-native";
import Toast from "react-native-toast-message";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const dotColor = {
  RECEIVED: colors.success,
  SENT: colors.primary,
  IN_TRANSIT: colors.warning,
  PENDING: colors.muted,
  FAILED: colors.danger,
  OVERDUE: colors.danger
};

const statuses = ["SENT", "IN_TRANSIT", "WAITING_RECEIPT", "RECEIVED", "PENDING", "OVERDUE", "FAILED"];

export const DispatchDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { dispatches, updateStatus, updateDispatch, deleteDispatch, refresh, branches } = useAppData();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showStatusPicker, setShowStatusPicker] = useState(false);

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

  const onUpdateField = async (fields) => {
    try {
      setLoading(true);
      await updateDispatch(item._id, fields);
      Toast.show({ type: "success", text1: "Updated", text2: "Shipment details updated." });
      setIsEditing(false);
    } catch (e) {
      Toast.show({ type: "error", text1: "Update Failed", text2: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  const onStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await updateStatus(item._id, newStatus);
      Toast.show({ type: "success", text1: "Status Updated", text2: `Shipment marked as ${newStatus}` });
      setShowStatusPicker(false);
    } catch (e) {
      Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    Alert.alert(
      "Delete Shipment",
      "Are you sure you want to remove this dispatch from the network? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDispatch(item._id);
              Toast.show({ type: "success", text1: "Deleted", text2: "Shipment record removed." });
              navigation.goBack();
            } catch (e) {
              Toast.show({ type: "error", text1: "Failed", text2: e.response?.data?.message || e.message });
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shipment</Text>
          <Text style={styles.subtitle}>ID: {item.trackingId}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
           <Pressable onPress={onDelete} style={[styles.closeBtn, { borderColor: colors.danger }]}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={styles.routeNode}>
              <Text style={styles.routeLabel}>FROM</Text>
              <Text style={styles.routeName}>{item.fromBranch}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} style={{ marginTop: 20 }} />
            <View style={[styles.routeNode, { alignItems: "flex-end" }]}>
              <Text style={styles.routeLabel}>TO</Text>
              <Text style={styles.routeLabel}>DESTINATION</Text>
              <Text style={styles.routeName}>{item.toBranch}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          
          {isEditing ? (
            <View style={styles.editSection}>
               <Text style={styles.infoLabel}>EDIT COURIER NAME</Text>
               <TextInput 
                  style={styles.editInput}
                  value={editData.courierName ?? item.courierName}
                  onChangeText={(t) => setEditData({...editData, courierName: t})}
               />
               <Text style={styles.infoLabel}>EDIT CATEGORY</Text>
               <TextInput 
                  style={styles.editInput}
                  value={editData.category ?? item.category}
                  onChangeText={(t) => setEditData({...editData, category: t})}
               />
               <View style={{flexDirection: "row", gap: 10, marginTop: 10}}>
                  <Pressable style={[styles.miniBtn, {backgroundColor: colors.primary}]} onPress={() => onUpdateField(editData)}>
                    <Text style={styles.miniBtnText}>Save Changes</Text>
                  </Pressable>
                  <Pressable style={[styles.miniBtn, {backgroundColor: colors.cardAlt}]} onPress={() => setIsEditing(false)}>
                    <Text style={[styles.miniBtnText, {color: colors.text}]}>Cancel</Text>
                  </Pressable>
               </View>
            </View>
          ) : (
            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.infoLabel}>CATEGORY</Text>
                <Text style={styles.infoVal}>{item.category}</Text>
              </View>
              <View style={{alignItems: "flex-end"}}>
                <Text style={styles.infoLabel}>COURIER</Text>
                <Text style={styles.infoVal}>{item.courierName}</Text>
              </View>
              <Pressable style={styles.editBadge} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={14} color={colors.primary} />
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.statusSection}>
           <Text style={styles.sectionTitle}>Manage Status</Text>
           <View style={styles.statusGrid}>
              {statuses.map(s => (
                <Pressable 
                  key={s} 
                  style={[styles.statusPill, item.status === s && {backgroundColor: colors.primary, borderColor: colors.primary}]}
                  onPress={() => onStatusChange(s)}
                  disabled={loading}
                >
                  <Text style={[styles.statusPillText, item.status === s && {color: "#fff"}]}>{s.replace("_", " ")}</Text>
                </Pressable>
              ))}
           </View>
        </View>

        <Text style={styles.sectionTitle}>Movement Timeline</Text>
        {(item.timeline || []).map((t, idx) => (
          <View key={idx} style={styles.timelineRow}>
            <View style={[styles.timelineLeft, { marginRight: 16 }]}>
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
      </ScrollView>
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
  infoGrid: { flexDirection: "row", justifyContent: "space-between", position: "relative" },
  infoLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  infoVal: { color: colors.text, fontSize: 16, fontWeight: "700", marginTop: 2 },
  editBadge: { position: "absolute", top: -10, right: -10, backgroundColor: `${colors.primary}15`, padding: 8, borderRadius: 12 },
  editSection: { gap: 10 },
  editInput: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text, fontSize: 16, marginTop: 4 },
  miniBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  miniBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 16 },
  statusSection: { marginBottom: 24 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  statusPillText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  timelineRow: { flexDirection: "row" },
  timelineLeft: { alignItems: "center", width: 20 },
  dot: { width: 16, height: 16, borderRadius: 8, zIndex: 2 },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  stepText: { color: colors.text, fontSize: 18, fontWeight: "700" },
  stepNote: { color: colors.muted, fontSize: 14, marginTop: 2 },
  stepDate: { color: colors.muted, fontSize: 11, marginTop: 4 }
});
