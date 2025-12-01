import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "../components/GradientHeader";

// NOTE: Make sure this IP is correct
const API_BASE = "http://192.168.1.6:3000";

const ChevronRight = () => (
  <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
);

const MenuItem = ({ icon, title, onPress }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-4 px-5 rounded-xl mb-3 mx-3"
    style={{
      backgroundColor: "#DEEBF8",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={20} color="#1E3A8A" />
      <Text className="text-gray-900 text-base font-medium">{title}</Text>
    </View>
    <ChevronRight />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();

  // State for data and loading
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Fix: Get data inside the "data" wrapper
        setUserData(data.data);
      } else {
        Alert.alert("API Error", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Network Error", "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text className="text-gray-500 mt-2">Loading profile...</Text>
      </View>
    );
  }

  // --- IMAGE URL LOGIC ---
  // If the URL contains "svg", replace it with "png".
  // If no URL exists, use a default avatar.
  const profileImageUri = userData?.profile_picture
    ? userData.profile_picture.replace("svg", "png")
    : "https://ui-avatars.com/api/?name=User";

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      <GradientHeader title="Profile" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View className="items-center pt-6 pb-4">
          <View
            className="w-36 h-36 rounded-full overflow-hidden mb-3 border-4"
            style={{ borderColor: "#E0E7FF" }}
          >
            {/* --- THIS IS THE FIX --- */}
            <Image
              source={{ uri: profileImageUri }}
              className="w-full h-full"
            />
          </View>

          {/* User Name */}
          <Text className="text-gray-900 text-xl font-semibold">
            {userData?.personal_info?.given_name}{" "}
            {userData?.personal_info?.surname}
          </Text>

          {/* User Email */}
          <Text className="text-indigo-700 text-sm mt-1 font-medium">
            {userData?.email}
          </Text>

          {/* User ID */}
          <Text className="text-gray-400 text-xs mt-1">
            ID: {userData?.custom_id}
          </Text>
        </View>

        {/* Menu Section */}
        <View className="mt-2 mx-2 bg-white rounded-2xl overflow-hidden">
          <Text className="text-gray-900 font-semibold text-base px-5 py-3">
            General
          </Text>

          <MenuItem
            icon="person-outline"
            title="My Account"
            onPress={() => router.push("/myaccount")}
          />
          <MenuItem
            icon="calendar-outline"
            title="My Appointments"
            onPress={() => router.push("/myappointments")}
          />
          <MenuItem
            icon="card-outline"
            title="Payment"
            onPress={() => router.push("/payment")}
          />
          <MenuItem
            icon="location-outline"
            title="Addresses"
            onPress={() => router.push("/address")}
          />
          <MenuItem
            icon="cube-outline"
            title="Track Requests"
            onPress={() => router.push("/trackrequests")}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            onPress={() => router.push("/settings")}
          />
          <MenuItem
            icon="log-out-outline"
            title="Log Out"
            onPress={() => {
              Alert.alert("Log Out", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Log Out",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.clear();
                    router.replace("/");
                  },
                },
              ]);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
