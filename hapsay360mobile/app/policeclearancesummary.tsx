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
  stationId?: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  paymentStatus: string;
  amount: number;
}

interface PaymentMethod {
  _id: string;
  user_id: string;
  payment_method: string;
  card_last4?: string;
  provider?: string;
}

export default function PoliceClearanceSummary() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const appointmentId = params.appointmentId as string;
  const paymentMethodId = params.paymentMethodId as string;
  const appointmentDataParam = params.appointmentData as string;

  const API_BASE = "http://192.168.1.41:3000/api";

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [saving, setSaving] = useState(false);

  const paymentMethodIcons: Record<string, any> = {
    "cash on delivery": require("../assets/images/cod.jpg"),
    gcash: require("../assets/images/gcash.jpg"),
    mastercard: require("../assets/images/mastercard.jpg"),
    visa: require("../assets/images/visa.jpg"),
    paymaya: require("../assets/images/paymaya.jpg"),
  };

  const paymentMethodDisplayNames: Record<string, string> = {
    "cash on delivery": "Cash on Delivery",
    gcash: "Gcash",
    mastercard: "Mastercard",
    visa: "Visa",
    paymaya: "Paymaya",
  };

  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchPaymentMethod = async () => {
    if (!paymentMethodId) {
      setLoadingPayment(false);
      return;
    }

    try {
      setLoadingPayment(true);
      const token = await getAuthToken();

      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/");
        return;
      }

      const res = await fetch(`${API_BASE}/payments/${paymentMethodId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch payment method");
      }

      const data = await res.json();
      setPaymentMethod(data);
    } catch (err: any) {
      console.error("Fetch payment method error:", err);
      Alert.alert("Error", "Failed to load payment method details");
    } finally {
      setLoadingPayment(false);
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
        router.push("/");
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
    // Fetch payment method
    fetchPaymentMethod();

    // Fetch appointment data
    if (appointmentDataParam) {
      try {
        const parsedData = JSON.parse(appointmentDataParam);
        setAppointment(parsedData);
        setLoading(false);
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

    if (!paymentMethod) {
      Alert.alert("Error", "Payment method not selected");
      return;
    }

    try {
      setSaving(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/");
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
          policeStation: appointment.stationId,
          appointmentDate: appointment.appointmentDate,
          timeSlot: appointment.timeSlot,
          paymentMethodId: paymentMethod._id,
          amount: appointment.amount,
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
          clearanceId: data.data._id,
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

  const getPaymentMethodDisplayName = () => {
    if (!paymentMethod) return "Unknown";

    let name =
      paymentMethodDisplayNames[paymentMethod.payment_method] ||
      paymentMethod.payment_method;

    if (paymentMethod.card_last4) {
      name += ` •••• ${paymentMethod.card_last4}`;
    }

    return name;
  };

  const isCardPayment = () => {
    if (!paymentMethod) return false;
    return ["mastercard", "visa"].includes(paymentMethod.payment_method);
  };

  if (loading || loadingPayment || !appointment) {
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
            className="flex-1 h-px bg-indigo-600 mx-2"
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

            {paymentMethod ? (
              <>
                <View className="flex-row items-center mb-3">
                  {paymentMethodIcons[paymentMethod.payment_method] && (
                    <Image
                      source={paymentMethodIcons[paymentMethod.payment_method]}
                      style={{
                        width: 32,
                        height: 20,
                        marginRight: 8,
                        borderRadius: 4,
                      }}
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {getPaymentMethodDisplayName()}
                    </Text>
                    {paymentMethod.provider && (
                      <Text className="text-gray-500 text-xs mt-1">
                        {paymentMethod.provider}
                      </Text>
                    )}
                  </View>
                </View>

                {isCardPayment() && paymentMethod.card_last4 && (
                  <View className="mb-2">
                    <Text className="text-gray-600 text-sm mb-1">
                      Card number
                    </Text>
                    <Text className="text-gray-900 font-medium text-base">
                      •••• •••• •••• {paymentMethod.card_last4}
                    </Text>
                  </View>
                )}

                {/* Change payment method button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowConfirmation(true)}
                >
                  <Text className="text-indigo-600 text-sm font-medium">
                    Change payment method
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="py-4">
                <Text className="text-gray-500 text-center">
                  No payment method selected
                </Text>
                <TouchableOpacity
                  className="mt-3"
                  onPress={() => router.back()}
                  activeOpacity={0.7}
                >
                  <Text className="text-indigo-600 text-center font-medium">
                    Select Payment Method
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
          disabled={saving || !paymentMethod}
          style={{
            opacity: saving || !paymentMethod ? 0.5 : 1,
          }}
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
            <View className="items-center pb-2 mb-4">
              <View className="w-40 h-2 bg-gray-200 rounded-full" />
            </View>
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
