import * as React from "react";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

export const BranchesScreen = () => {
  const { loading, error, branches } = useAppData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => `${b.name} ${b.city}`.toLowerCase().includes(q));
  }, [search, branches]);

  return (
    <ScreenLayout title="Branches" loading={loading} error={error}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.muted} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search branch name or city"
          placeholderTextColor={colors.muted}
        />
      </View>

      {filtered.map((b) => (
        <Pressable key={b._id} style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.iconBubble, { marginRight: 12 }]}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={styles.name}>{b.name}</Text>
                <View style={styles.pill}><Text style={styles.pillText}>{b.status}</Text></View>
              </View>
              <Text style={styles.addr}>{b.address}</Text>
              <Text style={styles.dispatches}>Active Dispatches: {b.activeDispatches}</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={18} color={colors.muted} />
          </View>
        </Pressable>
      ))}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchBar: { backgroundColor: colors.card, borderRadius: 20, borderColor: colors.border, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, color: colors.text, fontSize: 17 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 24, padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "flex-start" },
  iconBubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgSoft, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { color: colors.text, fontWeight: "800", fontSize: 34, flex: 1 },
  pill: { borderColor: `${colors.success}66`, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: `${colors.success}22` },
  pillText: { color: colors.success, fontWeight: "700" },
  addr: { color: colors.muted, fontSize: 16, marginTop: 2 },
  dispatches: { color: colors.primary, marginTop: 10, fontWeight: "700" }
});
