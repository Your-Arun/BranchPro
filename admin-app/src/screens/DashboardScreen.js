import { Skeleton } from "../components/Skeleton";
import { ScreenLayout } from "../components/ScreenLayout";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const StatBox = ({ label, value, icon, color, loading, onPress }) => (
  <Pressable 
    onPress={onPress} 
    style={[styles.statBox, { borderTopColor: loading ? colors.border : color, borderTopWidth: 3 }]}
    disabled={loading}
  >
    <View style={styles.statHeader}>
      <View style={[styles.iconCircle, { backgroundColor: loading ? `${colors.border}33` : `${color}15` }]}>
        {loading ? <Skeleton width={20} height={20} radius={10} /> : <Ionicons name={icon} size={22} color={color} />}
      </View>
    </View>
    <View style={styles.statContent}>
      {loading ? (
        <>
          <Skeleton width="70%" height={28} style={{ marginBottom: 6 }} />
          <Skeleton width="50%" height={13} />
        </>
      ) : (
        <>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </>
      )}
    </View>
  </Pressable>
);

const DashboardSkeleton = () => (
  <View style={{ gap: 28 }}>
    <Skeleton width="100%" height={200} radius={32} />
    <View>
      <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map(i => <StatBox key={i} loading={true} />)}
      </View>
    </View>
    <Skeleton width="100%" height={150} radius={28} />
  </View>
);

export const DashboardScreen = ({ navigation }) => {
  const { loading, error, company, branches, users, dispatches, refresh } = useAppData();

  // Null safety & default values added
  const totalBranches = branches?.length || 0;
  const totalStaff = (users || []).filter((u) => u.role === "STAFF").length;
  const activeDispatches = (dispatches || []).filter((d) => ["SENT", "IN_TRANSIT", "WAITING_RECEIPT"].includes(d.status)).length;
  const pendingDispatches = (dispatches || []).filter((d) => d.status === "PENDING").length;
  const overdueDispatches = (dispatches || []).filter((d) => d.status === "OVERDUE").length;
  const deliveredDispatches = (dispatches || []).filter((d) => d.status === "RECEIVED").length;

  if (!company && loading) {
    return (
      <ScreenLayout title="Admin Console">
        <DashboardSkeleton />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout 
      title="Admin Console" 
      error={error}
      refreshing={loading && !!company}
      onRefresh={refresh}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- HERO CARD --- */}
        <View style={styles.heroCard}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.companyName}>{company?.name || "BranchFlow Enterprise"}</Text>
          
          <View style={styles.heroFooter}>
            <Pressable style={styles.heroStat} onPress={() => navigation.navigate("Branches")}>
              <Text style={styles.heroStatVal}>{totalBranches}</Text>
              <Text style={styles.heroStatLab}>Branches</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.heroStat} onPress={() => navigation.navigate("Staff")}>
              <Text style={styles.heroStatVal}>{totalStaff}</Text>
              <Text style={styles.heroStatLab}>Staff Members</Text>
            </Pressable>
          </View>
        </View>

        {/* --- NETWORK STATUS GRID --- */}
        <Text style={styles.sectionTitle}>Network Status</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Active Shipments" value={activeDispatches} icon="analytics" color={colors.primary} onPress={() => navigation.navigate("Reports")} />
          <StatBox label="Pending Early" value={pendingDispatches} icon="time" color={colors.warning} onPress={() => navigation.navigate("Reports")} />
          <StatBox label="Overdue" value={overdueDispatches} icon="alert-circle" color={colors.danger} onPress={() => navigation.navigate("Reports")} />
          <StatBox label="Delivered" value={deliveredDispatches} icon="checkmark-done" color={colors.success} onPress={() => navigation.navigate("Reports")} />
        </View>

        {/* --- RECENT HUBS LIST --- */}
        <View style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Text style={styles.actionTitle}>Recent Network Hubs</Text>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          
          {branches && branches.length > 0 ? (
            branches.slice(0, 3).map((b, index) => (
              <Pressable 
                key={b._id} 
                onPress={() => navigation.navigate("BranchDetails", { id: b._id })}
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
              </Pressable>
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
  welcomeText: { color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  companyName: { color: "#fff", fontSize: 34, fontWeight: "900", marginTop: 4, letterSpacing: -1 },
  heroFooter: { flexDirection: "row", marginTop: 32, alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)", padding: 18, borderRadius: 24 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { color: "#fff", fontSize: 28, fontWeight: "900" },
  heroStatLab: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "700", marginTop: 4 },
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
  statValue: { color: colors.text, fontSize: 30, fontWeight: "900", letterSpacing: -1 },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: "800", marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  
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