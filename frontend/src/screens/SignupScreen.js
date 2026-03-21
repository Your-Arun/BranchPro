import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";

export const SignupScreen = ({ navigation }) => {
  const { signup } = useAppData();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added showPassword state
  const [registrationKey, setRegistrationKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !registrationKey) {
      return Toast.show({ type: "error", text1: "Validation", text2: "Required fields: Full Name, Email, Password, Branch Key." });
    }
    
    setLoading(true);
    try {
      await signup({ 
        fullName, 
        email, 
        password,
        registrationKey 
      });
      
      Toast.show({ type: "success", text1: "Success", text2: "Account created successfully!" });
    } catch (error) {
      console.log("Signup error detailed:", error);
      Toast.show({ type: "error", text1: "Signup Failed", text2: error.response?.data?.message || error.message || "Registration error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.headerWrap}>
          <Text style={styles.title}>Join Branch</Text>
          <Text style={styles.subtitle}>Enter the key provided by your admin.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={colors.muted}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@company.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Branch Key (From Admin)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. AB12CD"
            placeholderTextColor={colors.muted}
            value={registrationKey}
            onChangeText={(txt) => setRegistrationKey(txt.toUpperCase())}
            autoCapitalize="characters"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.muted} />
            </Pressable>
          </View>

          <Pressable style={styles.signupBtn} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.signupTxt}>Signup & Join Branch</Text>}
          </Pressable>
        </View>

        <Pressable style={styles.footerRow} onPress={() => navigation.goBack()}>
          <Text style={styles.footerText}>Already have an account? <Text style={styles.footerLink}>Sign In</Text></Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 24, paddingBottom: 50 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  headerWrap: { marginBottom: 30 },
  title: { fontSize: 36, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 5 },
  form: { backgroundColor: colors.card, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, color: colors.text, fontSize: 16 },
  passwordContainer: { flexDirection: "row", alignItems: "center", backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border, borderRadius: 16 },
  passwordInput: { flex: 1, padding: 16, color: colors.text, fontSize: 16 },
  eyeIcon: { padding: 16 },
  signupBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 30 },
  signupTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" },
  footerRow: { marginTop: 30, alignItems: "center" },
  footerText: { color: colors.muted, fontSize: 16 },
  footerLink: { color: colors.primary, fontWeight: "bold" }
});