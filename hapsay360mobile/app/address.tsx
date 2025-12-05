import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";

const API_BASE = "http://192.168.0.104:3000";

export default function Addresses() {
  const router = useRouter();
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
  const [updating, setUpdating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  // Fetch current user address
  const fetchUserAddress = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("User not found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch user address");
        setLoading(false);
        return;
      }

      if (data?.data?.address) {
        setAddress(data.data.address);
      } else {
        setError("No address found for this user");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddress();
  }, []);

  const handleChange = (field, value) => {
    setAddress({ ...address, [field]: value });
  };

  const handleUpdate = async () => {
    setError("");
    setUpdating(true);

    const requiredFields = [
      "street",
      "barangay",
      "city",
      "province",
      "postal_code",
      "country",
    ];
    for (const field of requiredFields) {
      if (!address[field].trim()) {
        Alert.alert(
          "Validation Error",
          `Please enter ${field.replace("_", " ")}`
        );
        setUpdating(false);
        return;
      }
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("User not found. Please log in.");
        setUpdating(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update address");
        setUpdating(false);
        return;
      }

      Alert.alert("Success", "Address updated successfully!");
      setEditing(false); // Disable editing after update
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1" edges={["left", "right"]}>
        <GradientHeader title="Address" onBack={() => router.back()} />

        <ScrollView
          className="flex-1 px-6 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#4338ca" />
          ) : error ? (
            <View className="p-4 bg-red-50 rounded-xl mb-6">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          ) : (
            <View className="flex-1 space-y-4">
              {[
                { label: "House No.", key: "house_no" },
                { label: "Street", key: "street" },
                { label: "Barangay", key: "barangay" },
                { label: "City", key: "city" },
                { label: "Province", key: "province" },
                { label: "Postal Code", key: "postal_code" },
                { label: "Country", key: "country" },
              ].map((item) => (
                <View key={item.key} className="mb-2">
                  <Text className="text-gray-700 font-medium mb-1">
                    {item.label}
                  </Text>
                  <TextInput
                    className={`border border-gray-300 rounded-xl p-4 text-base bg-gray-50 ${
                      editing ? "bg-white" : "bg-gray-100"
                    }`}
                    placeholder={item.label}
                    value={address[item.key]}
                    onChangeText={(text) => handleChange(item.key, text)}
                    editable={editing}
                  />
                </View>
              ))}

              <TouchableOpacity
                className={`py-4 rounded-xl mt-6 bg-indigo-600`}
                style={{
                  shadowColor: "#4338ca",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
                onPress={editing ? handleUpdate : () => setEditing(true)}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">
                    {editing ? "Update" : "Edit"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
