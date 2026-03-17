import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const StatBox = ({ label, value, icon, color }) => (
  <View style={[styles.statBox, { borderTopColor: color, borderTopWidth: 3 }]}>
    <View style={styles.statHeader}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

export const DashboardScreen = () => {
  const { loading, error, company, branches, users, dispatches } = useAppData();

  // Null safety & default values added
  const totalBranches = branches?.length || 0;
  const totalStaff = users?.filter((u) => u.role === "STAFF").length || 0;
  const activeDispatches = dispatches?.filter((d) =>["SENT", "IN_TRANSIT", "WAITING_RECEIPT"].includes(d.status)).length || 0;
  const pendingDispatches = dispatches?.filter((d) => d.status === "PENDING").length || 0;
  const overdueDispatches = dispatches?.filter((d) => d.status === "OVERDUE").length || 0;
  const deliveredDispatches = dispatches?.filter((d) => d.status === "RECEIVED").length || 0;

  return (
    <ScreenLayout title="Admin Console" loading={loading} error={error}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- HERO CARD --- */}
        <View style={styles.heroCard}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.companyName}>{company?.name || "BranchFlow Enterprise"}</Text>
          
          <View style={styles.heroFooter}>
            <View style={styles.heroStat}>
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

        {/* --- NETWORK STATUS GRID --- */}
        <Text style={styles.sectionTitle}>Network Status</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Active Shipments" value={activeDispatches} icon="analytics" color={colors.primary} />
          <StatBox label="Pending Early" value={pendingDispatches} icon="time" color={colors.warning} />
          <StatBox label="Overdue" value={overdueDispatches} icon="alert-circle" color={colors.danger} />
          <StatBox label="Delivered" value={deliveredDispatches} icon="checkmark-done" color={colors.success} />
        </View>

        {/* --- RECENT HUBS LIST --- */}
        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Text style={styles.actionTitle}>Recent Network Hubs</Text>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          
          {branches && branches.length > 0 ? (
            branches.slice(0, 3).map((b, index) => (
              <View 
                key={b._id} 
                style={[
                  styles.hubItem, 
                  // Last item se border-bottom hata diya for clean look
                  index === Math.min(branches.length, 3) - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={styles.hubDetails}>
                  <View style={[styles.statusIndicator, { backgroundColor: b.status === "ACTIVE" ? colors.success : colors.muted }]} />
                  <View>
                    <Text style={styles.hubName}>{b.name}</Text>
                    <Text style={styles.hubSub}>{b.city} • {b.code}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No branches created yet.</Text>
          )}
        </View>

        {/* --- INFO CARD --- */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={28} color={colors.primary} style={{ marginRight: 16 }} />
          <Text style={styles.infoText}>
            You are managing <Text style={{fontWeight: "bold", color: colors.text}}>{totalBranches}</Text> active logistics hubs across the network. Check the Branches tab to generate registration keys.
          </Text>
        </View>
        
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 30 },
  
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 32,
    padding: 30,
    marginBottom: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "600", letterSpacing: 0.5 },
  companyName: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 4, letterSpacing: -0.5 },
  heroFooter: { flexDirection: "row", marginTop: 32, alignItems: "center", backgroundColor: "rgba(0,0,0,0.15)", padding: 16, borderRadius: 20 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { color: "#fff", fontSize: 26, fontWeight: "800" },
  heroStatLab: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600", marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" },
  
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 16, letterSpacing: 0.5 },

  statsGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-evenly", 
    gap: 10, 
    marginBottom: 30 
  },
  statBox: { 
    width: "40%",
    backgroundColor: colors.card, 
    borderRadius: 24, 
    padding: 18, 
    borderWidth: 1,
    borderColor: colors.border,
  },
  statHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  statContent: { marginTop: 16 },
  statValue: { color: colors.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  statLabel: { color: colors.muted, fontSize: 13, fontWeight: "600", marginTop: 4 },
  
  actionCard: { backgroundColor: colors.card, borderRadius: 28, padding: 22, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  actionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  actionTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  hubItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  hubDetails: { flexDirection: "row", alignItems: "center", gap: 12 },
  hubName: { color: colors.text, fontSize: 16, fontWeight: "700" },
  hubSub: { color: colors.muted, fontSize: 13, marginTop: 4 },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.card },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 16 },
  
  infoCard: { flexDirection: "row", backgroundColor: `${colors.primary}15`, padding: 20, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: `${colors.primary}33` },
  infoText: { flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 22 }
});