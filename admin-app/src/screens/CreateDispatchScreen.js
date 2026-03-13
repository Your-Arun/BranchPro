import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

const categories =["Documents", "Parcel", "Legal", "Spare Parts", "Logistics"];

export const CreateDispatchScreen = ({ navigation }) => {
  // YAHAN FIX KIYA HAI: userAuth context se nikala
  const { loading, error, branches, createDispatch, refresh, userAuth } = useAppData();

  // Ab hardcoded 'HQ' ki jagah actual logged-in user ki branch ID use hogi
  const senderBranch = userAuth?.branch || branches[0];

  const[toBranchId, setToBranchId] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [courierName, setCourierName] = useState("");
  const[description, setDescription] = useState("");
  const [geoTrackingEnabled, setGeoTrackingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    // Validation
    if (!senderBranch?._id || !toBranchId || !courierName.trim()) {
      Alert.alert("Validation Error", "Please select destination branch and enter courier name.");
      return;
    }

    try {
      setSaving(true);
      const created = await createDispatch({
        fromBranchId: senderBranch._id, // Actual Sender Branch ID sent to backend
        toBranchId,
        category,
        courierName,
        description,
        dispatchDate,
        geoTrackingEnabled
      });
      await refresh();
      Alert.alert("Success", `Dispatch created successfully!\nTracking ID: ${created.trackingId}`);
      
      // Form reset karein aur Details page par bhejein
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
    <ScreenLayout title="Create Dispatch" loading={loading} error={error}>
      <Text style={styles.label}>From Branch (Auto-filled)</Text>
      <View style={styles.select}>
        {/* Yahan actual branch ka name show hoga */}
        <Text style={styles.selectText}>{senderBranch?.name || "Loading..."}</Text>
      </View>

      <Text style={styles.label}>To Branch <Text style={{color: colors.danger}}>*</Text></Text>
      <View style={styles.wrapRow}>
        {/* Sender branch ko filter out kar diya taaki khud ko na bhej sake */}
        {branches.filter((b) => b._id !== senderBranch?._id).map((b) => (
          <Pressable
            key={b._id}
            style={[styles.chip, toBranchId === b._id && styles.chipActive]}
            onPress={() => setToBranchId(b._id)}
          >
            <Text style={[styles.chipText, toBranchId === b._id && styles.chipTextActive]}>{b.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.wrapRow}>
        {categories.map((c) => (
          <Pressable key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Dispatch Date (YYYY-MM-DD)</Text>
      <TextInput value={dispatchDate} onChangeText={setDispatchDate} style={styles.input} placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Courier Name <Text style={{color: colors.danger}}>*</Text></Text>
      <TextInput value={courierName} onChangeText={setCourierName} style={styles.input} placeholder="Enter courier full name" placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        placeholder="Add dispatch notes..."
        placeholderTextColor={colors.muted}
        multiline
      />

      <View style={styles.trackCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.trackTitle}>Geo-location Tracking</Text>
          <Text style={styles.trackSub}>Real-time GPS updates for this dispatch</Text>
        </View>
        <Switch value={geoTrackingEnabled} onValueChange={setGeoTrackingEnabled} thumbColor={colors.text} trackColor={{ false: colors.border, true: colors.primary }} />
      </View>

      <Pressable style={[styles.submit, saving && { opacity: 0.7 }]} onPress={onSubmit} disabled={saving}>
        <Text style={styles.submitText}>{saving ? "Creating..." : "Generate Dispatch"}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.text} />
      </Pressable>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 8, marginTop: 10 },
  select: { backgroundColor: colors.bgSoft, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16 },
  selectText: { color: colors.muted, fontSize: 16, fontWeight: "600" },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.card },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}33` },
  chipText: { color: colors.muted },
  chipTextActive: { color: colors.text, fontWeight: "700" },
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
  textArea: { minHeight: 100, textAlignVertical: "top" },
  trackCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  trackTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  trackSub: { color: colors.muted, marginTop: 2 },
  submit: { marginTop: 20, backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  submitText: { color: colors.text, fontWeight: "800", fontSize: 18 }
});