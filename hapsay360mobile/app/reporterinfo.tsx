import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import GradientHeader from "./components/GradientHeader";

const API_BASE = "http://192.168.1.6:3000";
export default function ReporterInfo() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    // Validation
    if (!fullName || !contactNumber || !address) {
      Alert.alert("Error", "Please fill out all fields before proceeding.");
      return;
    }

    // Basic contact number validation
    if (contactNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid contact number.");
      return;
    }

    // Navigate to incident details with reporter info
    router.push(
      `/incidentdetails?reporterName=${encodeURIComponent(fullName)}&reporterContact=${encodeURIComponent(contactNumber)}&location=${encodeURIComponent(address)}`
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      {/* Keep your GradientHeader */}
      <GradientHeader title="File Blotter" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Reporter's Information
        </Text>

        {/* Full Name */}
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

        {/* Contact Number */}
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

        {/* Address */}
        <View className="mb-4">
          <Text className="text-gray-700 mb-1">Home Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            multiline
            className="border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
            style={{ backgroundColor: "#DEEBF8" }}
          />
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          className="bg-indigo-600 rounded-xl py-4 mt-4"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Saving..." : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
