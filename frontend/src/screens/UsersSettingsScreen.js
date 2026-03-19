import * as React from "react";import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, Modal, ScrollView, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";

import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const roleColor = { ADMIN: "#2265ff", STAFF: "#586888" };
const TABS = ["Users", "Roles", "Settings"];
const ROLES = ["STAFF", "ADMIN"];

export const UsersSettingsScreen = () => {
  const { loading, error, users, branches, logout, adminCreateUser } = useAppData();
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Users");

  // Add User Modal States
  const[modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" });

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to securely log out?",[
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout }
    ]);
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.password || !newUser.branchId) {
      return Toast.show({ type: "error", text1: "Error", text2: "Please fill all required fields." });
    }
    try {
      setIsCreating(true);
      await adminCreateUser(newUser);
      setModalVisible(false);
      setNewUser({ fullName: "", email: "", password: "", role: "STAFF", branchId: "" }); // Reset form
      Toast.show({ type: "success", text1: "Success", text2: "New user created successfully!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed", text2: err.response?.data?.message || "Could not create user" });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return[];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => 
      u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.branchName.toLowerCase().includes(q)
    );
  },[users, search]);

  // Header ke right side mein Add button jo ab Modal karga
  const headerRight = (
    <Pressable onPress={() => setModalVisible(true)} style={styles.headerIcon}>
      <Ionicons name="add-circle" size={32} color={colors.primary} />
    </Pressable>
  );

  return (
    <ScreenLayout title="Users & Settings" loading={loading} error={error} right={headerRight}>
      
      {/* ----------------- ADD USER MODAL ----------------- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={28} color={colors.muted} /></Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Rahul Sharma" placeholderTextColor={colors.muted} 
                value={newUser.fullName} onChangeText={(t) => setNewUser({...newUser, fullName: t})} />

              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="employee@branchflow.pro" placeholderTextColor={colors.muted} autoCapitalize="none"
                value={newUser.email} onChangeText={(t) => setNewUser({...newUser, email: t})} />

              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Temporary password" placeholderTextColor={colors.muted} secureTextEntry
                value={newUser.password} onChangeText={(t) => setNewUser({...newUser, password: t})} />

              <Text style={styles.label}>Assign Role</Text>
              <View style={styles.chipWrap}>
                {ROLES.map((r) => (
                  <Pressable key={r} style={[styles.chip, newUser.role === r && styles.chipActive]} onPress={() => setNewUser({...newUser, role: r})}>
                    <Text style={[styles.chipText, newUser.role === r && styles.chipTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Assign Branch</Text>
              <View style={styles.chipWrap}>
                {branches.map((b) => (
                  <Pressable key={b._id} style={[styles.chip, newUser.branchId === b._id && styles.chipActive]} onPress={() => setNewUser({...newUser, branchId: b._id})}>
                    <Text style={[styles.chipText, newUser.branchId === b._id && styles.chipTextActive]}>{b.code}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.saveBtn} onPress={handleCreateUser} disabled={isCreating}>
                {isCreating ? <ActivityIndicator color={colors.text} /> : <Text style={styles.saveBtnTxt}>Create Account</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* -------------------------------------------------- */}

      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "Users" ? (
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={20} color={colors.muted} />
            <TextInput style={styles.searchInput} placeholder="Search users or branches..." placeholderTextColor={colors.muted} value={search} onChangeText={setSearch} />
          </View>

          <Text style={styles.section}>Active Users ({filteredUsers.length})</Text>

          {filteredUsers.map((u) => (
            <View key={u._id} style={styles.userCard}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{u.fullName[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.fullName}</Text>
                <Text style={styles.meta}>{u.email}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color={colors.muted} />
                  <Text style={styles.locationText}>{u.branchName}</Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: `${roleColor[u.role] || colors.primary}33` }]}>
                <Text style={[styles.badgeText, { color: roleColor[u.role] || colors.primary }]}>{u.role}</Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View style={styles.placeholderWrap}>
          <Ionicons name="construct-outline" size={48} color={colors.muted} />
          <Text style={styles.placeholderTitle}>{activeTab} Settings</Text>
          <Text style={styles.placeholderSub}>This module is currently under development.</Text>
        </View>
      )}

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out" size={22} color={colors.text} />
        <Text style={styles.logoutTxt}>Secure Log Out</Text>
      </Pressable>

    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerIcon: { padding: 4 },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, backgroundColor: colors.card, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: "600", fontSize: 14 },
  tabTextActive: { color: colors.text },
  searchWrap: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, height: 52, flexDirection: "row", alignItems: "center", gap: 10 },
  searchInput: { flex: 1, color: colors.text, fontSize: 16 },
  section: { color: colors.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  userCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.text, fontWeight: "800", fontSize: 22 },
  name: { color: colors.text, fontWeight: "700", fontSize: 18 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  locationText: { color: colors.muted, fontSize: 12 },
  badge: { borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12 },
  badgeText: { fontWeight: "800", letterSpacing: 0.5, fontSize: 11 },
  logoutBtn: { marginTop: 24, backgroundColor: colors.danger, borderRadius: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  logoutTxt: { color: colors.text, fontSize: 18, fontWeight: "800" },
  placeholderWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 40, backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, marginTop: 10 },
  placeholderTitle: { color: colors.text, fontSize: 20, fontWeight: "bold", marginTop: 12 },
  placeholderSub: { color: colors.muted, marginTop: 6 },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  label: { color: colors.text, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, color: colors.text, fontSize: 16 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.card },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}33` },
  chipText: { color: colors.muted },
  chipTextActive: { color: colors.text, fontWeight: "700" },
  saveBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 30, marginBottom: 20 },
  saveBtnTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" }
});
