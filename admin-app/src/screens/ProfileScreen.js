import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  Modal, ScrollView, ActivityIndicator, Alert
} from "react-native";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { api } from "../api/client";

export const ProfileScreen = () => {
  const { userAuth, company, logout, loadCompany, setupCompany, refresh } = useAppData();

  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const openEdit = () => {
    setForm({ name: company?.name || "", phone: company?.phone || "", email: company?.email || "" });
    setEditVisible(true);
  };

  const handleUpdate = async () => {
    if (!form.name || !form.phone || !form.email) {
      return Toast.show({ type: "error", text1: "Validation", text2: "All fields are required." });
    }
    try {
      setSaving(true);
      await api.put("/admin/company", form);
      await refresh();
      setEditVisible(false);
      Toast.show({ type: "success", text1: "Success", text2: "Company details updated!" });
    } catch (e) {
      Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = () => {
    Alert.alert(
      "Delete Company",
      "This will permanently delete your company, ALL branches, and unlink all staff. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything", style: "destructive", onPress: async () => {
            try {
              await api.delete("/admin/company");
              await refresh();
              Toast.show({ type: "success", text1: "Deleted", text2: "Company removed." });
            } catch (e) {
              Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Delete failed" });
            }

          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* ── Company Card ── */}
        <View style={styles.companyCard}>
          <View style={[styles.companyIconWrap, { marginRight: 16 }]}>
            <Ionicons name="business" size={40} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.companyName}>{company?.name || "No Company"}</Text>
            <Text style={styles.companyEmail}>{company?.email}</Text>
            <Text style={styles.companyPhone}>{company?.phone}</Text>
          </View>
          <Pressable style={styles.editIconBtn} onPress={openEdit}>
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* ── Admin Info ── */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-circle" size={22} color={colors.muted} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoValue}>{userAuth?.fullName}</Text>
              <Text style={styles.infoSub}>{userAuth?.email}</Text>
            </View>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>Admin</Text>
            </View>
          </View>
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionLabel}>ACTIONS</Text>

          <Pressable style={styles.actionRow} onPress={openEdit}>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15`, marginRight: 14 }]}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Edit Company Details</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.actionRow} onPress={handleDeleteCompany}>
            <View style={[styles.actionIcon, { backgroundColor: `${colors.danger}15`, marginRight: 14 }]}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </View>
            <Text style={[styles.actionText, { color: colors.danger }]}>Delete Company</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* ── Logout ── */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Secure Logout</Text>
        </Pressable>

        {/* ── Edit Company Modal ── */}
        <Modal animationType="slide" transparent visible={editVisible} onRequestClose={() => setEditVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Edit Company</Text>
                <Pressable onPress={() => setEditVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.muted} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Company Name</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm(f => ({ ...f, name: t }))} placeholder="Company Name" placeholderTextColor={colors.muted} />

                <Text style={styles.fieldLabel}>Company Email</Text>
                <TextInput style={styles.input} value={form.email} onChangeText={(t) => setForm(f => ({ ...f, email: t }))} placeholder="contact@company.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" />

                <Text style={styles.fieldLabel}>Company Phone</Text>
                <TextInput style={styles.input} value={form.phone} onChangeText={(t) => setForm(f => ({ ...f, phone: t }))} placeholder="+91 XXXXXXXXXX" placeholderTextColor={colors.muted} keyboardType="phone-pad" />

                <Pressable style={styles.saveBtn} onPress={handleUpdate} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveTxt}>Save Changes</Text>}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  companyCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  companyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${colors.primary}15`, alignItems: "center", justifyContent: "center" },
  companyName: { color: colors.text, fontSize: 20, fontWeight: "800" },
  companyEmail: { color: colors.muted, fontSize: 13, marginTop: 3 },
  companyPhone: { color: colors.muted, fontSize: 13 },
  editIconBtn: { padding: 8, backgroundColor: `${colors.primary}15`, borderRadius: 12 },
  infoCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  actionsCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  infoValue: { color: colors.text, fontWeight: "700", fontSize: 16 },
  infoSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  rolePill: { backgroundColor: `${colors.primary}22`, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  rolePillText: { color: colors.primary, fontWeight: "700", fontSize: 12 },
  actionRow: { flexDirection: "row", alignItems: "center" },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  logoutBtn: { backgroundColor: colors.danger, borderRadius: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  logoutText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: "80%" },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sheetTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  fieldLabel: { color: colors.text, fontWeight: "600", marginBottom: 8, marginTop: 16, fontSize: 15 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, color: colors.text, fontSize: 16 },
  saveBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 28, marginBottom: 24 },
  saveTxt: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
