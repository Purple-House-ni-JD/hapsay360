import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  StatusBar,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import GradientHeader from "./components/GradientHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. MATCHING YOUR WORKING CONFIG
const API_BASE = "http://192.168.1.6:3000";

export default function TrackRequests() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dividerColor = isDark ? "#4b5563" : "#d1d5db";

  // --- STATE ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // --- ANIMATIONS ---
  const { height } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(height)).current;

  // --- FETCH ALL REQUESTS (ON LOAD) ---
  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      // DEBUGGING LOGS (Check your terminal for this!)
      console.log("--- DEBUG TRACK REQUESTS ---");
      console.log("Token:", token ? "Exists" : "Missing");
      console.log("UserID in Storage:", userId);

      if (!token || !userId) {
        Alert.alert("Session Error", "Please log in again.");
        return;
      }

      // Updated URL with "s"
      const url = `${API_BASE}/api/blotters/my-blotters/${userId}`;
      console.log("Fetching URL:", url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("Data Received:", data); // Check if count is 0 or > 0

      if (data.success) {
        setRequests(data.blotters);
      } else {
        Alert.alert("Error", "Could not fetch requests");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openDetailsModal = (item) => {
    console.log("Opening Item:", item); // Debug check
    setSelectedRequest(item);
    setShowDetailsModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDetailsModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDetailsModal(false);
      setSelectedRequest(null);
    });
  };

  // --- HELPER: MAP BACKEND COLOR TO TAILWIND ---
  const getStatusColor = (colorName) => {
    switch (colorName) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "orange":
        return "bg-orange-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const Divider = ({ color }: { color: string }) => (
    <View style={{ height: 1, backgroundColor: color, marginVertical: 2 }} />
  );

  // --- RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />
      <GradientHeader
        title="Track Your Activity"
        onBack={() => router.back()}
      />

      {/* --- MAIN LIST --- */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4f46e5"
            style={{ marginTop: 50 }}
          />
        ) : requests.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-gray-500 text-lg">No requests found.</Text>
            <TouchableOpacity
              onPress={fetchMyRequests}
              className="mt-4 bg-gray-200 px-4 py-2 rounded-lg"
            >
              <Text className="text-gray-700">Tap to Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          requests.map((item) => (
            <View
              key={item._id}
              className="border border-gray-200 rounded-2xl overflow-hidden mt-4 mb-4 shadow-sm bg-white"
            >
              <View className="p-5">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Police Blotter
                </Text>
                <Divider color={dividerColor} />

                {/* Vertical Step Indicator */}
                <View className="flex-1">
                  <View className="mb-2">
                    <Text className="text-gray-900 font-medium text-base">
                      Current Status
                    </Text>
                    <Text className="text-indigo-600 font-bold text-sm">
                      {item.status ? item.status.toUpperCase() : "PENDING"}
                    </Text>
                  </View>

                  <View className="mb-2">
                    <Text className="text-gray-900 font-medium text-base">
                      Incident Type
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {item.incident?.incident_type || "N/A"}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-gray-900 font-medium text-base">
                      Date
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {item.incident?.date
                        ? new Date(item.incident.date).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Reference Number + Button */}
                <View className="flex-row items-center justify-between mt-6">
                  <Text className="text-sm font-semibold text-gray-700">
                    Ref #:{" "}
                    <Text className="text-indigo-600">
                      {item.custom_id || item.blotterNumber || "N/A"}
                    </Text>
                  </Text>

                  <TouchableOpacity
                    onPress={() => openDetailsModal(item)}
                    activeOpacity={0.8}
                    className="bg-indigo-600 py-3 px-6 rounded-xl"
                  >
                    <Text className="text-white font-semibold text-base">
                      Check Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        <View className="h-8" />
      </ScrollView>

      {/* --- DETAILS MODAL (FIXED STRUCTURE) --- */}
      <Modal visible={showDetailsModal} transparent animationType="none">
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback onPress={closeDetailsModal}>
            <View className="absolute top-0 left-0 right-0 bottom-0" />
          </TouchableWithoutFeedback>

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              maxHeight: height * 0.85,
            }}
            className="bg-white rounded-t-3xl overflow-hidden"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
              <TouchableOpacity
                onPress={closeDetailsModal}
                className="w-10 h-10 items-center justify-center"
              >
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            {selectedRequest && (
              <ScrollView
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
              >
                <View className="px-6">
                  <Text className="text-2xl font-bold text-gray-900 mb-1">
                    Police Blotter
                  </Text>
                  <Text className="text-sm text-gray-500 mb-3">
                    Reference No:{" "}
                    <Text className="font-semibold text-gray-700">
                      {selectedRequest.custom_id ||
                        selectedRequest.blotterNumber ||
                        "N/A"}
                    </Text>
                  </Text>

                  <View className="h-[1px] bg-gray-300 mb-4" />

                  <Text className="font-bold text-gray-900 mb-1">
                    Incident Type:{" "}
                    <Text className="font-normal">
                      {selectedRequest.incident?.incident_type || "N/A"}
                    </Text>
                  </Text>

                  <Text className="font-bold text-gray-900 mb-1">
                    Date & Time:{" "}
                    <Text className="font-normal">
                      {selectedRequest.incident?.date
                        ? new Date(
                            selectedRequest.incident.date
                          ).toLocaleDateString()
                        : ""}{" "}
                      {selectedRequest.incident?.time || ""}
                    </Text>
                  </Text>

                  {/* Handling Description correctly */}
                  <Text className="font-bold text-gray-900 mb-1">
                    Description:{" "}
                    <Text className="font-normal">
                      "
                      {selectedRequest.incident?.description ||
                        "No description provided"}
                      "
                    </Text>
                  </Text>

                  {/* Handling Officer population safely */}
                  <Text className="font-bold text-gray-900 mb-1">
                    Assigned Officer:{" "}
                    <Text className="font-normal">
                      {selectedRequest.assigned_officer
                        ? `${selectedRequest.assigned_officer.first_name || ""} ${selectedRequest.assigned_officer.last_name || ""}`
                        : "Unassigned"}
                    </Text>
                  </Text>

                  <Text className="font-bold text-gray-900 mb-6">
                    Status:{" "}
                    <Text className="font-normal">
                      {selectedRequest.status}
                    </Text>
                  </Text>

                  <View className="h-[1px] bg-gray-300 mb-4" />

                  {/* --- DYNAMIC STATUS TIMELINE --- */}
                  <Text className="text-xl font-bold text-gray-900 mb-3">
                    Status Timeline
                  </Text>
                  {/* Simplified Timeline View for now */}
                  <View className="mb-6">
                    <Text className="text-gray-500 italic">
                      Timeline view coming soon...
                    </Text>
                  </View>

                  <View className="h-[1px] bg-gray-300 mb-4" />

                  {/* --- Attachments --- */}
                  <Text className="text-xl font-bold text-gray-900 mb-3">
                    Attachments & Evidence
                  </Text>
                  <View className="mb-4">
                    <View className="w-full h-40 bg-gray-200 rounded-xl mb-2 items-center justify-center overflow-hidden">
                      {/* Check if attachments exist and is array, or check photoEvidence field if you used that */}
                      {selectedRequest.photoEvidence ||
                      (selectedRequest.attachments &&
                        selectedRequest.attachments.length > 0) ? (
                        <Image
                          source={{
                            uri:
                              selectedRequest.photoEvidence ||
                              selectedRequest.attachments[0]?.url,
                          }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-gray-500">
                          No Photo Available
                        </Text>
                      )}
                    </View>
                  </View>

                  <View className="h-[1px] bg-gray-300 mb-4" />

                  {/* --- Communication Options --- */}
                  <Text className="text-xl font-bold text-gray-900 mb-3">
                    Communication Options
                  </Text>
                  <View className="space-y-3 mb-10">
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Message", "Feature coming soon")
                      }
                    >
                      <Text className="text-blue-700 text-base">
                        • Message Officer
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Update", "Requesting update...")
                      }
                    >
                      <Text className="text-blue-700 text-base">
                        • Request Update
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
