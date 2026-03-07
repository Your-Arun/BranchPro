import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/helpers";
import { useAppData } from "../utils/AppDataContext";

const MetricCard = ({ label, value, change, icon, color }) => (
  <View style={styles.metricCard}>
    <View style={styles.metricTop}>
      <View style={[styles.iconBubble, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.change, { color: change >= 0 ? colors.success : colors.danger }]}>
        {change >= 0 ? `+${change}%` : `${change}%`}
      </Text>
    </View>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

export const DashboardScreen = ({ navigation }) => {
  const { loading, error, dashboard } = useAppData();

  const metrics = dashboard?.metrics;

  return (
    <ScreenLayout title="BranchFlow Pro" loading={loading} error={error}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <Text style={styles.searchText}>Search transactions...</Text>
      </View>

      {dashboard?.alert ? (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={20} color={colors.danger} />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>{dashboard.alert.count} Overdue Shipments</Text>
            <Text style={styles.alertSub}>{dashboard.alert.message}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.grid}>
        <MetricCard label="Total Sent" value={metrics?.totalSent?.value ?? 0} change={metrics?.totalSent?.change ?? 0} icon="arrow-up" color={colors.primary} />
        <MetricCard label="Received" value={metrics?.received?.value ?? 0} change={metrics?.received?.change ?? 0} icon="arrow-down" color={colors.success} />
        <MetricCard label="Pending" value={metrics?.pending?.value ?? 0} change={metrics?.pending?.change ?? 0} icon="time" color={colors.warning} />
        <MetricCard label="Overdue" value={metrics?.overdue?.value ?? 0} change={metrics?.overdue?.change ?? 0} icon="alert-circle" color={colors.danger} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Monthly Dispatch</Text>
        <View style={styles.chartBars}>
          {(dashboard?.monthly || []).map((item) => (
            <View key={item.label} style={styles.chartItem}>
              <View style={[styles.chartBar, { height: Math.max(10, item.value / 8) }]} />
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
      </View>

      {(dashboard?.recentActivity || []).map((item) => (
        <Pressable key={item.id} style={styles.activityCard} onPress={() => navigation.navigate("DispatchDetails", { id: item.id })}>
          <View style={styles.activityLeft}>
            <View style={styles.trackBadge}>
              <Ionicons name="cube" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.trackId}>#{item.trackingId}</Text>
              <Text style={styles.trackSub}>{item.branchName} • {timeAgo(item.createdAt)}</Text>
            </View>
          </View>
          <StatusPill status={item.status} />
        </Pressable>
      ))}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  searchText: { color: colors.muted, fontSize: 18 },
  alertCard: {
    backgroundColor: "#2a1830",
    borderRadius: 24,
    borderColor: "#60243e",
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  alertTitle: { color: colors.text, fontSize: 30, fontWeight: "800" },
  alertSub: { color: colors.danger, fontSize: 16, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: {
    width: "48.5%",
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 132
  },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBubble: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  change: { fontSize: 14, fontWeight: "700" },
  metricLabel: { color: colors.muted, marginTop: 14, fontSize: 16 },
  metricValue: { color: colors.text, fontWeight: "800", fontSize: 40, marginTop: 2 },
  chartCard: { backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 16 },
  cardTitle: { color: colors.text, fontSize: 30, fontWeight: "700" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 170, marginTop: 18 },
  chartItem: { alignItems: "center", flex: 1 },
  chartBar: { width: 24, backgroundColor: colors.primary, borderRadius: 8 },
  chartLabel: { color: colors.muted, marginTop: 10, fontSize: 14 },
  sectionHead: { marginTop: 8 },
  activityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  activityLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  trackBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center" },
  trackId: { color: colors.text, fontSize: 30, fontWeight: "700" },
  trackSub: { color: colors.muted, fontSize: 16 }
});
