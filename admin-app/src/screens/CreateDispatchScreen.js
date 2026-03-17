import { useState, useMemo, useEffect } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const categories = ["Documents", "Parcel", "Legal", "Spare Parts", "Logistics", "Equipment"];

export const CreateDispatchScreen = ({ navigation }) => {
  const { loading, error, branches, createDispatch, refresh } = useAppData();

  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [courierName, setCourierName] = useState("");
  const [description, setDescription] = useState("");
  const [geoTrackingEnabled, setGeoTrackingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Set default fromBranch if not set
  useEffect(() => {
    if (branches.length > 0 && !fromBranchId) {
      setFromBranchId(branches[0]._id);
    }
  }, [branches]);

  const fromBranch = useMemo(() => branches.find(b => b._id === fromBranchId), [branches, fromBranchId]);

  const onSubmit = async () => {
    if (!fromBranchId || !toBranchId || !courierName.trim()) {
      Alert.alert("Validation Error", "Please select both branches and enter courier name.");
      return;
    }

    try {
      setSaving(true);
      const created = await createDispatch({
        fromBranchId,
        toBranchId,
        category,
        courierName,
        description,
        dispatchDate,
        geoTrackingEnabled
      });
      await refresh();
      Alert.alert("Success", `Dispatch created successfully!\nTracking ID: ${created.trackingId}`);
      
      setCourierName("");
      setDescription("");
      setToBranchId("");
      
      navigation.navigate("DispatchDetails", { id: created._id });
    } catch (e) {
      Alert.alert("Failed", e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout title="New Shipment" loading={loading} error={error}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={styles.sectionLabel}>NETWORK ROUTE</Text>
        
        <Text style={styles.label}>Origin Branch <Text style={{color: colors.danger}}>*</Text></Text>
        <View style={styles.wrapRow}>
          {branches.map((b) => (
            <Pressable
              key={b._id}
              style={[styles.chip, fromBranchId === b._id && styles.chipActive, { marginRight: 8, marginBottom: 8 }]}
              onPress={() => {
                setFromBranchId(b._id);
                if (toBranchId === b._id) setToBranchId("");
              }}
            >
              <Text style={[styles.chipText, fromBranchId === b._id && styles.chipTextActive]}>{b.name}</Text>
            </Pressable>
          ))}
          {branches.length === 0 && <Text style={styles.emptyText}>No branches available. Create them in the Branches tab.</Text>}
        </View>

        <Text style={styles.label}>Destination Branch <Text style={{color: colors.danger}}>*</Text></Text>
        <View style={styles.wrapRow}>
          {branches.filter((b) => b._id !== fromBranchId).map((b) => (
            <Pressable
              key={b._id}
              style={[styles.chip, toBranchId === b._id && styles.chipActive, { marginRight: 8, marginBottom: 8 }]}
              onPress={() => setToBranchId(b._id)}
            >
              <Text style={[styles.chipText, toBranchId === b._id && styles.chipTextActive]}>{b.name}</Text>
            </Pressable>
          ))}
          {branches.length > 0 && branches.filter(b => b._id !== fromBranchId).length === 0 && (
             <Text style={styles.infoText}>Add more branches to enable destination selection.</Text>
          )}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>SHIPMENT DETAILS</Text>

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {categories.map((c) => (
            <Pressable key={c} style={[styles.chip, category === c && styles.chipActive, { marginRight: 8 }]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>Courier / Personnel Name <Text style={{color: colors.danger}}>*</Text></Text>
        <TextInput value={courierName} onChangeText={setCourierName} style={styles.input} placeholder="e.g. John Doe" placeholderTextColor={colors.muted} />

        <Text style={styles.label}>Description & Notes</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          placeholder="Add specific instructions or item details..."
          placeholderTextColor={colors.muted}
          multiline
        />

        <View style={styles.trackCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle}>Real-time Geo-Tracking</Text>
            <Text style={styles.trackSub}>Enable GPS location sync for this dispatch</Text>
          </View>
          <Switch 
            value={geoTrackingEnabled} 
            onValueChange={setGeoTrackingEnabled} 
            thumbColor={geoTrackingEnabled ? colors.success : colors.muted} 
            trackColor={{ false: colors.border, true: `${colors.success}55` }} 
          />
        </View>

        <Pressable style={[styles.submit, (saving || !toBranchId) && { opacity: 0.6 }]} onPress={onSubmit} disabled={saving || !toBranchId}>
          {saving ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Text style={styles.submitText}>Authorize Shipment</Text>
              <Ionicons name="shield-checkmark" size={20} color={colors.text} />
            </>
          )}
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  sectionLabel: { color: colors.primary, fontWeight: "800", fontSize: 12, letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
  label: { color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 8, marginTop: 16 },
  wrapRow: { flexDirection: "row", flexWrap: "wrap" },
  scrollRow: { flexDirection: "row" },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: colors.card, marginBottom: 4 },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}25` },
  chipText: { color: colors.muted, fontWeight: "600" },
  chipTextActive: { color: colors.text, fontWeight: "800" },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 24, opacity: 0.5 },
  trackCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20 },
  trackTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
  trackSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  submit: { marginTop: 30, backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 18, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  submitText: { color: colors.text, fontWeight: "800", fontSize: 18 },
  emptyText: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: 4 },
  infoText: { color: colors.warning, fontSize: 13, fontStyle: "italic", marginTop: 4 }
});