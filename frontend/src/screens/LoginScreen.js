import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Alert } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";


export const LoginScreen = ({ navigation }) => {
  const { login } = useAppData();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Toast.show({ type: "error", text1: "Validation", text2: "Please fill all fields" });

    
    setLoading(true);
    try {
      await login(email, password);
      Toast.show({ type: "success", text1: "Success", text2: "Account logged in successfully!" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Login Failed", text2: error.response?.data?.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Ionicons name="barcode" size={60} color={colors.primary} />
          <Text style={styles.title}>BranchFlow <Text style={{color: colors.primary}}>Pro</Text></Text>
          <Text style={styles.subtitle}>Staff Operations Portal</Text>
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.muted} />
            </Pressable>
          </View>

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
  passwordContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 16 },
  passwordInput: { flex: 1, padding: 16, color: colors.text, fontSize: 16 },
  eyeIcon: { padding: 16 },
  loginBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 30 },
  loginTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" },
  signupLinkWrap: { marginTop: 30, alignItems: "center" },
  signupText: { color: colors.muted, fontSize: 16 },
  signupTextBold: { color: colors.primary, fontWeight: "bold" }
});