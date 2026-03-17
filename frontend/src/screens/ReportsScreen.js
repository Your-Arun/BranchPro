import { StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const Tile = ({ label, value }) => (
  <View style={styles.tile}>
    <Text style={styles.tileValue}>{value}</Text>
    <Text style={styles.tileLabel}>{label}</Text>
  </View>
);

export const ReportsScreen = () => {
  const { loading, error, reports } = useAppData();

  return (
    <ScreenLayout title="Reports" loading={loading} error={error}>
      <View style={styles.grid}>
        <Tile label="Total Dispatches" value={reports?.summary?.totalDispatches ?? 0} />
        <View style={{ width: 10 }} />
        <Tile label="Total Received" value={reports?.summary?.totalReceived ?? 0} />
        <View style={{ width: "100%", height: 10 }} />
        <Tile label="Pending" value={reports?.summary?.pending ?? 0} />
        <View style={{ width: 10 }} />
        <Tile label="Overdue" value={reports?.summary?.overdue ?? 0} />
      </View>

      <View style={styles.card}>
        <Text style={styles.head}>Branch Performance</Text>
        {(reports?.branchPerformance || []).map((b) => (
          <View key={b.branchName} style={styles.barRow}>
            <Text style={styles.barName}>{b.branchName}</Text>
            <View style={styles.barWrap}>
              <View style={[styles.barFill, { width: `${Math.min(100, b.value * 10)}%` }]} />
            </View>
            <Text style={styles.barVal}>{b.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.head}>Dispatch Categories</Text>
        {(reports?.categories || []).map((c) => (
          <View key={c.category} style={styles.categoryRow}>
            <Text style={styles.barName}>{c.category}</Text>
            <Text style={styles.barVal}>{c.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.head}>Recent Records</Text>
        {(reports?.recentRecords || []).map((r) => (
          <View key={r._id} style={styles.recordRow}>
            <View>
              <Text style={styles.recordId}>#{r.trackingId}</Text>
              <Text style={styles.recordDate}>{new Date(r.createdAt).toDateString()}</Text>
            </View>
            <StatusPill status={r.status} />
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap" },
  tile: { width: "48.5%", backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 14 },
  tileValue: { color: colors.text, fontSize: 34, fontWeight: "800" },
  tileLabel: { color: colors.muted, marginTop: 4 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 14 },
  head: { color: colors.text, fontSize: 22, fontWeight: "700", marginBottom: 10 },
  barRow: { marginBottom: 10 },
  barName: { color: colors.text, marginBottom: 4 },
  barWrap: { height: 7, backgroundColor: colors.bgSoft, borderRadius: 999 },
  barFill: { height: "100%", backgroundColor: colors.primary, borderRadius: 999 },
  barVal: { color: colors.muted, marginTop: 4, fontWeight: "700" },
  categoryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  recordRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  recordId: { color: colors.text, fontWeight: "700" },
  recordDate: { color: colors.muted }
});
