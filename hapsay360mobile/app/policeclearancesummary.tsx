import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";
import BottomNav from "./components/bottomnav";

interface Appointment {
  _id: string;
  purpose: string;
  policeStation: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  paymentStatus: string;
  amount: number;
}

export default function PoliceClearanceSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const appointmentId = params.appointmentId as string;
  const paymentMethod = params.paymentMethod as string;
  const appointmentDataParam = params.appointmentData as string;

  const API_BASE = "http://192.168.1.6:3000/api";

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);

  const paymentMethodNames: Record<string, string> = {
    cod: "Cash on Delivery",
    gcash: "Gcash",
    mastercard: "Mastercard",
    visa: "Visa",
    paymaya: "Paymaya",
  };

  const paymentMethodIcons: Record<string, any> = {
    cod: require("../assets/images/cod.jpg"),
    gcash: require("../assets/images/gcash.jpg"),
    mastercard: require("../assets/images/mastercard.jpg"),
    visa: require("../assets/images/visa.jpg"),
    paymaya: require("../assets/images/paymaya.jpg"),
  };

  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchAppointment = async () => {
    if (!appointmentId) {
      Alert.alert("Error", "No appointment selected");
      router.back();
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();

      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch appointment");
      }

      const data = await res.json();
      setAppointment(data.appointment);
    } catch (err: any) {
      console.error("Fetch appointment error:", err);
      Alert.alert("Error", "Failed to load appointment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointmentDataParam) {
      try {
        const parsedData = JSON.parse(appointmentDataParam);
        setAppointment(parsedData);
      } catch (err) {
        console.error("Failed to parse appointmentDataParam", err);
        fetchAppointment();
      }
    } else {
      fetchAppointment();
    }
  }, []);

  const handleSaveAppointment = async () => {
    if (!appointment) {
      Alert.alert("Error", "Appointment not loaded correctly");
      return;
    }

    try {
      setSaving(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/clearance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          purpose: appointment.purpose,
          policeStation: appointment.stationId, // use ID from Booking page
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create clearance");
      }

      // Navigate to confirmation page
      router.push({
        pathname: "/policeclearanceconfirmation",
        params: {
          policeStation: appointment.policeStation,
          amount: appointment.amount.toString(),
        },
      });
    } catch (err: any) {
      console.error("Create clearance error:", err);
      Alert.alert("Error", `Failed to save clearance: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      weekday: "long",
    });
  };

  const getCardLastDigits = (method: string) => {
    const cardDigits: Record<string, string> = {
      mastercard: "413",
      visa: "789",
      gcash: "N/A",
      paymaya: "N/A",
      cod: "N/A",
    };
    return cardDigits[method] || "000";
  };

  if (loading || !appointment) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
        <GradientHeader title="Book Appointment" onBack={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />

      <GradientHeader title="Book Appointment" onBack={() => router.back()} />

      {/* Stepper */}
      <View className="bg-white px-6 py-5">
        <View className="flex-row items-center justify-between">
          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mb-2">
              <Text className="text-white font-bold">1</Text>
            </View>
            <Text className="text-xs text-gray-500">Book date</Text>
          </View>

          <View
            className="flex-1 h-px bg-gray-300 mx-2"
            style={{ marginTop: -20 }}
          />

          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mb-2">
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-xs text-gray-500">Payment</Text>
          </View>

          <View
            className="flex-1 h-px bg-indigo-600 mx-2"
            style={{ marginTop: -20 }}
          />

          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center mb-2">
              <Text className="text-white font-bold">3</Text>
            </View>
            <Text className="text-xs text-gray-900 font-semibold">Save</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="border border-gray-200 rounded-2xl overflow-hidden mt-2 mb-8 shadow-sm">
          {/* Appointment Details */}
          <View className="p-5 bg-white">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Appointment Details
            </Text>
            <Text className="text-gray-900 font-medium text-base mb-1">
              {formatDate(appointment.appointmentDate)}
            </Text>
            <Text className="text-gray-900 font-medium text-base mb-2">
              {appointment.timeSlot}
            </Text>
            <Text className="text-gray-600 text-sm mb-2">
              {appointment.policeStation}
            </Text>
            <Text className="text-gray-600 text-sm">
              Purpose: {appointment.purpose}
            </Text>
          </View>

          <View className="h-px bg-gray-200" />

          {/* Payment Details */}
          <View className="p-5 bg-white">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Payment Details
            </Text>
            <View className="flex-row items-center mb-3">
              {paymentMethodIcons[paymentMethod] && (
                <Image
                  source={paymentMethodIcons[paymentMethod]}
                  style={{
                    width: 32,
                    height: 20,
                    marginRight: 8,
                    borderRadius: 4,
                  }}
                />
              )}
              <Text className="text-gray-900 font-medium">
                {paymentMethodNames[paymentMethod] || "Unknown"}
              </Text>
            </View>

            {paymentMethod !== "cod" &&
              paymentMethod !== "gcash" &&
              paymentMethod !== "paymaya" && (
                <View className="mb-2">
                  <Text className="text-gray-600 text-sm mb-1">
                    Card number
                  </Text>
                  <Text className="text-gray-900 font-medium text-base">
                    XXX XXX XXX {getCardLastDigits(paymentMethod)}
                  </Text>
                </View>
              )}

            {/* Change card details button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowConfirmation(true)}
            >
              <Text className="text-indigo-600 text-sm font-medium">
                Change payment method
              </Text>
            </TouchableOpacity>
          </View>

          <View className="h-px bg-gray-200" />

          {/* Total Section */}
          <View className="p-5 bg-white">
            <Text className="text-gray-900 font-bold text-xl">
              ₱{appointment.amount.toFixed(2)}
            </Text>
            <Text className="text-gray-600 text-sm">Police Clearance Fee</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-indigo-600 rounded-xl py-4 items-center mb-8"
          activeOpacity={0.8}
          onPress={handleSaveAppointment}
          disabled={saving}
        >
          <Text className="text-white font-semibold text-base">
            {saving ? "Processing..." : "Save Appointment"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav activeRoute="/(tabs)/clearance" />

      {/* Change Payment Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 items-center">
            <Text className="text-lg font-semibold mb-3">
              Change Payment Method
            </Text>
            <Text className="text-gray-700 text-center mb-6">
              You can select a different payment method on the previous screen.
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-8 py-3 rounded-xl"
              onPress={() => {
                setShowConfirmation(false);
                router.back();
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
