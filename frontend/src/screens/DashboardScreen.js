import * as React from "react";
import { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/helpers";
import { useAppData } from "../utils/AppDataContext";
import { Skeleton } from "../components/Skeleton";

const MetricCard = ({ label, value, change, icon, color, loading, onPress }) => (
  <Pressable 
    onPress={onPress}
    style={[styles.metricCard, { borderBottomColor: loading ? colors.border : color, borderBottomWidth: 3 }]}
  >
    <View style={styles.metricTop}>
      <View style={[styles.iconBubble, { backgroundColor: loading ? `${colors.cardAlt}55` : `${color}1A` }]}>
        {loading ? <Skeleton width={16} height={16} radius={8} /> : <Ionicons name={icon} size={18} color={color} />}
      </View>
      {!loading && (
        <View style={[styles.changeBadge, { backgroundColor: change >= 0 ? `${colors.success}1A` : `${colors.danger}1A` }]}>
          <Ionicons name={change >= 0 ? "trending-up" : "trending-down"} size={12} color={change >= 0 ? colors.success : colors.danger} />
          <Text style={[styles.change, { color: change >= 0 ? colors.success : colors.danger }]}>
            {Math.abs(change)}%
          </Text>
        </View>
      )}
    </View>
    <View style={styles.metricBottom}>
      {loading ? (
        <>
          <Skeleton width="60%" height={24} style={{ marginBottom: 4 }} />
          <Skeleton width="40%" height={12} />
        </>
      ) : (
        <>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricLabel}>{label}</Text>
        </>
      )}
    </View>
  </Pressable>
);

const DashboardSkeleton = () => (
  <View style={{ paddingTop: 10 }}>
    <View style={styles.headerArea}>
      <View>
        <Skeleton width={180} height={34} style={{ marginBottom: 6 }} />
        <Skeleton width={140} height={16} />
      </View>
      <Skeleton width={50} height={50} radius={25} />
    </View>
    <Skeleton width="100%" height={80} radius={20} style={{ marginBottom: 20 }} />
    <Text style={styles.sectionTitle}>Overview</Text>
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((i) => (
        <MetricCard key={i} loading={true} />
      ))}
    </View>
    <Skeleton width="100%" height={220} radius={24} style={{ marginTop: 24 }} />
  </View>
);

export const DashboardScreen = ({ navigation }) => {
  const { loading, error, dashboard, userAuth, refresh, dispatches } = useAppData();

  const metrics = dashboard?.metrics;
  const recentActivity = dashboard?.recentActivity || [];

  // Get pending incoming shipments to be confirmed by this branch
  const unconfirmedIncoming = useMemo(() => {
    if (!userAuth || userAuth.role === "ADMIN") return [];
    const branchIdStr = String(userAuth.branch?._id || userAuth.branchId);
    return (dispatches || []).filter(d => 
      String(d.toBranchId) === branchIdStr && 
      (d.status !== "RECEIVED" && d.status !== "FAILED" && d.status !== "COMPLETED")
    );
  }, [dispatches, userAuth]);

  if (!dashboard && loading) {
    return (
      <ScreenLayout title="">
        <DashboardSkeleton />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout 
      title="" 
      error={error}
      refreshing={loading && !!dashboard}
      onRefresh={refresh}
    >
      
      {/* --- HEADER AREA --- */}
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.greeting}>Hello, {userAuth?.fullName?.split(" ")[0] || "Staff"} 👋</Text>
          <Text style={styles.subGreeting}>{userAuth?.branch?.name || userAuth?.branchName || "Your Branch"}</Text>
        </View>
        
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
          <Pressable 
            style={styles.alertBtn}
            onPress={() => navigation.navigate("Incoming", { status: "OVERDUE" })}
          >
            <Text style={styles.alertBtnText}>View</Text>
          </Pressable>
        </View>
      ) : null}

      {/* --- PENDING ACTIONS SECTION (NEW) --- */}
      {unconfirmedIncoming.length > 0 && (
        <View style={{ marginBottom: 28 }}>
          <Text style={styles.sectionTitle}>Pending Deliveries</Text>
          {unconfirmedIncoming.map((item) => (
            <Pressable key={item._id || item.id} style={[styles.activityCard, { borderColor: `${colors.warning}50`, backgroundColor: `${colors.warning}0A` }]} onPress={() => navigation.navigate("DispatchDetails", { id: item._id || item.id })}>
              <View style={styles.activityLeft}>
                <View style={[styles.trackBadge, { backgroundColor: `${colors.warning}1A`, borderColor: `${colors.warning}33` }]}>
                  <Ionicons name="time-outline" size={20} color={colors.warning} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.trackId}>#{item.trackingId}</Text>
                  <Text style={styles.trackSub}>From {item.fromBranch} • {timeAgo(item.createdAt)}</Text>
                </View>
              </View>
              <Pressable 
                 style={{ backgroundColor: colors.warning, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                 onPress={() => navigation.navigate("DispatchDetails", { id: item._id || item.id })}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>Confirm</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>
      )}

      {/* --- KEY METRICS --- */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.grid}>
        <MetricCard 
          label="Sent" 
          value={metrics?.totalSent?.value ?? 0} 
          change={metrics?.totalSent?.change ?? 0} 
          icon="paper-plane" 
          color={colors.primary} 
          onPress={() => navigation.navigate("Incoming", { status: "ALL" })}
        />
        <MetricCard 
          label="Received" 
          value={metrics?.received?.value ?? 0} 
          change={metrics?.received?.change ?? 0} 
          icon="download" 
          color={colors.success} 
          onPress={() => navigation.navigate("Incoming", { status: "RECEIVED" })}
        />
        <MetricCard 
          label="Pending" 
          value={metrics?.pending?.value ?? 0} 
          change={metrics?.pending?.change ?? 0} 
          icon="time" 
          color={colors.warning} 
          onPress={() => navigation.navigate("Incoming", { status: "TRANSIT" })}
        />
        <MetricCard 
          label="Overdue" 
          value={metrics?.overdue?.value ?? 0} 
          change={metrics?.overdue?.change ?? 0} 
          icon="alert-circle" 
          color={colors.danger} 
          onPress={() => navigation.navigate("Incoming", { status: "OVERDUE" })}
        />
      </View>

      {/* --- CHART AREA --- */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.cardTitle}>Analytics</Text>
          <Ionicons name="bar-chart" size={20} color={colors.primary} />
        </View>
        <View style={styles.chartBars}>
          {(dashboard?.monthly ||[]).map((item) => (
            <View key={item.label} style={styles.chartItem}>
              <View style={[styles.chartBarBg]}>
                <View style={[styles.chartBar, { height: Math.max(8, item.value / 8) }]} />
              </View>
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* --- RECENT ACTIVITY --- */}
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>Recent Transits</Text>
        <Pressable onPress={() => navigation.navigate("Incoming", { status: "ALL" })}>
          <Text style={styles.seeAll}>See All</Text>
        </Pressable>
      </View>

      {(recentActivity).map((item) => (
        <Pressable key={item.id} style={styles.activityCard} onPress={() => navigation.navigate("DispatchDetails", { id: item.id })}>
          <View style={styles.activityLeft}>
            <View style={styles.trackBadge}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
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
  headerArea: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, marginTop: 5 },
  greeting: { color: colors.text, fontSize: 32, fontWeight: "900", letterSpacing: 0.5 },
  subGreeting: { color: colors.muted, fontSize: 16, marginTop: 4, fontWeight: "600" },
  profileBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: `${colors.primary}1A`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${colors.primary}40` },
  profileInitials: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  
  alertCard: {
    backgroundColor: `${colors.danger}11`,
    borderRadius: 20,
    borderColor: `${colors.danger}40`,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24
  },
  alertIconArea: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.danger}1A`, alignItems: "center", justifyContent: "center" },
  alertTitle: { color: colors.danger, fontSize: 17, fontWeight: "800" },
  alertSub: { color: `${colors.danger}CC`, fontSize: 13, marginTop: 2, fontWeight: "500" },
  alertBtn: { backgroundColor: colors.danger, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  alertBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 16, letterSpacing: 0.5 },
  
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    rowGap: 16, 
    marginBottom: 24,  
  },
  metricCard: {
    width: "48%", 
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  iconBubble: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  changeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 4, borderRadius: 10, gap: 4 },
  change: { fontSize: 11, fontWeight: "800" },
  metricBottom: { marginTop: 16 },
  metricValue: { color: colors.text, fontWeight: "800", fontSize: 26, letterSpacing: -0.5 },
  metricLabel: { color: colors.muted, marginTop: 4, fontSize: 13, fontWeight: "600" },
  
  chartCard: { backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 28 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 140 },
  chartItem: { alignItems: "center", flex: 1 },
  chartBarBg: { width: 12, backgroundColor: `${colors.border}80`, borderRadius: 6, height: 100, justifyContent: "flex-end", overflow: "hidden" },
  chartBar: { width: "100%", backgroundColor: colors.primary, borderRadius: 6 },
  chartLabel: { color: colors.muted, marginTop: 10, fontSize: 12, fontWeight: "700" },
  
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  
  activityCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activityLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  trackBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}1A`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${colors.primary}33` },
  trackId: { color: colors.text, fontSize: 16, fontWeight: "800" },
  trackSub: { color: colors.muted, fontSize: 13, marginTop: 4, fontWeight: "500" }
});