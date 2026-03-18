import { useMemo, useState } from "react";
// YAHAN FIX KIYA: ScrollView import kiya
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, FlatList, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/helpers";
import { useAppData } from "../utils/AppDataContext";

import { Skeleton } from "../components/Skeleton";

const tabs =[
  { label: "All", value: "ALL" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Waiting Receipt", value: "WAITING_RECEIPT" },
  { label: "Received", value: "RECEIVED" }
];

const DispatchItem = React.memo(({ item, onPress, loading }) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={{ flex: 1 }}>
        {loading ? (
          <>
            <Skeleton width="60%" height={24} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={14} />
          </>
        ) : (
          <>
            <Text style={styles.track}>BF-{item.trackingId.split("-").pop()}</Text>
            <Text style={styles.sub}>{item.toBranch} • {item.category}</Text>
          </>
        )}
      </View>
      {loading ? (
        <Skeleton width={80} height={24} radius={12} />
      ) : (
        <StatusPill status={item.status} />
      )}
    </View>
    <View style={styles.timeRow}>
      <Ionicons name="time-outline" size={14} color={colors.muted} />
      {loading ? <Skeleton width={60} height={12} /> : <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>}
    </View>
  </View>
));

export const IncomingScreen = ({ navigation }) => {
  const { loading, error, dispatches, refresh } = useAppData();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const items = useMemo(() => {
    return dispatches.filter((d) => {
      if (active !== "ALL" && d.status !== active) return false;
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
    <View style={{ gap: 14, marginBottom: 14 }}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search items..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {tabs.map((t) => (
            <Pressable key={t.value} onPress={() => setActive(t.value)} style={[styles.tabBtn, active === t.value && styles.tabBtnActive]}>
              <Text style={[styles.tabText, active === t.value && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  if (dispatches.length === 0 && loading) {
    return (
      <ScreenLayout title="Incoming">
        <View style={{ gap: 16 }}>
          <Skeleton width="100%" height={50} radius={24} />
          <View style={{ flexDirection: "row", gap: 10, marginVertical: 8 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} width={70} height={35} radius={20} />)}
          </View>
          {[1, 2, 3].map(i => <DispatchItem key={i} loading={true} />)}
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title="Incoming" error={error}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate("DispatchDetails", { id: item._id })}>
            <DispatchItem item={item} />
          </Pressable>
        )}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: colors.cardAlt,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: { flex: 1, color: colors.text, fontSize: 17 },
  
  tabContainer: {
    marginHorizontal: -18, 
  },
  tabRow: { 
    flexDirection: "row", 
    gap: 8,
    paddingHorizontal: 18, 
  },
  
  tabBtn: { backgroundColor: colors.card, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
  tabBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: "600", fontSize: 14 },
  tabTextActive: { color: colors.text },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  track: { color: colors.text, fontWeight: "800", fontSize: 30 },
  sub: { color: colors.muted, fontSize: 16, marginTop: 2 },
  timeRow: { marginTop: 10, flexDirection: "row", gap: 6, alignItems: "center" },
  timeText: { color: colors.muted }
});