import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Make sure this IP matches your computer's IP
const API_BASE = "http://192.168.0.104:3000";

export default function SignupScreen() {
  const router = useRouter();

  // Updated state variables to match User Model
  const [givenName, setGivenName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validate all required fields
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !givenName ||
      !surname ||
      !middleName
    ) {
      Alert.alert("Error", "All fields marked with * are required");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Send data exactly as the Backend Model expects it
          email,
          password,
          given_name: givenName,
          middle_name: middleName,
          surname: surname,
          phone_number: phone_number || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Registration Failed", data.message || "Unknown error");
        return;
      }

      Alert.alert("Success", "Account created successfully. Please log in.");
      router.push("/");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to connect to server");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
      >
        {/* Header Section */}
        <View style={{ height: 250, width: "100%" }}>
          <LinearGradient
            colors={["#3b3b8a", "#141545"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <StatusBar style="light" />
            <Text
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: "bold",
                letterSpacing: 2,
              }}
            >
              HAPSAY360
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 5 }}>
              Create Your Account
            </Text>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View className="flex-1 bg-white px-8 pt-8 pb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">Sign Up</Text>
          <Text className="text-gray-600 text-sm mb-6">
            Fill in your information to get started
          </Text>

          {/* Given Name Input */}
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-4 text-gray-700 text-base"
            placeholder="Given Name *"
            placeholderTextColor="#9CA3AF"
            value={givenName}
            onChangeText={setGivenName}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* Middle Name Input */}
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-4 text-gray-700 text-base"
            placeholder="Middle Name *"
            placeholderTextColor="#9CA3AF"
            value={middleName}
            onChangeText={setMiddleName}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* Surname Input */}
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-4 text-gray-700 text-base"
            placeholder="Surname *"
            placeholderTextColor="#9CA3AF"
            value={surname}
            onChangeText={setSurname}
            autoCapitalize="words"
            editable={!loading}
          />

          {/* Email Input */}
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-4 text-gray-700 text-base"
            placeholder="Email *"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          {/* Phone Number Input */}
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-4 text-gray-700 text-base"
            placeholder="Phone Number (Optional)"
            placeholderTextColor="#9CA3AF"
            value={phone_number}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!loading}
          />

          {/* Password Input with Show/Hide */}
          <View className="mb-4 relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-gray-700 text-base pr-12"
              placeholder="Password *"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6 relative">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-4 text-gray-700 text-base pr-12"
              placeholder="Confirm Password *"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <TouchableOpacity
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-[#4338ca]"
            } rounded-full py-4 items-center mb-6`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-sm">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/")}
              disabled={loading}
            >
              <Text className="text-blue-600 text-sm font-semibold">
                Log In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
