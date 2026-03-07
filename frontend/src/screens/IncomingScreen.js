import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { StatusPill } from "../components/StatusPill";
import { colors } from "../theme/colors";
import { timeAgo } from "../utils/helpers";
import { useAppData } from "../utils/AppDataContext";

const tabs = [
  { label: "All", value: "ALL" },
  { label: "In Transit", value: "IN_TRANSIT" },
  { label: "Waiting Receipt", value: "WAITING_RECEIPT" },
  { label: "Received", value: "RECEIVED" }
];

export const IncomingScreen = ({ navigation }) => {
  const { loading, error, dispatches } = useAppData();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("ALL");

  const items = useMemo(() => {
    return dispatches.filter((d) => {
      if (active !== "ALL" && d.status !== active) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return `${d.trackingId} ${d.toBranch} ${d.category}`.toLowerCase().includes(q);
    });
  }, [dispatches, search, active]);

  return (
    <ScreenLayout title="Incoming Dispatches" loading={loading} error={error}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tracking ID, branch, or document..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable key={t.value} onPress={() => setActive(t.value)} style={[styles.tabBtn, active === t.value && styles.tabBtnActive]}>
            <Text style={[styles.tabText, active === t.value && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {items.map((item) => (
        <Pressable key={item._id} style={styles.card} onPress={() => navigation.navigate("DispatchDetails", { id: item._id })}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.track}>BF-{item.trackingId.split("-").pop()}</Text>
              <Text style={styles.sub}>{item.toBranch} • {item.category}</Text>
            </View>
            <StatusPill status={item.status} />
          </View>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color={colors.muted} />
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>
        </Pressable>
      ))}
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
  tabRow: { flexDirection: "row", gap: 8 },
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
