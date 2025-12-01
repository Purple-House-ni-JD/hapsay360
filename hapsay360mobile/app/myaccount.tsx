import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useColorScheme,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";
import BottomNav from "./components/bottomnav";

const API_BASE = "http://192.168.1.6:3000";

export default function MyAccount() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1a1f4d" : "#ffffff";

  // State Management
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Form States
  const [givenName, setGivenName] = useState("");
  const [surname, setSurname] = useState("");

  // 1. FETCH USER DATA
  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      if (!userId || !token) {
        Alert.alert("Error", "Session expired. Please log in again.");
        router.replace("/");
        return;
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.data;
        setUserData(user);

        // Pre-fill inputs with fetched data
        setGivenName(user.personal_info?.given_name || "");
        setSurname(user.personal_info?.surname || "");
      } else {
        Alert.alert("Error", data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // 2. SAVE CHANGES (UPDATE USER)
  const handleSave = async () => {
    // Basic validation
    if (!givenName || !surname) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");

      // Construct payload matching your Schema
      // We keep existing middle_name/others to avoid overwriting them with null
      const payload = {
        personal_info: {
          given_name: givenName,
          surname: surname,
          middle_name: userData?.personal_info?.middle_name || "",
          // Add other personal_info fields if your backend requires them fully
        },
      };

      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "PUT", // Or PATCH, depending on your backend route
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully");
        setIsEditing(false);
        // Refresh local data
        setUserData({ ...userData, ...payload });
      } else {
        Alert.alert(
          "Update Failed",
          result.message || "Could not update profile"
        );
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  // 3. IMAGE LOGIC (SVG -> PNG FIX)
  const profileImageUri = userData?.profile_picture
    ? userData.profile_picture.replace("svg", "png")
    : "https://ui-avatars.com/api/?name=User";

  if (loading && !userData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3234AB" />
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      edges={["left", "right"]}
      style={{ backgroundColor: bgColor }}
    >
      <StatusBar barStyle="light-content" />

      {/* Reusable Gradient Header */}
      <GradientHeader title="My Account" onBack={() => router.back()} />

      <ScrollView className="flex-1 bg-white">
        {/* Profile Section */}
        <View className="items-center pt-10 pb-6">
          <View className="w-36 h-36 rounded-full overflow-hidden mb-3 shadow-md border-4 border-gray-100">
            <Image
              source={{ uri: profileImageUri }}
              className="w-full h-full"
            />
          </View>
          <Text className="text-gray-900 text-xl font-semibold">
            {givenName} {surname}
          </Text>
          <Text className="text-gray-500 text-sm">
            ID: {userData?.custom_id}
          </Text>
        </View>

        {/* Editable Info Fields */}
        <View className="px-6 py-4 rounded-2xl mt-2">
          {/* First Name */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1">
              Given Name
            </Text>
            <TextInput
              value={givenName}
              onChangeText={setGivenName}
              editable={isEditing}
              placeholder="Given Name"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900"
              style={{
                backgroundColor: "#DEEBF8",
                opacity: isEditing ? 1 : 0.7,
              }}
            />
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1">
              Surname
            </Text>
            <TextInput
              value={surname}
              onChangeText={setSurname}
              editable={isEditing}
              placeholder="Surname"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900"
              style={{
                backgroundColor: "#DEEBF8",
                opacity: isEditing ? 1 : 0.7,
              }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 mb-8 px-6">
          {/* Edit / Save Button */}
          <TouchableOpacity
            onPress={toggleEdit}
            style={{ backgroundColor: "#3234AB", marginBottom: 16 }}
            className="rounded-lg py-4 items-center"
            disabled={loading && isEditing}
          >
            {loading && isEditing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            onPress={() => router.push("/changepassword")}
            style={{ backgroundColor: "#3234AB" }}
            className="rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Change Password
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeRoute="/(tabs)/clearance" />
    </SafeAreaView>
  );
}
