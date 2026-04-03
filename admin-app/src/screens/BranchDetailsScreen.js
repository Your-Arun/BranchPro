import { useMemo } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { StatusPill } from "../components/StatusPill";

export const BranchDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { branches, users, dispatches } = useAppData();

  const branch = useMemo(() => branches.find((b) => b._id === id), [branches, id]);

  const relatedStaff = useMemo(() => {
    return (users || []).filter(u => u.branchId?._id === id || u.branchId === id);
  }, [users, id]);

  const relatedDispatches = useMemo(() => {
    if (!branch) return [];
    return (dispatches || []).filter(d => 
      d.fromBranch === branch.name || 
      d.toBranch === branch.name ||
      d.fromBranchId?._id === id ||
      d.toBranchId?._id === id
    );
  }, [dispatches, branch, id]);

  if (!branch) {
    return (
      <View style={[styles.safe, styles.center]}>
        <Text style={styles.title}>Branch not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
           <Text style={{color: colors.primary, marginTop: 20}}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{branch.name}</Text>
          <Text style={styles.subtitle}>{branch.city} • <Text style={{color: colors.primary}}>{branch.code}</Text></Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* -- HUB INFO CARDS -- */}
        <View style={styles.card}>
           <Text style={styles.label}>PHYSICAL ADDRESS</Text>
           <Text style={styles.textValue}>{branch.address}</Text>

           <View style={{ marginTop: 20 }}>
             <Text style={styles.label}>CURRENT STATUS</Text>
             <View style={[styles.statusBadge, { backgroundColor: branch.status === "ACTIVE" ? `${colors.success}22` : `${colors.muted}22` }]}>
                <View style={[styles.dot, { backgroundColor: branch.status === "ACTIVE" ? colors.success : colors.muted }]} />
                <Text style={[styles.statusText, { color: branch.status === "ACTIVE" ? colors.success : colors.muted }]}>{branch.status}</Text>
             </View>
           </View>
        </View>

        {/* -- RELATED STAFF -- */}
        <Text style={styles.sectionTitle}>Assigned Staff ({relatedStaff.length})</Text>
        <View style={styles.listCard}>
          {relatedStaff.length > 0 ? relatedStaff.map((u, i) => (
            <View key={u._id} style={[styles.rowItem, i === relatedStaff.length - 1 && { borderBottomWidth: 0 }]}>
               <View style={styles.avatar}>
                 <Text style={styles.avatarTxt}>{u.fullName[0].toUpperCase()}</Text>
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={styles.rowTitle}>{u.fullName}</Text>
                 <Text style={styles.rowSub}>{u.email}</Text>
               </View>
               <Text style={styles.roleTxt}>{u.role}</Text>
            </View>
          )) : (
            <Text style={styles.emptyTxt}>No staff assigned to this hub yet.</Text>
          )}
        </View>

        {/* -- RELATED DISPATCHES -- */}
        <Text style={styles.sectionTitle}>Hub Shipments ({relatedDispatches.length})</Text>
        <View style={styles.listCard}>
          {relatedDispatches.length > 0 ? relatedDispatches.map((d, i) => (
            <Pressable 
              key={d._id} 
              style={[styles.rowItem, i === relatedDispatches.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate("DispatchDetails", { id: d._id })}
            >
               <View style={{ flex: 1, paddingRight: 10 }}>
                 <Text style={styles.rowTitle}>#{d.trackingId}</Text>
                 <Text style={styles.rowSub}>{d.fromBranch} → {d.toBranch}</Text>
               </View>
               <StatusPill status={d.status} />
            </Pressable>
          )) : (
            <Text style={styles.emptyTxt}>No shipments linked to this hub.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 40 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { color: colors.text, fontSize: 32, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 16, fontWeight: "700", marginTop: 4 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  label: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6 },
  textValue: { color: colors.text, fontSize: 16, fontWeight: "600", lineHeight: 22 },
  statusBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: "800" },

  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 16 },
  listCard: { backgroundColor: colors.card, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: colors.border, marginBottom: 24 },
  rowItem: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarTxt: { color: colors.primary, fontSize: 16, fontWeight: "800" },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 2 },
  rowSub: { color: colors.muted, fontSize: 13 },
  roleTxt: { color: colors.primary, fontSize: 12, fontWeight: "800", backgroundColor: colors.bgSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  emptyTxt: { color: colors.muted, fontSize: 14, textAlign: "center", paddingVertical: 20 }
});
