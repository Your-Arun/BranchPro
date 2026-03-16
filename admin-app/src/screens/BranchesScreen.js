import { useCallback, useMemo, useState } from "react";
import {
  Alert, Pressable, StyleSheet, Text, TextInput,
  View, Modal, ScrollView, ActivityIndicator, Share
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { api } from "../api/client";

const EMPTY = { name: "", city: "", address: "", code: "", status: "ACTIVE" };

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
      return Alert.alert("Validation", "All fields are required.");
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
      Alert.alert("Success", editingId ? "Branch updated!" : "Branch created!");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Failed to save branch");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete Branch", `Remove "${name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try {
            await api.delete(`/admin/branches/${id}`);
            await refresh();
          } catch (e) {
            Alert.alert("Error", e.response?.data?.message || "Delete failed");
          }
        }
      }
    ]);
  };

  const shareKey = async (b) => {
    try {
      await Share.share({
        message: `Join "${b.name}" branch on BranchFlow Pro!\n\nYour Registration Key: ${b.registrationKey}\n\nDownload the app, signup, and enter this key to get started.`,
        title: "Branch Registration Key"
      });
    } catch (_) {}
  };

  const headerRight = (
    <Pressable onPress={openCreate} style={{ padding: 4 }}>
      <Ionicons name="add-circle" size={32} color={colors.primary} />
    </Pressable>
  );

  return (
    <ScreenLayout title="Branches" loading={loading} error={error} right={headerRight}>

      {/* ─── CREATE / EDIT MODAL ─── */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editingId ? "Edit Branch" : "New Branch"}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: "Branch Name", key: "name", placeholder: "e.g. Main Hub Delhi" },
                { label: "City", key: "city", placeholder: "e.g. New Delhi" },
                { label: "Address", key: "address", placeholder: "e.g. 45 Ring Road, Lajpat Nagar" },
                { label: "Branch Code", key: "code", placeholder: "e.g. DEL01", upper: true },
              ].map(({ label, key, placeholder, upper }) => (
                <View key={key}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.muted}
                    value={form[key]}
                    onChangeText={(t) => setForm((f) => ({ ...f, [key]: upper ? t.toUpperCase() : t }))}
                    autoCapitalize={upper ? "characters" : "sentences"}
                  />
                </View>
              ))}

              <Text style={styles.label}>Status</Text>
              <View style={styles.toggleRow}>
                {["ACTIVE", "INACTIVE"].map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.toggleBtn, form.status === s && styles.toggleActive]}
                    onPress={() => setForm((f) => ({ ...f, status: s }))}
                  >
                    <Text style={[styles.toggleText, form.status === s && styles.toggleTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color={colors.text} />
                  : <Text style={styles.saveTxt}>{editingId ? "Update Branch" : "Create Branch"}</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── SEARCH ─── */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, city or code…"
          placeholderTextColor={colors.muted}
        />
      </View>

      <Text style={styles.countLabel}>{filtered.length} Branch{filtered.length !== 1 ? "es" : ""}</Text>

      {/* ─── BRANCH CARDS ─── */}
      {filtered.map((b) => (
        <View key={b._id} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconCircle}>
              <Ionicons name="business" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.branchName}>{b.name}</Text>
              <Text style={styles.branchMeta}>{b.city} • {b.code}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: b.status === "ACTIVE" ? `${colors.success}22` : `${colors.muted}22` }]}>
              <Text style={[styles.statusText, { color: b.status === "ACTIVE" ? colors.success : colors.muted }]}>{b.status}</Text>
            </View>
          </View>

          <Text style={styles.addrText}>{b.address}</Text>

          {/* Registration Key — the most important info for admin */}
          <Pressable style={styles.keyBox} onPress={() => shareKey(b)}>
            <View>
              <Text style={styles.keyLabelText}>Registration Key</Text>
              <Text style={styles.keyValue}>{b.registrationKey}</Text>
            </View>
            <View style={styles.shareBtn}>
              <Ionicons name="share-social" size={18} color={colors.primary} />
              <Text style={styles.shareTxt}>Share</Text>
            </View>
          </Pressable>

          <Text style={styles.activeDispatches}>
            <Ionicons name="cube" size={12} color={colors.muted} /> Active shipments: {b.activeDispatches}
          </Text>

          <View style={styles.actionRow}>
            <Pressable style={styles.editBtn} onPress={() => openEdit(b)}>
              <Ionicons name="pencil" size={16} color={colors.text} />
              <Text style={styles.editTxt}>Edit</Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={() => handleDelete(b._id, b.name)}>
              <Ionicons name="trash" size={16} color={colors.danger} />
              <Text style={styles.deleteTxt}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchBar: { backgroundColor: colors.card, borderRadius: 20, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  countLabel: { color: colors.muted, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 18, marginBottom: 14 },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "center", marginBottom: 10 },
  iconCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center" },
  branchName: { color: colors.text, fontWeight: "800", fontSize: 18 },
  branchMeta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontWeight: "700", fontSize: 11 },
  addrText: { color: colors.muted, fontSize: 14, marginBottom: 14 },
  keyBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: `${colors.primary}12`, borderWidth: 1, borderColor: `${colors.primary}33`, borderRadius: 16, padding: 14, marginBottom: 12 },
  keyLabelText: { color: colors.muted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  keyValue: { color: colors.primary, fontSize: 26, fontWeight: "900", letterSpacing: 4, marginTop: 2 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: `${colors.primary}22`, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  shareTxt: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  activeDispatches: { color: colors.muted, fontSize: 13, marginBottom: 14 },
  actionRow: { flexDirection: "row", gap: 10 },
  editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.bgSoft, borderRadius: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  editTxt: { color: colors.text, fontWeight: "700" },
  deleteBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: `${colors.danger}15`, borderRadius: 14, paddingVertical: 10, borderWidth: 1, borderColor: `${colors.danger}33` },
  deleteTxt: { color: colors.danger, fontWeight: "700" },
  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: "90%" },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  label: { color: colors.text, fontWeight: "600", marginBottom: 8, marginTop: 16, fontSize: 15 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, color: colors.text, fontSize: 16 },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  toggleActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
  toggleText: { color: colors.muted, fontWeight: "600" },
  toggleTextActive: { color: colors.primary, fontWeight: "800" },
  saveBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 28, marginBottom: 24 },
  saveTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" },
});
