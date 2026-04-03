import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Alert } from "react-native";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { api } from "../api/client";

export const LoginScreen = ({ navigation }) => {
  const { login } = useAppData();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Toast.show({ type: "error", text1: "Validation", text2: "Please fill all fields" });

    
    setLoading(true);
    try {
      await login(email, password);
      Toast.show({ type: "success", text1: "Success", text2: "Welcome back!" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Login Failed", text2: error.response?.data?.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return Toast.show({ type: "error", text1: "Validation", text2: "Please enter your email first" });
    setLoading(true);
    try {
      if (forgotStep === 1) {
        const { data } = await api.post("/auth/forgot-password", { email });
        Toast.show({ type: "success", text1: "Success", text2: data.message || "OTP sent!" });
        setForgotStep(2);
      } else {
        if (forgotNewPass !== forgotConfirmPass) {
          return Toast.show({ type: "error", text1: "Validation", text2: "Passwords do not match" });
        }
        if (forgotNewPass.length < 6) {
          return Toast.show({ type: "error", text1: "Validation", text2: "Password must be at least 6 characters" });
        }
        const { data } = await api.post("/auth/reset-password", { email, otp: forgotOtp, password: forgotNewPass });
        Toast.show({ type: "success", text1: "Success", text2: data.message || "Password reset successful!" });
        setIsForgotPass(false);
        setForgotStep(1);
        setForgotOtp("");
        setForgotNewPass("");
        setForgotConfirmPass("");
        setPassword("");
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.response?.data?.message || "Action failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Ionicons name="business" size={60} color={colors.primary} />
          <Text style={styles.title}>BranchFlow <Text style={{color: colors.primary}}>Admin</Text></Text>
          <Text style={styles.subtitle}>Corporate Management Console</Text>
        </View>

        <View style={styles.form}>
          {!isForgotPass ? (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry />
              
              <Pressable style={{ alignItems: "flex-end", marginTop: 8 }} onPress={() => setIsForgotPass(true)}>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>Forgot Password?</Text>
              </Pressable>

              <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.loginTxt}>Sign In</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>{forgotStep === 1 ? 'Email Address' : 'Enter OTP & New Password'}</Text>
              {forgotStep === 1 ? (
                <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              ) : (
                <View style={{ gap: 10 }}>
                  <TextInput style={[styles.input, { textAlign: 'center', letterSpacing: 5, fontWeight: 'bold' }]} placeholder="6-DIGIT OTP" placeholderTextColor={colors.muted} value={forgotOtp} onChangeText={setForgotOtp} keyboardType="number-pad" maxLength={6} />
                  <TextInput style={styles.input} placeholder="New Password" placeholderTextColor={colors.muted} value={forgotNewPass} onChangeText={setForgotNewPass} secureTextEntry />
                  <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={colors.muted} value={forgotConfirmPass} onChangeText={setForgotConfirmPass} secureTextEntry />
                </View>
              )}

              <Pressable style={styles.loginBtn} onPress={handleForgotPassword} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.loginTxt}>{forgotStep === 1 ? "Send OTP" : "Reset Password"}</Text>}
              </Pressable>
              
              <Pressable style={{ alignItems: "center", marginTop: 16 }} onPress={() => { setIsForgotPass(false); setForgotStep(1); }}>
                <Text style={{ color: colors.muted }}>Back to Login</Text>
              </Pressable>
            </>
          )}
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