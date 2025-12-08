import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronDown, Trash2 } from "lucide-react-native";
import GradientHeader from "./components/GradientHeader";
import BottomNav from "./components/bottomnav";

const API_BASE = "http://192.168.1.41:3000/api";

// Map payment methods to images
const paymentImages = {
  visa: require("../assets/images/visa.jpg"),
  mastercard: require("../assets/images/mastercard.jpg"),
  gcash: require("../assets/images/gcash.jpg"),
  paymaya: require("../assets/images/paymaya.jpg"),
  cod: require("../assets/images/cod.jpg"), // Cash on Delivery
};

export default function Payments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/payments?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch payments.");
        setLoading(false);
        return;
      }

      setPayments(data);
      setSelectedPayment(data.length > 0 ? data[0].payment_method : "");
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const handleDeletePayment = (paymentId) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE}/payments/${paymentId}`,
                { method: "DELETE" }
              );

              if (!response.ok) {
                Alert.alert("Error", "Failed to delete payment method");
                return;
              }

              Alert.alert("Success", "Payment method deleted successfully");
              fetchPayments();
            } catch (err) {
              Alert.alert("Error", "Network error. Please try again.");
            }
          },
        },
      ]
    );
  };

  const formatPaymentDisplay = (payment) => {
    const method = payment.payment_method.toUpperCase();
    const last4 = payment.card_last4 ? ` •••• ${payment.card_last4}` : "";
    return `${method}${last4}`;
  };

  const getPaymentImage = (method) => {
    return paymentImages[method.toLowerCase()] || paymentImages.cod;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
        <GradientHeader title="Payment" onBack={() => router.back()} />

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4338ca" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-red-500 text-center mb-4">{error}</Text>
            <TouchableOpacity
              className="bg-indigo-600 px-6 py-3 rounded-xl"
              onPress={fetchPayments}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
          >
            {payments.length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-gray-600 text-lg font-medium mt-4 mb-2">
                  No Payment Methods
                </Text>
                <TouchableOpacity
                  className="bg-indigo-600 px-8 py-3 rounded-xl"
                  onPress={() => router.push("/addpayment")}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-semibold text-base">
                    Add Payment Method
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View className="mb-4 mt-2">
                  <Text className="text-gray-700 font-semibold text-sm mb-2 mt-2">
                    DEFAULT PAYMENT
                  </Text>
                  <TouchableOpacity
                    className="border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
                    style={{ backgroundColor: "#F9FAFB" }}
                    onPress={() => setShowDropdown(true)}
                  >
                    <View className="flex-row items-center">
                      <Image
                        source={getPaymentImage(selectedPayment)}
                        style={{ width: 32, height: 32, resizeMode: "contain" }}
                      />
                      <Text className="text-gray-900 ml-3 font-medium">
                        {selectedPayment
                          ? formatPaymentDisplay(
                              payments.find(
                                (p) => p.payment_method === selectedPayment
                              )
                            )
                          : "Select default payment"}
                      </Text>
                    </View>
                    <ChevronDown size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E5E7EB",
                    marginVertical: 10,
                  }}
                />

                <View className="mb-6">
                  <Text className="text-gray-700 font-semibold text-sm mb-3">
                    ALL PAYMENT METHODS
                  </Text>

                  {payments.map((payment) => (
                    <View
                      key={payment._id}
                      className="border border-gray-200 rounded-xl p-4 mb-3 flex-row justify-between items-center"
                      style={{ backgroundColor: "#F9FAFB" }}
                    >
                      <View className="flex-row items-center flex-1">
                        <Image
                          source={getPaymentImage(payment.payment_method)}
                          style={{
                            width: 32,
                            height: 32,
                            resizeMode: "contain",
                          }}
                        />
                        <View className="ml-3 flex-1">
                          <Text className="text-gray-900 text-base font-medium">
                            {formatPaymentDisplay(payment)}
                          </Text>
                          {payment.payment_method === selectedPayment && (
                            <Text className="text-indigo-600 text-xs mt-1">
                              Default
                            </Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeletePayment(payment._id)}
                        className="p-2"
                      >
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  className="bg-indigo-600 mt-4 mb-10 px-8 py-4 rounded-xl"
                  onPress={() => router.push("/addpayment")}
                  activeOpacity={0.8}
                  style={{
                    shadowColor: "#4338ca",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <Text className="text-white font-bold text-base text-center">
                    + Add Payment Method
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}

        <BottomNav activeRoute="/(tabs)/profile" />

        <Modal visible={showDropdown} transparent animationType="fade">
          <Pressable
            className="flex-1 bg-black/50 justify-center items-center"
            onPress={() => setShowDropdown(false)}
          >
            <View className="bg-white rounded-2xl w-4/5 max-h-96 overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-gray-900 font-semibold text-base">
                  Select Default Payment
                </Text>
              </View>
              <ScrollView>
                {payments.map((payment) => (
                  <TouchableOpacity
                    key={payment._id}
                    className="p-4 border-b border-gray-100 active:bg-gray-50 flex-row items-center"
                    onPress={() => {
                      setSelectedPayment(payment.payment_method);
                      setShowDropdown(false);
                    }}
                  >
                    <Image
                      source={getPaymentImage(payment.payment_method)}
                      style={{ width: 32, height: 32, resizeMode: "contain" }}
                    />
                    <Text className="text-gray-900 text-base ml-3">
                      {formatPaymentDisplay(payment)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
