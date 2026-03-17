import { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/helpers";
import { useAppData } from "../utils/AppDataContext";

const MetricCard = ({ label, value, change, icon, color }) => (
  <View style={[styles.metricCard, { borderBottomColor: color, borderBottomWidth: 4 }]}>
    <View style={styles.metricTop}>
      <View style={[styles.iconBubble, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? `${colors.success}1A` : `${colors.danger}1A` }]}>
        <Ionicons name={change >= 0 ? "trending-up" : "trending-down"} size={14} color={change >= 0 ? colors.success : colors.danger} />
        <Text style={[styles.change, { color: change >= 0 ? colors.success : colors.danger }]}>
          {Math.abs(change)}%
        </Text>
      </View>
    </View>
    <View style={styles.metricBottom}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  </View>
);

export const DashboardScreen = ({ navigation }) => {
  const { loading, error, dashboard, userAuth } = useAppData();
  const [search, setSearch] = useState("");

  const metrics = dashboard?.metrics;

  const filteredActivity = useMemo(() => {
    const list = dashboard?.recentActivity || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(item => 
      item.trackingId?.toLowerCase().includes(q) || 
      item.branchName?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  }, [dashboard?.recentActivity, search]);

  return (
    <ScreenLayout title="" loading={loading} error={error}>
      
      {/* --- HEADER AREA --- */}
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.greeting}>Hello, {userAuth?.fullName?.split(" ")[0] || "Staff"} 👋</Text>
          <Text style={styles.subGreeting}>{userAuth?.branch?.name || userAuth?.branchName || "Your Branch"} Overview</Text>
        </View>
        
        {/* FIX: Redirect to ProfileScreen and show Initials */}
        <Pressable 
          style={styles.profileBtn} 
          onPress={() => navigation.navigate("Profile")}
        >
          {userAuth?.fullName ? (
            <Text style={styles.profileInitials}>{userAuth.fullName[0].toUpperCase()}</Text>
          ) : (
            <Ionicons name="person" size={20} color={colors.primary} />
          )}
        </Pressable>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={22} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracking ID or branch..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* --- ALERT CARD --- */}
      {dashboard?.alert ? (
        <View style={styles.alertCard}>
          <View style={styles.alertIconArea}>
            <Ionicons name="warning" size={24} color={colors.danger} />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            <Text style={styles.alertTitle}>{dashboard.alert.count} Overdue Shipments</Text>
            <Text style={styles.alertSub}>{dashboard.alert.message}</Text>
          </View>
          <Pressable style={styles.alertBtn}>
            <Text style={styles.alertBtnText}>View</Text>
          </Pressable>
        </View>
      ) : null}

      {/* --- KEY METRICS --- */}
      <Text style={styles.sectionTitle}>Key Metrics</Text>
      <View style={styles.grid}>
        <MetricCard label="Total Sent" value={metrics?.totalSent?.value ?? 0} change={metrics?.totalSent?.change ?? 0} icon="paper-plane" color={colors.primary} />
        <MetricCard label="Received" value={metrics?.received?.value ?? 0} change={metrics?.received?.change ?? 0} icon="download" color={colors.success} />
        <MetricCard label="Pending" value={metrics?.pending?.value ?? 0} change={metrics?.pending?.change ?? 0} icon="time" color={colors.warning} />
        <MetricCard label="Overdue" value={metrics?.overdue?.value ?? 0} change={metrics?.overdue?.change ?? 0} icon="alert-circle" color={colors.danger} />
      </View>

      {/* --- CHART AREA --- */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>Dispatch Analytics</Text>
          <Ionicons name="bar-chart" size={22} color={colors.primary} />
        </View>
        <View style={styles.chartBars}>
          {(dashboard?.monthly ||[]).map((item) => (
            <View key={item.label} style={styles.chartItem}>
              <View style={[styles.chartBarBg]}>
                <View style={[styles.chartBar, { height: Math.max(12, item.value / 8) }]} />
              </View>
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* --- RECENT ACTIVITY --- */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent Transits</Text>
        <Pressable><Text style={styles.seeAll}>See All</Text></Pressable>
      </View>

      {(filteredActivity).map((item) => (
        <Pressable key={item.id} style={styles.activityCard} onPress={() => navigation.navigate("DispatchDetails", { id: item.id })}>
          <View style={styles.activityLeft}>
            <View style={styles.trackBadge}>
              <Ionicons name="cube-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.trackId}>#{item.trackingId}</Text>
              <Text style={styles.trackSub}>{item.branchName} • {timeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <StatusPill status={item.status} />
        </Pressable>
      ))}
      <View style={{height: 20}} />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  headerArea: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 5 },
  greeting: { color: colors.text, fontSize: 30, fontWeight: "800", letterSpacing: 0.5 },
  subGreeting: { color: colors.muted, fontSize: 16, marginTop: 6, fontWeight: "500" },
  profileBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.primary}22`, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: `${colors.primary}66` },
  profileInitials: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  
  searchBar: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 16, marginLeft: 12, paddingVertical: 0 },
  
  alertCard: {
    backgroundColor: `${colors.danger}15`,
    borderRadius: 24,
    borderColor: `${colors.danger}40`,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28
  },
  alertIconArea: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.danger}20`, alignItems: "center", justifyContent: "center" },
  alertTitle: { color: colors.danger, fontSize: 18, fontWeight: "800" },
  alertSub: { color: `${colors.danger}CC`, fontSize: 13, marginTop: 4, fontWeight: "500" },
  alertBtn: { backgroundColor: colors.danger, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  alertBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: 16, letterSpacing: 0.5 },
  
 
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-evenly", 
    gap: 10, 
    marginBottom: 10,  
  },
  metricCard: {
    width: "40%", 
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconBubble: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  changeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, gap: 4 },
  change: { fontSize: 12, fontWeight: "800" },
  metricBottom: { marginTop: 24 },
  metricValue: { color: colors.text, fontWeight: "800", fontSize: 34, letterSpacing: -1 },
  metricLabel: { color: colors.muted, marginTop: 6, fontSize: 15, fontWeight: "600" },
  
  chartCard: { backgroundColor: colors.card, borderRadius: 28, borderWidth: 1, borderColor: colors.border, padding: 22, marginBottom: 28 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 160 },
  chartItem: { alignItems: "center", flex: 1 },
  chartBarBg: { width: 14, backgroundColor: `${colors.border}80`, borderRadius: 7, height: 120, justifyContent: "flex-end", overflow: "hidden" },
  chartBar: { width: "100%", backgroundColor: colors.primary, borderRadius: 7 },
  chartLabel: { color: colors.muted, marginTop: 14, fontSize: 13, fontWeight: "700" },
  
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, marginTop: 8 },
  seeAll: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  
  activityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  activityLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  trackBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.primary}1A`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${colors.primary}33` },
  trackId: { color: colors.text, fontSize: 18, fontWeight: "800" },
  trackSub: { color: colors.muted, fontSize: 14, marginTop: 6, fontWeight: "500" }
});