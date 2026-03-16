import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const StatRow = ({ label, value, icon, color }) => (
  <View style={styles.statRow}>
    <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export const ReportsScreen = () => {
  const { loading, error, reports, branches, users, dispatches } = useAppData();

  // Compute live stats from existing state (fast, no extra API call)
  const totalBranches = branches?.length || 0;
  const totalStaff = users?.filter(u => u.role === "STAFF").length || 0;
  const totalAdmins = users?.filter(u => u.role === "ADMIN").length || 0;

  const totalDispatches = dispatches?.length || 0;
  const sent = dispatches?.filter(d => d.status === "SENT").length || 0;
  const inTransit = dispatches?.filter(d => d.status === "IN_TRANSIT").length || 0;
  const received = dispatches?.filter(d => d.status === "RECEIVED").length || 0;
  const pending = dispatches?.filter(d => d.status === "PENDING").length || 0;
  const overdue = dispatches?.filter(d => d.status === "OVERDUE").length || 0;

  // Branch performance: count dispatches per branch
  const branchStats = branches.map(b => {
    const count = dispatches?.filter(d => d.fromBranch === b.name || d.toBranch === b.name).length || 0;
    return { name: b.name, count };
  }).sort((a, b) => b.count - a.count);

  const maxCount = branchStats[0]?.count || 1;

  return (
    <ScreenLayout title="Company Reports" loading={loading} error={error}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* ── Network Summary ── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Network Overview</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroVal}>{totalBranches}</Text>
              <Text style={styles.heroLab}>Branches</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroVal}>{totalStaff}</Text>
              <Text style={styles.heroLab}>Staff</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroVal}>{totalDispatches}</Text>
              <Text style={styles.heroLab}>Dispatches</Text>
            </View>
          </View>
        </View>

        {/* ── Dispatch Status Breakdown ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dispatch Status Breakdown</Text>
          <StatRow label="Sent / Ready" value={sent} icon="paper-plane" color={colors.primary} />
          <StatRow label="In Transit" value={inTransit} icon="navigate" color="#a855f7" />
          <StatRow label="Received" value={received} icon="checkmark-circle" color={colors.success} />
          <StatRow label="Pending" value={pending} icon="time" color={colors.warning} />
          <StatRow label="Overdue" value={overdue} icon="alert-circle" color={colors.danger} />
        </View>

        {/* ── Branch Performance ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branch Activity</Text>
          {branchStats.length === 0 ? (
            <Text style={styles.emptyText}>No branch data yet</Text>
          ) : (
            branchStats.map((b) => (
              <View key={b.name} style={styles.barRow}>
                <Text style={styles.barName}>{b.name}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(4, (b.count / maxCount) * 100)}%` }]} />
                </View>
                <Text style={styles.barCount}>{b.count}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Users Summary ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Team Breakdown</Text>
          <StatRow label="Staff Members" value={totalStaff} icon="people" color={colors.primary} />
          <StatRow label="Admins" value={totalAdmins} icon="shield-checkmark" color={colors.success} />
        </View>

        {/* ── Recent Dispatches ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {(dispatches || []).slice(0, 5).map((d) => (
            <View key={d._id} style={styles.recentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackId}>#{d.trackingId}</Text>
                <Text style={styles.trackSub}>{d.fromBranch} → {d.toBranch}</Text>
              </View>
              <StatusPill status={d.status} />
            </View>
          ))}
          {dispatches?.length === 0 && (
            <Text style={styles.emptyText}>No dispatches yet</Text>
          )}
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  heroCard: { backgroundColor: colors.primary, borderRadius: 28, padding: 24, marginBottom: 20 },
  heroTitle: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  heroStats: { flexDirection: "row", alignItems: "center" },
  heroStat: { flex: 1, alignItems: "center" },
  heroVal: { color: "#fff", fontSize: 32, fontWeight: "900" },
  heroLab: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginTop: 4 },
  heroDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" },
  card: { backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 16, gap: 4 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 14 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" },
  statValue: { fontSize: 20, fontWeight: "800" },
  barRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  barName: { color: colors.text, fontSize: 13, fontWeight: "600", width: 90 },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.bgSoft, borderRadius: 4 },
  barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  barCount: { color: colors.muted, fontWeight: "700", fontSize: 13, width: 28, textAlign: "right" },
  recentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  trackId: { color: colors.text, fontWeight: "700", fontSize: 15 },
  trackSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 16 }
});
