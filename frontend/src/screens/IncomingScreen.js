import * as React from "react";
import { useMemo, useState } from "react";
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  FlatList, 
  RefreshControl, 
  ScrollView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/helpers";
import { useAppData } from "../utils/AppDataContext";
import { Skeleton } from "../components/Skeleton";

const tabs = [
  { label: "All Items", value: "ALL", icon: "grid-outline" },
  { label: "Transit", value: "TRANSIT", icon: "paper-plane-outline" },
  { label: "Awaiting Receipt", value: "WAITING", icon: "time-outline" },
  { label: "Received", value: "RECEIVED", icon: "checkmark-done-outline" }
];

const statusColors = {
  SENT: colors.info,
  IN_TRANSIT: colors.primary,
  WAITING_RECEIPT: colors.warning,
  PENDING: colors.warning,
  RECEIVED: colors.success,
  OVERDUE: colors.danger,
  FAILED: colors.danger,
};

const DispatchItem = React.memo(({ item, onPress, loading }) => {
  const borderColor = statusColors[item?.status] || colors.border;
  
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.statusStrip, { backgroundColor: borderColor }]} />
      
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View>
            {loading ? (
              <Skeleton width={120} height={20} style={{ marginBottom: 4 }} />
            ) : (
              <Text style={styles.trackId}>BF-{item.trackingId.split("-").pop()}</Text>
            )}
            <Text style={styles.catLabel}>{item?.category ?? "General Parcel"}</Text>
          </View>
          {loading ? (
            <Skeleton width={80} height={24} radius={12} />
          ) : (
            <StatusPill status={item.status} />
          )}
        </View>

        <View style={styles.routeContainer}>
           <View style={styles.routePoint}>
              <View style={styles.dot} />
              <Text style={styles.branchName} numberOfLines={1}>{item?.fromBranch || "Branch A"}</Text>
           </View>
           <View style={styles.routeLine}>
              <Ionicons name="chevron-forward" size={14} color={colors.border} />
           </View>
           <View style={styles.routePoint}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.branchName} numberOfLines={1}>{item?.toBranch || "Branch B"}</Text>
           </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.timeArea}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.timeText}>{loading ? "..." : timeAgo(item.createdAt)}</Text>
          </View>
          <View style={styles.courierArea}>
             <Ionicons name="cube-outline" size={14} color={colors.muted} />
             <Text style={styles.courierText}>{item?.courierName || "Standard"}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export const IncomingScreen = ({ navigation, route }) => {
  const { loading, error, dispatches, refresh } = useAppData();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // Handle initial status from navigation (e.g. from Dashboard)
  React.useEffect(() => {
    if (route.params?.status) {
      setActive(route.params.status);
    }
  }, [route.params?.status]);

  const items = useMemo(() => {
    return dispatches.filter((d) => {
      if (active === "TRANSIT") {
        if (d.status !== "SENT" && d.status !== "IN_TRANSIT") return false;
      } else if (active === "WAITING") {
        if (d.status !== "WAITING_RECEIPT" && d.status !== "PENDING" && d.status !== "OVERDUE") return false;
      } else if (active !== "ALL" && d.status !== active) {
        return false;
      }
      const q = search.trim().toLowerCase();
      if (!q) return true;
      
      const trackingId = d.trackingId?.toLowerCase() || "";
      const toBranch = d.toBranch?.toLowerCase() || "";
      const category = d.category?.toLowerCase() || "";
      
      return trackingId.includes(q) || toBranch.includes(q) || category.includes(q);
    });
  }, [dispatches, search, active]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* --- SEARCH GLASS --- */}
      <View style={styles.searchContainer}>
        <View style={styles.searchGlass}>
          <Ionicons name="search" size={20} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search shipments..."
            placeholderTextColor={`${colors.muted}88`}
            style={styles.searchInput}
          />
          {search ? (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* --- TABS --- */}
      <View style={styles.tabWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabScroll}
        >
          {tabs.map((t) => (
            <Pressable 
              key={t.value} 
              onPress={() => setActive(t.value)} 
              style={[
                styles.tabItem, 
                active === t.value && styles.tabItemActive
              ]}
            >
              <Ionicons 
                name={t.icon} 
                size={18} 
                color={active === t.value ? "#fff" : colors.muted} 
              />
              <Text style={[
                styles.tabLabel, 
                active === t.value && styles.tabLabelActive
              ]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.listHeader}>
        <Text style={styles.resultsCount}>{items.length} Shipments found</Text>
      </View>
    </View>
  );

  if (dispatches.length === 0 && loading) {
    return (
      <ScreenLayout title="Incoming">
        <View style={{ gap: 20 }}>
          <Skeleton width="100%" height={60} radius={20} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} width={100} height={40} radius={20} />)}
          </View>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} width="100%" height={140} radius={24} style={{ marginBottom: 12 }} />)}
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Incoming" error={error} scrollable={false}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <DispatchItem 
            item={item} 
            onPress={() => navigation.navigate("DispatchDetails", { id: item._id })} 
          />
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.primary} 
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.listBody}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        ListEmptyComponent={
          <Pressable style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color={colors.border} />
            <Text style={styles.emptyTitle}>No shipments found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or filters.</Text>
          </Pressable>
        }
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: 10 },
  searchContainer: { marginBottom: 20 },
  searchGlass: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  tabWrapper: { marginHorizontal: -20, marginBottom: 16 },
  tabScroll: { paddingHorizontal: 20, gap: 10 },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: { color: colors.muted, fontSize: 14, fontWeight: "700" },
  tabLabelActive: { color: "#fff" },
  
  listHeader: { marginBottom: 12 },
  resultsCount: { color: colors.muted, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  
  listBody: { paddingBottom: 100 },
  
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statusStrip: { width: 6 },
  cardBody: { flex: 1, padding: 18 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  trackId: { color: colors.text, fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  catLabel: { color: colors.muted, fontSize: 12, fontWeight: "600", marginTop: 2 },
  
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.bgSoft}CC`,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  routePoint: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.muted },
  branchName: { color: colors.text, fontSize: 14, fontWeight: "700", flex: 1 },
  routeLine: { paddingHorizontal: 10 },
  
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timeArea: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  courierArea: { flexDirection: "row", alignItems: "center", gap: 6 },
  courierText: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  
  emptyContainer: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  emptySub: { color: colors.muted, fontSize: 14, textAlign: "center" }
});