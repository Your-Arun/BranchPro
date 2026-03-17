import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const StatBox = ({ label, value, icon, color }) => (
  <View style={styles.statBox}>
    <View style={[styles.iconCircle, { backgroundColor: `${color}15`, marginRight: 12 }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

export const DashboardScreen = () => {
  const { loading, error, company, branches, users, dispatches } = useAppData();

  const totalBranches = branches?.length || 0;
  const totalStaff = users?.filter(u => u.role === "STAFF").length || 0;
  const activeDispatches = dispatches?.filter(d => ["SENT", "IN_TRANSIT", "WAITING_RECEIPT"].includes(d.status)).length || 0;
  const pendingDispatches = dispatches?.filter(d => d.status === "PENDING").length || 0;
  const overdueDispatches = dispatches?.filter(d => d.status === "OVERDUE").length || 0;
  const deliveredDispatches = dispatches?.filter(d => d.status === "RECEIVED").length || 0;

  return (
    <ScreenLayout title="Admin Console" loading={loading} error={error}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.heroCard}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.companyName}>{company?.name || "Your Company"}</Text>
          <View style={styles.heroFooter}>
            <View style={[styles.heroStat, { marginRight: 20 }]}>
              <Text style={styles.heroStatVal}>{totalBranches}</Text>
              <Text style={styles.heroStatLab}>Branches</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{totalStaff}</Text>
              <Text style={styles.heroStatLab}>Staff Members</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Network Status</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Active Shipments" value={activeDispatches} icon="analytics" color={colors.primary} />
          <View style={{ width: 12 }} />
          <StatBox label="Pending Early" value={pendingDispatches} icon="time" color={colors.warning} />
          <View style={{ width: "100%", height: 12 }} />
          <StatBox label="Overdue" value={overdueDispatches} icon="alert-circle" color={colors.danger} />
          <View style={{ width: 12 }} />
          <StatBox label="Delivered" value={deliveredDispatches} icon="checkmark-done" color={colors.success} />
        </View>

        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Text style={styles.actionTitle}>Recent Network Hubs</Text>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          {branches.length > 0 ? (
            branches.slice(0, 3).map((b) => (
              <View key={b._id} style={styles.hubItem}>
                <View>
                  <Text style={styles.hubName}>{b.name}</Text>
                  <Text style={styles.hubSub}>{b.city} • {b.code}</Text>
                </View>
                <View style={[styles.statusIndicator, { backgroundColor: b.status === "ACTIVE" ? colors.success : colors.muted }]} />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No branches created yet.</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} style={{ marginRight: 16 }} />
          <Text style={styles.infoText}>
            You are managing {totalBranches} active logistics hubs across the network. Check the Branches tab to generate registration keys for new staff.
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 32,
    padding: 30,
    marginBottom: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8
  },
  welcomeText: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: "600" },
  companyName: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 4 },
  heroFooter: { flexDirection: "row", marginTop: 30, alignItems: "center" },
  heroStat: { flex: 1 },
  heroStatVal: { color: "#fff", fontSize: 24, fontWeight: "800" },
  heroStatLab: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 30 },
  statBox: { 
    width: "48%", 
    backgroundColor: colors.card, 
    borderRadius: 24, 
    padding: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1,
    borderColor: colors.border
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  actionCard: { backgroundColor: colors.card, borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  actionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  actionTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  hubItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  hubName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  hubSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 10 },
  infoCard: { flexDirection: "row", backgroundColor: `${colors.primary}10`, padding: 20, borderRadius: 24, alignItems: "center" },
  infoText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20, opacity: 0.8 }
});
