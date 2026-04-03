import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, Modal, ScrollView, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { api } from "../api/client";

import { Skeleton } from "../components/Skeleton";

const roleColor = { ADMIN: "#2265ff", STAFF: "#586888" };
const ROLES = ["STAFF", "ADMIN"];

const UserSkeleton = () => (
  <View style={styles.userCard}>
    <Skeleton width={50} height={50} radius={25} style={{ marginRight: 14 }} />
    <View style={{ flex: 1 }}>
      <Skeleton width="60%" height={18} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={13} style={{ marginBottom: 6 }} />
      <Skeleton width="30%" height={12} />
    </View>
    <View style={{ alignItems: "flex-end", gap: 8 }}>
      <Skeleton width={60} height={20} radius={10} />
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Skeleton width={32} height={32} radius={10} />
        <Skeleton width={32} height={32} radius={10} />
      </View>
    </View>
  </View>
);

export const UsersSettingsScreen = () => {
  const { loading, error, users, branches, refresh, adminCreateUser } = useAppData();
  
  const [search, setSearch] = useState("");

  // Create modal
  const [createVisible, setCreateVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" });

  // Edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("STAFF");
  const [editBranchId, setEditBranchId] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.branchId) {
      return Toast.show({ type: "error", text1: "Error", text2: "Please fill all required fields and select a branch." });
    }
    try {
      setIsCreating(true);
      await adminCreateUser(newUser);
      setCreateVisible(false);
      setNewUser({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" });
      Toast.show({ type: "success", text1: "Success", text2: "New user created successfully!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed", text2: err.response?.data?.message || "Could not create user" });
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (u) => {
    setEditTarget(u);
    setEditName(u.fullName);
    setEditRole(u.role || "STAFF");
    setEditBranchId(u.branchId?._id || u.branchId || "");
    setEditVisible(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) return Toast.show({ type: "error", text1: "Validation", text2: "Name cannot be empty." });
    if (editRole === "STAFF" && !editBranchId) return Toast.show({ type: "error", text1: "Validation", text2: "Staff members must be assigned to a branch." });

    try {
      setIsSaving(true);
      await api.put(`/admin/users/${editTarget._id}`, { 
        fullName: editName,
        role: editRole,
        branchId: editBranchId || null
      });
      await refresh();
      setEditVisible(false);
      Toast.show({ type: "success", text1: "Updated", text2: "User details updated successfully!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Update failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (u) => {
    Alert.alert(
      "Delete User",
      `Remove "${u.fullName}" from the system? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive", onPress: async () => {
            try {
              await api.delete(`/admin/users/${u._id}`);
              await refresh();
              Toast.show({ type: "success", text1: "Deleted", text2: "User removed." });
            } catch (e) {
              Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Delete failed" });
            }

          }
        }
      ]
    );
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.branchId?.name || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  const headerRight = (
    <Pressable onPress={() => setCreateVisible(true)} style={styles.headerIcon}>
      <Ionicons name="add-circle" size={32} color={colors.primary} />
    </Pressable>
  );

  if (users.length === 0 && loading) {
    return (
      <ScreenLayout title="Staff Management" right={headerRight}>
        <View style={{ gap: 12 }}>
          <Skeleton width="100%" height={52} radius={20} />
          <Skeleton width={150} height={15} style={{ marginVertical: 10 }} />
          {[1, 2, 3, 4, 5].map(i => <UserSkeleton key={i} />)}
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Staff Management" error={error} right={headerRight}>

      {/* ─── CREATE USER MODAL ─── */}
      <Modal animationType="slide" transparent visible={createVisible} onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Staff</Text>
              <Pressable onPress={() => setCreateVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Rahul Sharma" placeholderTextColor={colors.muted}
                value={newUser.fullName} onChangeText={(t) => setNewUser({ ...newUser, fullName: t })} />

              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="employee@company.com" placeholderTextColor={colors.muted} autoCapitalize="none"
                value={newUser.email} onChangeText={(t) => setNewUser({ ...newUser, email: t })} />

              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Temporary password" placeholderTextColor={colors.muted} secureTextEntry
                value={newUser.password} onChangeText={(t) => setNewUser({ ...newUser, password: t })} />

              <Text style={styles.label}>Assign Role</Text>
              <View style={styles.chipWrap}>
                {ROLES.map((r) => (
                  <Pressable key={r} style={[styles.chip, newUser.role === r && styles.chipActive, { marginRight: 8, marginBottom: 8 }]} onPress={() => setNewUser({ ...newUser, role: r })}>
                    <Text style={[styles.chipText, newUser.role === r && styles.chipTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
...
              <Text style={styles.label}>Assign Branch</Text>
              <View style={styles.chipWrap}>
                {branches.map((b) => (
                  <Pressable key={b._id} style={[styles.chip, newUser.branchId === b._id && styles.chipActive, { marginRight: 8, marginBottom: 8 }]} onPress={() => setNewUser({ ...newUser, branchId: b._id })}>
                    <Text style={[styles.chipText, newUser.branchId === b._id && styles.chipTextActive]}>{b.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.saveBtn} onPress={handleCreateUser} disabled={isCreating}>
                {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Create Account</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── EDIT USER MODAL ─── */}
      <Modal animationType="slide" transparent visible={editVisible} onRequestClose={() => setEditVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <Pressable onPress={() => setEditVisible(false)}>
                <Ionicons name="close-circle" size={28} color={colors.muted} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Full Name"
                placeholderTextColor={colors.muted}
              />
              <Text style={[styles.label, { color: colors.muted, fontSize: 13, marginTop: 8 }]}>
                Email: {editTarget?.email}
              </Text>

              <Text style={styles.label}>Assign Role</Text>
              <View style={styles.chipWrap}>
                {ROLES.map((r) => (
                  <Pressable key={r} style={[styles.chip, editRole === r && styles.chipActive, { marginRight: 8, marginBottom: 8 }]} onPress={() => setEditRole(r)}>
                    <Text style={[styles.chipText, editRole === r && styles.chipTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Assign Branch</Text>
              <View style={styles.chipWrap}>
                {branches.map((b) => (
                  <Pressable key={b._id} style={[styles.chip, editBranchId === b._id && styles.chipActive, { marginRight: 8, marginBottom: 8 }]} onPress={() => setEditBranchId(b._id)}>
                    <Text style={[styles.chipText, editBranchId === b._id && styles.chipTextActive]}>{b.name}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={[styles.saveBtn, { marginTop: 20 }]} onPress={handleEditSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Save Changes</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── SEARCH ─── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={colors.muted} style={{ marginRight: 10 }} />
        <TextInput style={styles.searchInput} placeholder="Search staff…" placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} />
      </View>

      <Text style={styles.section}>Staff Members ({filteredUsers.length})</Text>

      {filteredUsers.map((u) => (
        <View key={u._id} style={styles.userCard}>
          <View style={[styles.avatar, { marginRight: 14 }]}>
            <Text style={styles.avatarText}>{u.fullName?.[0]?.toUpperCase() || "?"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{u.fullName}</Text>
            <Text style={styles.meta}>{u.email}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={12} color={colors.muted} style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>{u.branchId?.name || "No branch"}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={[styles.badge, { backgroundColor: `${roleColor[u.role] || colors.primary}33`, marginBottom: 8 }]}>
              <Text style={[styles.badgeText, { color: roleColor[u.role] || colors.primary }]}>{u.role}</Text>
            </View>
            <View style={styles.actionBtns}>
              <Pressable style={[styles.iconBtn, { marginRight: 6 }]} onPress={() => openEdit(u)}>
                <Ionicons name="pencil" size={15} color={colors.primary} />
              </Pressable>
              <Pressable style={[styles.iconBtn, styles.iconBtnDanger]} onPress={() => handleDelete(u)}>
                <Ionicons name="trash" size={15} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}

    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerIcon: { padding: 4 },
  searchWrap: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, height: 52, flexDirection: "row", alignItems: "center", marginBottom: 8 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  section: { color: colors.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginTop: 8, marginBottom: 12, fontSize: 12 },
  userCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.text, fontWeight: "800", fontSize: 22 },
  name: { color: colors.text, fontWeight: "700", fontSize: 17 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 3 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { color: colors.muted, fontSize: 12 },
  badge: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { fontWeight: "800", letterSpacing: 0.5, fontSize: 11 },
  actionBtns: { flexDirection: "row" },
  iconBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center" },
  iconBtnDanger: { backgroundColor: `${colors.danger}15` },
  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  label: { color: colors.text, fontWeight: "600", marginBottom: 8, marginTop: 16, fontSize: 15 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, color: colors.text, fontSize: 16 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap" },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.card },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}33` },
  chipText: { color: colors.muted, fontWeight: "600" },
  chipTextActive: { color: colors.text, fontWeight: "800" },
  saveBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 28, marginBottom: 20 },
  saveBtnTxt: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
