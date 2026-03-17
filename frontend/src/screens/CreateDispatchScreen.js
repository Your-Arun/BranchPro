import { useState, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const categories = ["Documents", "Parcel", "Legal", "Spare Parts", "Logistics", "Equipment"];

export const CreateDispatchScreen = ({ navigation }) => {
  const { loading, error, branches, createDispatch, refresh, userAuth } = useAppData();

  const senderBranch = userAuth?.branch || (branches.length > 0 ? branches[0] : null);

  const [toBranchId, setToBranchId] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [courierName, setCourierName] = useState("");
  const [description, setDescription] = useState("");
  const [geoTrackingEnabled, setGeoTrackingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const destinationBranches = useMemo(() => {
    return branches.filter((b) => b._id !== senderBranch?._id);
  }, [branches, senderBranch]);

  const onSubmit = async () => {
    if (!senderBranch?._id || !toBranchId || !courierName.trim()) {
      Alert.alert("Validation Error", "Please select destination branch and enter courier name.");
      return;
    }

    try {
      setSaving(true);
      const created = await createDispatch({
        fromBranchId: senderBranch._id,
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
        
        <Text style={styles.sectionLabel}>LOGISTICS ROUTE</Text>
        
        <Text style={styles.label}>Origin Branch (Your Hub)</Text>
        <View style={styles.staticBox}>
          <Ionicons name="business" size={20} color={colors.primary} style={{ marginRight: 12 }} />
          <Text style={styles.staticText}>{senderBranch?.name || "Assigning..."}</Text>
        </View>

        <Text style={styles.label}>Destination Hub <Text style={{color: colors.danger}}>*</Text></Text>
        <View style={styles.wrapRow}>
          {destinationBranches.map((b) => (
            <Pressable
              key={b._id}
              style={[styles.chip, toBranchId === b._id && styles.chipActive, { marginRight: 8, marginBottom: 8, flexDirection: "row", alignItems: "center" }]}
              onPress={() => setToBranchId(b._id)}
            >
              <Text style={[styles.chipText, toBranchId === b._id && styles.chipTextActive]}>{b.name}</Text>
              {toBranchId === b._id && <Ionicons name="checkmark-circle" size={14} color={colors.text} style={{marginLeft: 4}} />}
            </Pressable>
          ))}
          {destinationBranches.length === 0 && (
            <Text style={styles.emptyText}>No other branches available in your network.</Text>
          )}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>SHIPMENT SPECIFICATIONS</Text>

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
          {categories.map((c) => (
            <Pressable key={c} style={[styles.chip, category === c && styles.chipActive, { marginRight: 8 }]} onPress={() => setCategory(c)}>
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>Courier / Attendant Name <Text style={{color: colors.danger}}>*</Text></Text>
        <TextInput 
          value={courierName} 
          onChangeText={setCourierName} 
          style={styles.input} 
          placeholder="Who is carrying this?" 
          placeholderTextColor={colors.muted} 
        />

        <Text style={styles.label}>Logistics Notes</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          placeholder="Add specific details or instructions..."
          placeholderTextColor={colors.muted}
          multiline
        />

        <View style={styles.trackCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle}>Geo-Location Tracking</Text>
            <Text style={styles.trackSub}>Allow real-time GPS updates</Text>
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.submitText}>Confirm & Send</Text>
              <Ionicons name="send" size={18} color={colors.text} style={{ marginLeft: 10 }} />
            </View>
          )}
        </Pressable>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  sectionLabel: { color: colors.primary, fontWeight: "800", fontSize: 12, letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
  label: { color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 8, marginTop: 16 },
  staticBox: { backgroundColor: colors.bgSoft, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center" },
  staticText: { color: colors.muted, fontSize: 16, fontWeight: "600" },
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
  trackCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", marginTop: 20 },
  trackTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
  trackSub: { color: colors.muted, fontSize: 13, marginTop: 2 },
  submit: { marginTop: 30, backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  submitText: { color: colors.text, fontWeight: "800", fontSize: 18 },
  emptyText: { color: colors.muted, fontSize: 14, fontStyle: "italic", marginTop: 4 }
});