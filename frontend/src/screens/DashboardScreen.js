import { Pressable, StyleSheet, Text, View } from "react-native";
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
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? `${colors.success}1A` : `${colors.danger}1A` }]}>
        <Ionicons name={change >= 0 ? "trending-up" : "trending-down"} size={12} color={change >= 0 ? colors.success : colors.danger} />
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

  const metrics = dashboard?.metrics;

  return (
    <ScreenLayout title="" loading={loading} error={error}>
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.greeting}>Hello, {userAuth?.fullName?.split(" ")[0] || "Staff"}</Text>
          <Text style={styles.subGreeting}>Here is your branch overview today</Text>
        </View>
        <Pressable style={styles.profileBtn}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.muted} />
        <Text style={styles.searchText}>Search tracking ID or branch...</Text>
      </View>

      {dashboard?.alert ? (
        <View style={styles.alertCard}>
          <View style={styles.alertIconArea}>
            <Ionicons name="warning" size={24} color={colors.danger} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{dashboard.alert.count} Overdue Shipments</Text>
            <Text style={styles.alertSub}>{dashboard.alert.message}</Text>
          </View>
          <Pressable style={styles.alertBtn}>
            <Text style={styles.alertBtnText}>View</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Key Metrics</Text>
      <View style={styles.grid}>
        <MetricCard label="Total Sent" value={metrics?.totalSent?.value ?? 0} change={metrics?.totalSent?.change ?? 0} icon="paper-plane" color={colors.primary} />
        <MetricCard label="Received" value={metrics?.received?.value ?? 0} change={metrics?.received?.change ?? 0} icon="download" color={colors.success} />
        <MetricCard label="Pending" value={metrics?.pending?.value ?? 0} change={metrics?.pending?.change ?? 0} icon="time" color={colors.warning} />
        <MetricCard label="Overdue" value={metrics?.overdue?.value ?? 0} change={metrics?.overdue?.change ?? 0} icon="alert-circle" color={colors.danger} />
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>Dispatch Analytics</Text>
          <Ionicons name="bar-chart" size={20} color={colors.primary} />
        </View>
        <View style={styles.chartBars}>
          {(dashboard?.monthly || []).map((item) => (
            <View key={item.label} style={styles.chartItem}>
              <View style={[styles.chartBarBg]}>
                <View style={[styles.chartBar, { height: Math.max(10, item.value / 8) }]} />
              </View>
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent Transits</Text>
        <Pressable><Text style={styles.seeAll}>See All</Text></Pressable>
      </View>

      {(dashboard?.recentActivity || []).map((item) => (
        <Pressable key={item.id} style={styles.activityCard} onPress={() => navigation.navigate("DispatchDetails", { id: item.id })}>
          <View style={styles.activityLeft}>
            <View style={styles.trackBadge}>
              <Ionicons name="cube-outline" size={22} color={colors.text} />
            </View>
            <View>
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
  headerArea: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 10 },
  greeting: { color: colors.text, fontSize: 32, fontWeight: "800", letterSpacing: 0.5 },
  subGreeting: { color: colors.muted, fontSize: 16, marginTop: 4 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}1A`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${colors.primary}33` },
  searchBar: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  searchText: { color: colors.muted, fontSize: 16 },
  alertCard: {
    backgroundColor: `${colors.danger}15`,
    borderRadius: 24,
    borderColor: `${colors.danger}40`,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24
  },
  alertIconArea: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.danger}20`, alignItems: "center", justifyContent: "center" },
  alertTitle: { color: colors.danger, fontSize: 20, fontWeight: "800" },
  alertSub: { color: `${colors.danger}CC`, fontSize: 14, marginTop: 4 },
  alertBtn: { backgroundColor: colors.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  alertBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 16, letterSpacing: 0.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24,  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconBubble: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  changeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  change: { fontSize: 12, fontWeight: "700" },
  metricBottom: { marginTop: 20 },
  metricValue: { color: colors.text, fontWeight: "800", fontSize: 36, letterSpacing: -1 },
  metricLabel: { color: colors.muted, marginTop: 4, fontSize: 14, fontWeight: "600" },
  chartCard: { backgroundColor: colors.card, borderRadius: 28, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 24 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  cardTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 160 },
  chartItem: { alignItems: "center", flex: 1 },
  chartBarBg: { width: 12, backgroundColor: `${colors.border}80`, borderRadius: 6, height: 120, justifyContent: "flex-end", overflow: "hidden" },
  chartBar: { width: "100%", backgroundColor: colors.primary, borderRadius: 6 },
  chartLabel: { color: colors.muted, marginTop: 12, fontSize: 12, fontWeight: "600" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  activityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activityLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  trackBadge: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  trackId: { color: colors.text, fontSize: 18, fontWeight: "700" },
  trackSub: { color: colors.muted, fontSize: 14, marginTop: 4 }
});
