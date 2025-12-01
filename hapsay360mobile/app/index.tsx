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
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://192.168.1.6:3000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    const fetchWithTimeout = (url, options, timeout = 10000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Network timeout")), timeout)
        ),
      ]);
    };

    try {
      console.log("Sending login request to:", `${API_BASE}/api/auth/login`);

      const response = await fetchWithTimeout(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
        10000
      );

      console.log("Login response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        console.log("Login failed:", data);
        setError(data.message || "Invalid credentials");
        return;
      }

      console.log("Login successful:", data);

      // --- CRITICAL FIX STARTS HERE ---

      // 1. Save Token (Mao ni pangitaon sa TrackRequests: "authToken")
      await AsyncStorage.setItem("authToken", data.token);

      // 2. Save User ID (IMPORTANTE: Mao ni ang kulang ganina)
      if (data.user && data.user._id) {
        await AsyncStorage.setItem("userId", data.user._id);
      }

      // 3. Save User Name (Optional: Para sa "Hello, [Name]" sa home screen)
      if (data.user && data.user.given_name) {
        await AsyncStorage.setItem("userName", data.user.given_name);
      }

      // 4. Save Full User Object (Optional, basig need nimo sa profile page)
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // --- CRITICAL FIX ENDS HERE ---

      router.replace("./(tabs)");
    } catch (err) {
      console.error("Login error:", err);
      if (err.message === "Network timeout") {
        setError("Server took too long to respond. Please try again.");
      } else {
        setError("Failed to connect to server. Check your network or server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login pressed");
  };

  const handleForgotPassword = () => {
    router.push("/forgotpassword");
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
        {/* Header */}
        <View style={{ height: 300, width: "100%" }}>
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
            <Image
              source={require("../assets/images/icon.png")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: "white",
                fontSize: 22,
                fontWeight: "bold",
                letterSpacing: 2,
                marginTop: 10,
              }}
            >
              HAPSAY360
            </Text>
          </LinearGradient>
        </View>

        {/* Form */}
        <View className="flex-1 bg-white px-8 pt-8">
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-4 text-gray-700 text-base"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-4 mb-2 text-gray-700 text-base"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoComplete="password"
            editable={!loading}
          />

          {error ? (
            <Text className="text-red-500 text-sm mb-4 text-center">
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleForgotPassword}
            className="self-end mb-6"
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text className="text-gray-600 text-sm">Forgot Your Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`${
              loading ? "bg-gray-400" : "bg-[#4338ca]"
            } rounded-full py-4 items-center mb-6`}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Log in</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="flex-row justify-center mb-8 gap-4">
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className="w-12 h-12 rounded-full bg-white border border-gray-300 items-center justify-center shadow-sm"
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text className="text-lg font-bold text-red-500">G</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFacebookLogin}
              className="w-12 h-12 rounded-full bg-white border border-gray-300 items-center justify-center shadow-sm"
              activeOpacity={0.7}
              disabled={loading}
            >
              <Text className="text-xl font-bold text-blue-600">f</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center">
            <Text className="text-gray-600 text-sm">
              Don't have an account?{" "}
            </Text>
            <Link href="/SignupScreen" asChild>
              <TouchableOpacity disabled={loading}>
                <Text className="text-blue-600 text-sm font-semibold underline">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
