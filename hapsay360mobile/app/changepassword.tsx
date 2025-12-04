import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useColorScheme,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";
import BottomNav from "./components/bottomnav";

// NOTE: Make sure this IP is correct
const API_BASE = "http://192.168.1.48:3000";

export default function ChangePassword() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1a1f4d" : "#ffffff";

  // State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Visibility toggles
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdatePassword = async () => {
    // 1. Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      if (!userId || !token) {
        Alert.alert("Error", "Session expired. Please log in again.");
        router.replace("/");
        return;
      }

      // 2. API Call
      const response = await fetch(
        `${API_BASE}/api/users/${userId}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password updated successfully", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
        // Clear fields
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Failed", data.message || "Could not update password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["left", "right"]}
      style={{ backgroundColor: bgColor }}
    >
      <StatusBar barStyle="light-content" />

      {/* Reusable Gradient Header */}
      <GradientHeader title="Change Password" onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 bg-white">
          <View className="px-6 py-6 rounded-2xl mt-2">
            {/* Old Password */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-1">
                Old Password
              </Text>
              <View
                className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2"
                style={{ backgroundColor: "#DEEBF8" }}
              >
                <TextInput
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter old password"
                  secureTextEntry={!showOld}
                  className="flex-1 text-base text-gray-900"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                  <Ionicons
                    name={showOld ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#374151"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-medium mb-1">
                New Password
              </Text>
              <View
                className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2"
                style={{ backgroundColor: "#DEEBF8" }}
              >
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showNew}
                  className="flex-1 text-base text-gray-900"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons
                    name={showNew ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#374151"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-gray-700 text-sm font-medium mb-1">
                Confirm Password
              </Text>
              <View
                className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2"
                style={{ backgroundColor: "#DEEBF8" }}
              >
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirm}
                  className="flex-1 text-base text-gray-900"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#374151"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleUpdatePassword}
              style={{ backgroundColor: "#3234AB" }}
              className="rounded-lg py-4 items-center"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <BottomNav activeRoute="/(tabs)/profile" />
    </SafeAreaView>
  );
}
