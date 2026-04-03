import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Skeleton } from "../components/Skeleton";
import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";


const StatRow = ({ label, value, icon, color, loading, onPress, isActive }) => (
  <Pressable 
    onPress={onPress} 
    style={[styles.statRow, isActive && { backgroundColor: `${color}10`, borderRadius: 12, paddingHorizontal: 8 }]}
    disabled={!onPress || loading}
  >
    <View style={[styles.statIcon, { backgroundColor: loading ? `${colors.border}33` : `${color}15` }]}>
      {loading ? <Skeleton width={18} height={18} radius={9} /> : <Ionicons name={icon} size={20} color={color} />}
    </View>
    <View style={{ flex: 1, marginLeft: 10 }}>
        {loading ? <Skeleton width="60%" height={16} /> : <Text style={[styles.statLabel, isActive && { fontWeight: "800", color }]}>{label}</Text>}
    </View>
    {loading ? <Skeleton width={40} height={24} /> : <Text style={[styles.statValue, { color }]}>{value}</Text>}
    {onPress && <Ionicons name="chevron-forward" size={14} color={colors.muted} style={{ marginLeft: 8 }} />}
  </Pressable>
);

const ReportsSkeleton = () => (
  <View style={{ gap: 20 }}>
    <Skeleton width="100%" height={140} radius={28} />
    <View style={styles.card}>
      <Skeleton width="50%" height={20} style={{ marginBottom: 20 }} />
      {[1, 2, 3, 4, 5].map(i => <StatRow key={i} loading={true} />)}
    </View>
    <Skeleton width="100%" height={200} radius={24} />
  </View>
);

export const ReportsScreen = ({ navigation }) => {
  const { loading, error, reports, branches, users, dispatches } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const toggleFilter = (status) => {
    setStatusFilter(prev => prev === status ? null : status);
  };

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
  const branchStats = (branches || []).map(b => {
    const count = dispatches?.filter(d => d.fromBranch === b.name || d.toBranch === b.name).length || 0;
    return { _id: b._id, name: b.name, count };
  }).sort((a, b) => b.count - a.count);

  const maxCount = branchStats[0]?.count || 1;

  const filteredDispatches = (dispatches || []).filter(d => {
    const matchesSearch = !searchQuery || 
      d.trackingId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.docketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fromBranch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.toBranch?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || d.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if ((branches?.length === 0 || !branches) && loading) {
    return (
      <ScreenLayout title="Company Reports">
        <ReportsSkeleton />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Company Reports" error={error}>
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

 {/* ── Branch Performance ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branch Activity</Text>
          {branchStats.length === 0 ? (
            <Text style={styles.emptyText}>No branch data yet</Text>
          ) : (
            branchStats.map((b) => (
              <Pressable key={b._id} style={styles.barRow} onPress={() => navigation.navigate("BranchDetails", { id: b._id })}>
                <Text style={[styles.barName, { marginRight: 10 }]}>{b.name}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(4, (b.count / maxCount) * 100)}%` }]} />
                </View>
                <Text style={[styles.barCount, { marginLeft: 10 }]}>{b.count}</Text>
              </Pressable>
            ))
          )}
        </View>

        {/* ── Dispatch Status Breakdown ── */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Text style={styles.cardTitle}>Dispatch Status Breakdown</Text>
            {statusFilter && (
              <Pressable onPress={() => setStatusFilter(null)}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>Clear Filter</Text>
              </Pressable>
            )}
          </View>
          <StatRow label="Sent / Ready" value={sent} icon="paper-plane" color={colors.primary} onPress={() => toggleFilter("SENT")} isActive={statusFilter === "SENT"} />
          <StatRow label="In Transit" value={inTransit} icon="navigate" color="#a855f7" onPress={() => toggleFilter("IN_TRANSIT")} isActive={statusFilter === "IN_TRANSIT"} />
          <StatRow label="Received" value={received} icon="checkmark-circle" color={colors.success} onPress={() => toggleFilter("RECEIVED")} isActive={statusFilter === "RECEIVED"} />
          <StatRow label="Pending" value={pending} icon="time" color={colors.warning} onPress={() => toggleFilter("PENDING")} isActive={statusFilter === "PENDING"} />
          <StatRow label="Overdue" value={overdue} icon="alert-circle" color={colors.danger} onPress={() => toggleFilter("OVERDUE")} isActive={statusFilter === "OVERDUE"} />
        </View>

      

        {/* ── All Dispatches / Search ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipment Tracking</Text>
          
          <View style={styles.searchBar}>
             <Ionicons name="search" size={18} color={colors.muted} />
             <TextInput 
               style={styles.searchInput} 
               placeholder="Search tracking ID, docket, or branch..." 
               placeholderTextColor={colors.muted}
               value={searchQuery}
               onChangeText={setSearchQuery}
             />
          </View>

          {filteredDispatches.map((d) => (
            <Pressable key={d._id} style={styles.recentRow} onPress={() => navigation.navigate("DispatchDetails", { id: d._id })}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trackId}>#{d.trackingId}</Text>
                <Text style={styles.trackSub}>{d.fromBranch} → {d.toBranch}</Text>
              </View>
              <StatusPill status={d.status} />
            </Pressable>
          ))}
          {filteredDispatches.length === 0 && (
            <Text style={styles.emptyText}>No shipments found.</Text>
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
  card: { backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 16 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 14 },
  statRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  statLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "600" },
  statValue: { fontSize: 20, fontWeight: "800" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  barName: { color: colors.text, fontSize: 13, fontWeight: "600", width: 90 },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.bgSoft, borderRadius: 4 },
  barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 4 },
  barCount: { color: colors.muted, fontWeight: "700", fontSize: 13, width: 28, textAlign: "right" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bgSoft, padding: 12, borderRadius: 12, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 10, color: colors.text, fontSize: 15 },
  recentRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border },
  trackId: { color: colors.text, fontWeight: "700", fontSize: 15 },
  trackSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 16 }
});
