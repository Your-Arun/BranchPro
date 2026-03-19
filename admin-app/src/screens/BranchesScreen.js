import { useCallback, useMemo, useState } from "react";
import {
  Alert, Pressable, StyleSheet, Text, TextInput,
  View, Modal, ScrollView, ActivityIndicator, Share,
  KeyboardAvoidingView, Platform
} from "react-native";
import Toast from "react-native-toast-message";

import { Ionicons } from "@expo/vector-icons";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { api } from "../api/client";

const EMPTY = { name: "", city: "", address: "", code: "", status: "ACTIVE" };

import { Skeleton } from "../components/Skeleton";

const BranchSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <Skeleton width={44} height={44} radius={22} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={20} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={14} />
      </View>
      <Skeleton width={80} height={26} radius={13} />
    </View>
    <Skeleton width="100%" height={40} style={{ marginBottom: 18 }} />
    <Skeleton width="100%" height={80} radius={20} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Skeleton width={100} height={15} />
      <Skeleton width={100} height={15} />
    </View>
  </View>
);

export const BranchesScreen = () => {
  const { loading, error, branches, refresh } = useAppData();
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => `${b.name} ${b.city} ${b.code}`.toLowerCase().includes(q));
  }, [search, branches]);

  const openCreate = () => {
    setForm(EMPTY);
    setEditingId(null);
    setModalVisible(true);
  };

  const openEdit = (b) => {
    setForm({ name: b.name, city: b.city, address: b.address, code: b.code, status: b.status });
    setEditingId(b._id);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.address || !form.code) {
      return Toast.show({ type: "error", text1: "Validation", text2: "All fields are required." });
    }
    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/admin/branches/${editingId}`, form);
      } else {
        await api.post("/admin/branches", form);
      }
      setModalVisible(false);
      await refresh();
      Toast.show({ type: "success", text1: "Success", text2: editingId ? "Branch updated successfully!" : "New branch established!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Failed to save branch" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert("Decommission Branch", `Confirm removal of "${name}"? This action is permanent and cannot be reversed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decommission", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/admin/branches/${id}`);
            await refresh();
            Toast.show({ type: "success", text1: "Success", text2: "Branch decommissioned." });
          } catch (e) {
            Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Operation failed" });
          }
        }
      }
    ]);
  };

  const shareKey = async (b) => {
    try {
      await Share.share({
        message: `Welcome to the ${b.name} Hub on BranchFlow Pro!\n\nAccess Key: ${b.registrationKey}\n\nStep 1: Download BranchFlow Staff App\nStep 2: Sign up with the key above\nStep 3: Start managing logistics.`,
        title: "Branch Access Invitation"
      });
    } catch (_) {}
  };

  const headerRight = (
    <Pressable onPress={openCreate} style={styles.addBtn}>
      <Ionicons name="add" size={24} color={colors.text} style={{ marginRight: 6 }} />
      <Text style={styles.addBtnText}>New Hub</Text>
    </Pressable>
  );

  if (branches.length === 0 && loading) {
    return (
      <ScreenLayout title="Logistics Hubs" right={headerRight}>
        <View style={{ gap: 16 }}>
          <Skeleton width="100%" height={55} radius={20} style={{ marginBottom: 12 }} />
          {[1, 2, 3].map(i => <BranchSkeleton key={i} />)}
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Logistics Hubs" error={error} right={headerRight}>
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingId ? "Edit Hub Details" : "Establish New Hub"}</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
              {[
                { label: "Hub Name", key: "name", placeholder: "e.g. Northeast Regional Hub" },
                { label: "City / Region", key: "city", placeholder: "e.g. New York" },
                { label: "Full Physical Address", key: "address", placeholder: "e.g. 123 Logistics Way, Suite 400" },
                { label: "Unique Hub Code", key: "code", placeholder: "e.g. NY-001", upper: true },
              ].map(({ label, key, placeholder, upper }) => (
                <View key={key} style={styles.fieldGroup}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.muted}
                    value={form[key]}
                    onChangeText={(t) => setForm((f) => ({ ...f, [key]: upper ? t.toUpperCase().replace(/\s/g, "") : t }))}
                    autoCapitalize={upper ? "characters" : "sentences"}
                  />
                </View>
              ))}

              <Text style={styles.label}>Operational Status</Text>
              <View style={styles.toggleRow}>
                {["ACTIVE", "INACTIVE"].map((s, idx) => (
                  <Pressable
                    key={s}
                    style={[styles.toggleBtn, form.status === s && styles.toggleActive, idx === 0 && { marginRight: 12 }]}
                    onPress={() => setForm((f) => ({ ...f, status: s }))}
                  >
                    <Text style={[styles.toggleText, form.status === s && styles.toggleTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={colors.text} />
                  : <Text style={styles.saveTxt}>{editingId ? "Synchronize Updates" : "Initialize Branch Hub"}</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.primary} style={{ marginRight: 12 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Lookup hub by name, city or code…"
          placeholderTextColor={colors.muted}
        />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.countLabel}>{filtered.length} ACTIVE HUBS</Text>
        <Ionicons name="layers" size={14} color={colors.muted} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {filtered.map((b) => (
          <View key={b._id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.iconCircle, { marginRight: 12 }]}>
                <Ionicons name="business" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.branchName}>{b.name}</Text>
                <Text style={styles.branchMeta}>{b.city} • <Text style={{color: colors.primary, fontWeight: "700"}}>{b.code}</Text></Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: b.status === "ACTIVE" ? `${colors.success}15` : `${colors.muted}15` }]}>
                <View style={[styles.statusDot, { backgroundColor: b.status === "ACTIVE" ? colors.success : colors.muted, marginRight: 6 }]} />
                <Text style={[styles.statusText, { color: b.status === "ACTIVE" ? colors.success : colors.muted }]}>{b.status}</Text>
              </View>
            </View>

            <Text style={styles.addrText}>{b.address}</Text>

            <Pressable style={styles.keyBox} onPress={() => shareKey(b)}>
              <View>
                <Text style={styles.keyLabelText}>Staff Registration Key</Text>
                <Text style={styles.keyValue}>{b.registrationKey}</Text>
              </View>
              <View style={styles.shareBtn}>
                <Ionicons name="share-social" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.shareTxt}>Invite</Text>
              </View>
            </Pressable>

            <View style={styles.statsMiniRow}>
              <View style={styles.miniStat}>
                 <Ionicons name="cube-outline" size={14} color={colors.muted} style={{ marginRight: 6 }} />
                 <Text style={styles.miniStatText}>{b.activeDispatches || 0} Shipments</Text>
              </View>
              <View style={styles.miniDivider} />
              <View style={styles.miniStat}>
                 <Ionicons name="people-outline" size={14} color={colors.muted} style={{ marginRight: 6 }} />
                 <Text style={styles.miniStatText}>Managing Staff</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={styles.editBtn} onPress={() => openEdit(b)}>
                <Ionicons name="settings-outline" size={16} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={styles.editTxt}>Configure</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(b._id, b.name)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}

        {filtered.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Ionicons name="business-outline" size={80} color={colors.border} />
            <Text style={styles.emptyTitle}>No Hubs Found</Text>
            <Text style={styles.emptySub}>Start by creating your first logistics hub to manage dispatches and staff.</Text>
            <Pressable style={styles.emptyBtn} onPress={openCreate}>
              <Text style={styles.emptyBtnText}>Create My First Hub</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  addBtn: { backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: colors.text, fontWeight: "700", fontSize: 13 },
  searchBar: { backgroundColor: colors.card, borderRadius: 20, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingHorizontal: 4 },
  countLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 28, padding: 20, marginBottom: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center" },
  branchName: { color: colors.text, fontWeight: "800", fontSize: 18 },
  branchMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statusPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontWeight: "800", fontSize: 10, letterSpacing: 0.5 },
  addrText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  keyBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: `${colors.primary}10`, borderWidth: 1, borderColor: `${colors.primary}25`, borderRadius: 20, padding: 16, marginBottom: 16 },
  keyLabelText: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  keyValue: { color: colors.primary, fontSize: 24, fontWeight: "900", letterSpacing: 3, marginTop: 4 },
  shareBtn: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 },
  shareTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  statsMiniRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  miniStat: { flexDirection: "row", alignItems: "center" },
  miniStatText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  miniDivider: { width: 1, height: 12, backgroundColor: colors.border, marginHorizontal: 12 },
  actionRow: { flexDirection: "row" },
  editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.bgSoft, borderRadius: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, marginRight: 10 },
  editTxt: { color: colors.text, fontWeight: "700", fontSize: 14 },
  deleteBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center", backgroundColor: `${colors.danger}10`, borderRadius: 16, borderWidth: 1, borderColor: `${colors.danger}20` },
  
  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: "90%" },
  sheetHandle: { width: 40, height: 5, backgroundColor: colors.border, borderRadius: 3, alignSelf: "center", marginBottom: 20 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  sheetTitle: { color: colors.text, fontSize: 22, fontWeight: "800" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  fieldGroup: { marginBottom: 16 },
  label: { color: colors.muted, fontWeight: "700", marginBottom: 8, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, color: colors.text, fontSize: 16 },
  toggleRow: { flexDirection: "row", marginBottom: 10 },
  toggleBtn: { flex: 1, paddingVertical: 14, borderRadius: 18, alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  toggleActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}15` },
  toggleText: { color: colors.muted, fontWeight: "700" },
  toggleTextActive: { color: colors.primary, fontWeight: "900" },
  saveBtn: { backgroundColor: colors.primary, padding: 20, borderRadius: 20, alignItems: "center", marginTop: 20 },
  saveTxt: { color: colors.text, fontSize: 18, fontWeight: "800" },

  // Empty State
  emptyWrap: { alignItems: "center", justifyContent: "center", padding: 40, marginTop: 40 },
  emptyTitle: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: 24 },
  emptySub: { color: colors.muted, fontSize: 15, textAlign: "center", marginTop: 8, lineHeight: 22 },
  emptyBtn: { backgroundColor: `${colors.primary}20`, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, marginTop: 24, borderWidth: 1, borderColor: colors.primary },
  emptyBtnText: { color: colors.primary, fontWeight: "800", fontSize: 16 }
});
