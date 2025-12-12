import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";

const API_BASE = "https://hapsay360backend-1kyj.onrender.com";

export default function ReporterInfo() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState({
    house_no: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch user info from backend
  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to fetch user info");
        setLoading(false);
        return;
      }

      const user = data.data;

      // Set full name
      const { given_name, middle_name, surname, qualifier } =
        user.personal_info;
      const nameParts = [given_name, middle_name, surname, qualifier].filter(
        Boolean
      );
      setFullName(nameParts.join(" "));

      // Set contact number
      setContactNumber(user.phone_number || "");

      // Set address if exists
      if (user.address) setAddress(user.address);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Helper function to format address cleanly
  const getFormattedAddress = () => {
    const addressParts = [
      address.house_no,
      address.street,
      address.barangay,
      address.city,
      address.province,
      address.postal_code,
      address.country,
    ];

    // Filter out empty values and join with comma
    return addressParts
      .filter((part) => part && String(part).trim() !== "")
      .join(", ");
  };

  const handleNext = () => {
    // Basic validation
    // Note: checking address.street might fail if user only has city,
    // but keeping your original logic mostly intact.
    if (!fullName || !contactNumber) {
      Alert.alert(
        "Error",
        "Please fill out required fields before proceeding."
      );
      return;
    }

    if (contactNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid contact number.");
      return;
    }

    // Use the clean address function
    const fullAddress = getFormattedAddress();

    router.push(
      `/incidentdetails?reporterName=${encodeURIComponent(
        fullName
      )}&reporterContact=${encodeURIComponent(
        contactNumber
      )}&reporterAddress=${encodeURIComponent(fullAddress)}`
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1" edges={["left", "right"]}>
        <GradientHeader title="File Blotter" onBack={() => router.back()} />

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#4338ca" />
          ) : (
            <>
              <Text className="text-2xl font-bold text-gray-900 mb-6">
                Reporter's Information
              </Text>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                  style={{ backgroundColor: "#DEEBF8" }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Contact Number</Text>
                <TextInput
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  placeholder="Enter your contact number"
                  keyboardType="phone-pad"
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                  style={{ backgroundColor: "#DEEBF8" }}
                />
              </View>

              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Home Address</Text>
                <TextInput
                  // Uses the helper function to avoid ",,,,,"
                  value={getFormattedAddress()}
                  onChangeText={(text) =>
                    setAddress({ ...address, street: text })
                  }
                  placeholder="Enter your home address"
                  multiline
                  className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
                  style={{ backgroundColor: "#DEEBF8" }}
                />
              </View>

              <TouchableOpacity
                onPress={handleNext}
                className="bg-indigo-600 rounded-xl py-4 mt-4"
              >
                <Text className="text-white text-center font-semibold">
                  Next
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
