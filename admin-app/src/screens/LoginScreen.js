import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

export const LoginScreen = ({ navigation }) => {
  const { login } = useAppData();
  const [email, setEmail] = useState("alex.rivera@branchflow.pro"); 
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Ionicons name="cube" size={60} color={colors.primary} />
          <Text style={styles.title}>BranchFlow <Text style={{color: colors.primary}}>Admin</Text></Text>
          <Text style={styles.subtitle}>Logistics Control Panel</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.loginTxt}>Sign In</Text>}
          </Pressable>
        </View>

        {/* Signup Link */}
        <Pressable style={styles.signupLinkWrap} onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, justifyContent: "center" },
  container: { padding: 24 },
  logoWrap: { alignItems: "center", marginBottom: 50 },
  title: { fontSize: 36, fontWeight: "800", color: colors.text, marginTop: 10 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 5 },
  form: { backgroundColor: colors.card, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, color: colors.text, fontSize: 16 },
  loginBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 30 },
  loginTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" },
  signupLinkWrap: { marginTop: 30, alignItems: "center" },
  signupText: { color: colors.muted, fontSize: 16 },
  signupTextBold: { color: colors.primary, fontWeight: "bold" }
});