import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Alert } from "react-native";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

export const CompanySetupScreen = () => {
  const { setupCompany, logout, userAuth } = useAppData();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      return Toast.show({ type: "error", text1: "Validation", text2: "Please fill all fields." });
    }
    
    setLoading(true);
    try {
      await setupCompany({ name, email, phone });
      Toast.show({ type: "success", text1: "Success", text2: "Company profile created!" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Company Setup</Text>
          <Text style={styles.subtitle}>Welcome {userAuth?.fullName}. Set up your company to continue.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Acme Corp"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Company Email</Text>
          <TextInput
            style={styles.input}
            placeholder="contact@acme.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Company Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 1122334455"
            placeholderTextColor={colors.muted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Pressable style={styles.btn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.btnTxt}>Create Company</Text>}
          </Pressable>

          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutTxt}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, justifyContent: "center", flex: 1 },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: colors.text },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 10 },
  form: { backgroundColor: colors.card, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, color: colors.text, fontSize: 16 },
  btn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 30 },
  btnTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" },
  logoutBtn: { marginTop: 20, alignItems: "center" },
  logoutTxt: { color: colors.muted, fontSize: 16, textDecorationLine: "underline" }
});
