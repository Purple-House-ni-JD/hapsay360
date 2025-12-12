import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
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

interface PaymentMethod {
  _id: string;
  user_id: string;
  payment_method: string;
  card_last4?: string;
  provider?: string;
}

export default function PoliceClearancePayment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const appointmentId = params.appointmentId as string;
  const appointmentDataParam = params.appointmentData as string;

  const API_BASE = "https://hapsay360backend-1kyj.onrender.com/api";

  const [selectedPayment, setSelectedPayment] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Map payment method IDs to display info
  const paymentDisplayInfo: Record<string, { name: string; icon: any }> = {
    "cash on delivery": {
      name: "Cash on Delivery",
      icon: require("../assets/images/cod.jpg"),
    },
    gcash: { name: "Gcash", icon: require("../assets/images/gcash.jpg") },
    mastercard: {
      name: "Mastercard",
      icon: require("../assets/images/mastercard.jpg"),
    },
    visa: { name: "Visa", icon: require("../assets/images/visa.jpg") },
    paymaya: {
      name: "Paymaya",
      icon: require("../assets/images/paymaya.jpg"),
    },
  };

  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPayments(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/");
        return;
      }

      // Example: get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found, please login again");
        router.push("/");
        return;
      }

      const res = await fetch(`${API_BASE}/payments?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // optional if your API uses auth
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          router.push("/");
          return;
        }
        throw new Error(`Failed to fetch payment methods: ${res.status}`);
      }

      const data: PaymentMethod[] = await res.json();
      setPaymentMethods(data);

      if (data.length > 0) {
        setSelectedPayment(data[0]._id);
      }
    } catch (err: any) {
      console.error("Fetch payment methods error:", err);
      Alert.alert(
        "Error",
        "Failed to load payment methods. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchAppointment = async () => {
    if (!appointmentId) {
      Alert.alert("Error", "No appointment selected", [
        { text: "OK", onPress: () => router.back() },
      ]);
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
        if (res.status === 404) throw new Error("Appointment not found");
        if (res.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          router.push("/");
          return;
        }
        const errText = await res.text();
        throw new Error(`Server error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      setAppointment(data.appointment);
    } catch (err: any) {
      console.error("Fetch appointment error:", err);
      Alert.alert("Error", `Failed to load appointment: ${err.message}`, [
        { text: "Go Back", onPress: () => router.back() },
        { text: "Retry", onPress: () => fetchAppointment() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch payment methods
    fetchPaymentMethods();

    // Fetch appointment data
    if (appointmentDataParam) {
      try {
        const parsedData = JSON.parse(appointmentDataParam);
        setAppointment(parsedData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to parse appointment data:", err);
        fetchAppointment();
      }
    } else {
      fetchAppointment();
    }
  }, []);

  const handleNext = () => {
    if (!appointment) {
      Alert.alert("Error", "Appointment data not loaded");
      return;
    }
    if (!selectedPayment) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    const selectedMethod = paymentMethods.find(
      (m) => m._id === selectedPayment
    );
    router.push({
      pathname: "/policeclearancesummary",
      params: {
        appointmentId,
        paymentMethodId: selectedPayment,
        paymentMethod: selectedMethod?.payment_method || "",
        appointmentData: JSON.stringify(appointment),
      },
    });
  };

  const getPaymentMethodDisplayName = (method: PaymentMethod) => {
    const displayInfo = paymentDisplayInfo[method.payment_method];
    let name = displayInfo?.name || method.payment_method;

    // Add card last 4 digits if available
    if (method.card_last4) {
      name += ` •••• ${method.card_last4}`;
    }

    return name;
  };

  if (loading || !appointment || loadingPayments) {
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
            className="flex-1 h-px mx-2"
            style={{ marginTop: -20, backgroundColor: "#4F46E5" }}
          />

          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center mb-2">
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-xs text-gray-900 font-semibold">Payment</Text>
          </View>

          <View
            className="flex-1 h-px mx-2"
            style={{ marginTop: -20, backgroundColor: "#D1D5DB" }}
          />

          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mb-2">
              <Text className="text-white font-bold">3</Text>
            </View>
            <Text className="text-xs text-gray-500">Save</Text>
          </View>
        </View>
      </View>

      {/* Payment Methods */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-700 font-medium text-sm mb-4">
          Select payment method
        </Text>

        {paymentMethods.length === 0 ? (
          <View className="items-center py-8">
            <Text className="text-gray-500 text-center mb-4">
              No payment methods available.{"\n"}Please add a payment method
              first.
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-6 py-3 rounded-xl"
              onPress={() => router.push("/addpayment")}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-3">
            {paymentMethods.map((method) => {
              const displayInfo = paymentDisplayInfo[method.payment_method];
              return (
                <TouchableOpacity
                  key={method._id}
                  onPress={() => setSelectedPayment(method._id)}
                  className="rounded-2xl p-4 flex-row items-center border"
                  style={{
                    backgroundColor:
                      selectedPayment === method._id ? "#E0E7FF" : "#F9FAFB",
                    borderColor:
                      selectedPayment === method._id ? "#4F46E5" : "#E5E7EB",
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-white shadow-sm">
                    {displayInfo?.icon && (
                      <Image
                        source={displayInfo.icon}
                        style={{ width: 32, height: 32, resizeMode: "contain" }}
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      {getPaymentMethodDisplayName(method)}
                    </Text>
                    {method.provider && (
                      <Text className="text-xs text-gray-500 mt-1">
                        {method.provider}
                      </Text>
                    )}
                  </View>
                  <View className="w-5 h-5 rounded-full border-2 border-gray-400 items-center justify-center">
                    {selectedPayment === method._id && (
                      <View className="w-3 h-3 rounded-full bg-indigo-600" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Appointment Summary Preview */}
        <View className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <Text className="text-gray-700 font-semibold mb-2">
            Appointment Summary
          </Text>
          <Text className="text-gray-600 text-sm mb-1">
            {appointment.purpose}
          </Text>
          <Text className="text-gray-600 text-sm mb-1">
            {appointment.policeStation}
          </Text>
          <Text className="text-gray-600 text-sm mb-2">
            {new Date(appointment.appointmentDate).toLocaleDateString()} •{" "}
            {appointment.timeSlot}
          </Text>
          <Text className="text-gray-900 font-bold text-lg">
            ₱{appointment.amount}
          </Text>
        </View>

        {/* Next Button */}
        {paymentMethods.length > 0 && (
          <TouchableOpacity
            className="bg-indigo-600 rounded-xl py-4 items-center mt-10 mb-8"
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Next</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNav activeRoute="/(tabs)/clearance" />

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 items-center">
            <View className="items-center pb-2 mb-10">
              <View className="w-40 h-2 bg-gray-200 rounded-full" />
            </View>
            <Text className="text-lg font-semibold mb-3">Confirmation</Text>
            <Text className="text-gray-700 text-center mb-6">
              Selected payment method:{" "}
              <Text className="font-semibold text-indigo-700">
                {paymentMethods.find((m) => m._id === selectedPayment)
                  ? getPaymentMethodDisplayName(
                      paymentMethods.find((m) => m._id === selectedPayment)!
                    )
                  : ""}
              </Text>
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-8 py-3 mb-10 rounded-xl"
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Confirm and proceed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
