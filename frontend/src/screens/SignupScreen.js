import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAppData } from "../utils/AppDataContext";
import { api } from "../api/client"; // Axios client

export const SignupScreen = ({ navigation }) => {
  const { register } = useAppData();
  
  const[fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  
  const[branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const[fetchingBranches, setFetchingBranches] = useState(true); // Naya Loading State Branches k liye

  // Fetch branches directly for signup (Because Context branches are only loaded after login)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setFetchingBranches(true);
        const { data } = await api.get("/branches");
        setBranches(data);
        if (data.length > 0) {
          setSelectedBranch(data[0]._id); // Auto-select pehli branch
        }
      } catch (e) {
        console.error("Failed to load branches for signup", e);
        Alert.alert("Network Error", "Could not load branches from server.");
      } finally {
        setFetchingBranches(false);
      }
    };
    fetchBranches();
  },[]);

  const handleSignup = async () => {
    if (!fullName || !email || !password || !selectedBranch) {
      return Alert.alert("Validation", "Please fill all fields and select a branch.");
    }
    
    setLoading(true);
    try {
      await register({ fullName, email, password, branchId: selectedBranch });
      // Context register successful hote hi auto-login karke Main Tabs par bhej dega
    } catch (error) {
      Alert.alert("Signup Failed", error.response?.data?.message || "Registration error");
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join BranchFlow Pro today.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={colors.muted}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@branchflow.pro"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 6 characters"
            placeholderTextColor={colors.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Select Your Branch</Text>
          
          {/* YAHAN FIX KIYA HAI: Branch fetch hone tak Spinner dikhayega */}
          {fetchingBranches ? (
            <View style={{ padding: 10, alignItems: "flex-start" }}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : (
            <View style={styles.branchWrap}>
              {branches.map((b) => (
                <Pressable 
                  key={b._id} 
                  style={[styles.chip, selectedBranch === b._id && styles.chipActive]} 
                  onPress={() => setSelectedBranch(b._id)}
                >
                  <Text style={[styles.chipText, selectedBranch === b._id && styles.chipTextActive]}>
                    {b.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable style={styles.signupBtn} onPress={handleSignup} disabled={loading || fetchingBranches}>
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.signupTxt}>Register</Text>}
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
  branchWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.bgSoft },
  chipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}33` },
  chipText: { color: colors.muted },
  chipTextActive: { color: colors.text, fontWeight: "700" },
  signupBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: "center", marginTop: 30 },
  signupTxt: { color: colors.text, fontSize: 18, fontWeight: "bold" },
  footerRow: { marginTop: 30, alignItems: "center" },
  footerText: { color: colors.muted, fontSize: 16 },
  footerLink: { color: colors.primary, fontWeight: "bold" }
});