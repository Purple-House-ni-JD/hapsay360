import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  useColorScheme,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";

// UPDATE THIS TO YOUR IP
const API_BASE = "http://192.168.1.6:3000";

export default function MyAppointments() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const dividerColor = isDark ? "#4b5563" : "#d1d5db";

  // --- STATE ---
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // --- FETCH APPOINTMENTS ---
  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/clearance/my-clearances`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Sort by newest first (created_at)
        const sorted = data.data.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAppointments(sorted);
      } else {
        console.error("Failed to load appointments:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Could not fetch appointments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  // --- HELPER FORMATTERS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date Pending";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      weekday: "long",
    });
  };

  const Divider = ({ color }: { color: string }) => (
    <View style={{ height: 1, backgroundColor: color, marginVertical: 2 }} />
  );

  // --- RENDER ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <GradientHeader title="My Appointments" onBack={() => router.back()} />

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        >
          {appointments.length === 0 ? (
            <View className="items-center mt-10">
              <Text className="text-gray-500 text-lg">
                No appointments found.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/appointments")} // Adjust route if needed
                className="mt-4 bg-indigo-600 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Book Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            appointments.map((item) => (
              <View
                key={item._id}
                className="border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm bg-white"
              >
                {/* Header Section */}
                <View className="p-5">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-bold text-gray-900">
                      {item.purpose || "Police Clearance"}
                    </Text>
                    {/* Status Badge */}
                    <View
                      className={`px-3 py-1 rounded-full ${
                        item.status === "completed" ||
                        item.status === "released"
                          ? "bg-green-100"
                          : item.status === "pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold capitalize ${
                          item.status === "completed" ||
                          item.status === "released"
                            ? "text-green-700"
                            : item.status === "pending"
                              ? "text-yellow-700"
                              : "text-red-700"
                        }`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Divider color={dividerColor} />

                  <Text className="text-gray-900 font-medium text-base mb-1 mt-3">
                    {formatDate(item.appointment_date)}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-4">
                    {item.station_id
                      ? `${item.station_id.name}, ${item.station_id.address}`
                      : "Station not assigned"}
                  </Text>

                  {/* Toggle Details Button */}
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedId(expandedId === item._id ? null : item._id)
                    }
                    activeOpacity={0.8}
                    className="bg-indigo-600 py-3 rounded-xl mt-2"
                  >
                    <Text className="text-white text-center font-semibold text-base">
                      {expandedId === item._id
                        ? "Hide Details"
                        : "Check Details"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Expandable Details Section */}
                {expandedId === item._id && (
                  <>
                    <View className="h-px bg-gray-200" />
                    <View className="p-5 bg-white">
                      <Text className="text-lg font-bold text-gray-900 mb-3">
                        Appointment Details
                      </Text>
                      <Text className="text-gray-900 font-medium text-base mb-1">
                        Date: {formatDate(item.appointment_date)}
                      </Text>
                      <Text className="text-gray-900 font-medium text-base mb-2">
                        Time: {item.time_slot || "TBD"}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        Station:{" "}
                        {item.station_id?.name || "No station selected"}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-2">
                        Reference ID: {item.custom_id}
                      </Text>
                    </View>

                    <View className="h-px bg-gray-200" />

                    <View className="p-5 bg-white">
                      <Text className="text-lg font-bold text-gray-900 mb-4">
                        Payment Details
                      </Text>
                      {item.payment ? (
                        <>
                          <View className="flex-row items-center mb-3">
                            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                            <Text className="text-gray-900 font-medium capitalize">
                              {item.payment.status || "Pending"}
                            </Text>
                          </View>
                          {item.payment.transaction_id && (
                            <View className="mb-2">
                              <Text className="text-gray-600 text-sm mb-1">
                                Transaction ID
                              </Text>
                              <Text className="text-gray-900 font-medium text-base">
                                {item.payment.transaction_id}
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <Text className="text-gray-500 italic">Mastercard</Text>
                      )}

                      {/* Only show change card if pending */}
                      {item.status === "pending" && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => setShowConfirmation(true)}
                          className="mt-2"
                        >
                          <Text className="text-indigo-600 text-sm font-medium">
                            Update Payment Method
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View className="h-px bg-gray-200" />

                    <View className="p-5 bg-white flex-row justify-between items-center">
                      <View>
                        <Text className="text-gray-900 font-bold text-xl">
                          ₱{item.price ? item.price.toFixed(2) : "250.00"}
                        </Text>
                        <Text className="text-gray-600 text-sm">Total Fee</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Change Card Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 items-center">
            <Text className="text-lg font-semibold mb-3">
              Payment Information
            </Text>
            <Text className="text-gray-700 text-center mb-6">
              You can settle your payment at the station or update your method
              here.
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-8 py-3 rounded-xl"
              onPress={() => {
                setShowConfirmation(false);
                // router.push("/payment"); // Navigate if you have a payment screen
              }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
