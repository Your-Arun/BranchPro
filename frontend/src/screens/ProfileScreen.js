import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

export const ProfileScreen = () => {
  const { userAuth, logout, dispatches } = useAppData();
  const [exporting, setExporting] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of the Staff Portal?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout }
    ]);
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      const csvHeader = "Tracking ID,From Branch,To Branch,Status,Category,Courier,Dispatch Date,Notes\n";
      const csvRows = (dispatches || []).map(d => {
        const escapeCsv = (str) => `"${String(str || "").replace(/"/g, '""')}"`;
        return [
          escapeCsv(d.trackingId),
          escapeCsv(d.fromBranch),
          escapeCsv(d.toBranch),
          escapeCsv(d.status),
          escapeCsv(d.category),
          escapeCsv(d.courierName),
          escapeCsv(new Date(d.dispatchDate || d.createdAt).toLocaleDateString()),
          escapeCsv(d.description)
        ].join(",");
      }).join("\n");
      
      const fileString = csvHeader + csvRows;
      const fileName = userAuth?.role === "ADMIN" 
        ? "Total_Company_Dispatches.csv" 
        : `Branch_${userAuth?.branch?.code || 'Dispatches'}.csv`;

      const filePath = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(filePath, fileString, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, { UTI: 'public.comma-separated-values-text', mimeType: 'text/csv' });
      } else {
        Toast.show({ type: "error", text1: "Unsupported", text2: "Sharing not available on this device" });
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: "error", text1: "Export Error", text2: "Could not generate Excel sheet" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* ── User Header ── */}
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{userAuth?.fullName?.[0] || "?"}</Text>
          </View>
          <Text style={styles.userName}>{userAuth?.fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userAuth?.role}</Text>
          </View>
        </View>

        {/* ── Assignment Info ── */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>ASSIGNED LOCATION</Text>
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { marginRight: 16 }]}>
              <Ionicons name="business" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Branch Name</Text>
              <Text style={styles.infoValue}>{userAuth?.branch?.name || "No branch assigned"}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { marginRight: 16 }]}>
              <Ionicons name="location" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Branch Code</Text>
              <Text style={styles.infoValue}>{userAuth?.branch?.code || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* ── Contact Info ── */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>CONTACT DETAILS</Text>
          <View style={styles.infoRow}>
            <View style={[styles.iconBox, { marginRight: 16 }]}>
              <Ionicons name="mail" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Email</Text>
              <Text style={styles.infoValue}>{userAuth?.email}</Text>
            </View>
          </View>
        </View>

        {/* ── Support & Actions ── */}
        <View style={styles.actionsCard}>
          <Pressable style={styles.actionRow} onPress={exportToExcel} disabled={exporting}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} style={{ marginRight: 14 }} />
            <Text style={[styles.actionText, { color: colors.primary, fontSize: 17 }]}>{userAuth?.role === "ADMIN" ? "Export Total Excel Report" : "Export Branch Excel Report"}</Text>
            {exporting ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="download-outline" size={20} color={colors.primary} />}
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.actionRow} onPress={() => Toast.show({ type: "info", text1: "Support", text2: "Contact your Admin for account modifications." })}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} style={{ marginRight: 14 }} />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* ── Logout ── */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Logout from Portal</Text>
        </Pressable>

        <Text style={styles.versionText}>BranchFlow Pro v1.2.0 • Staff Edition</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 20, paddingBottom: 40 },
  headerCard: { alignItems: "center", marginBottom: 24, marginTop: 10 },
  avatarWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.primary },
  avatarText: { color: colors.text, fontSize: 40, fontWeight: "800" },
  userName: { color: colors.text, fontSize: 26, fontWeight: "800", marginTop: 16 },
  roleBadge: { backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: colors.border },
  roleText: { color: colors.primary, fontWeight: "700", textTransform: "uppercase", fontSize: 12 },
  infoCard: { backgroundColor: colors.card, borderRadius: 28, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center" },
  infoTitle: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  infoValue: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  actionsCard: { backgroundColor: colors.card, borderRadius: 24, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  actionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  actionText: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "600" },
  logoutBtn: { backgroundColor: colors.danger, borderRadius: 20, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 },
  logoutText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  versionText: { textAlign: "center", color: colors.muted, fontSize: 12, marginTop: 30 }
});
