import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronDown, CreditCard, Trash2 } from "lucide-react-native";
import GradientHeader from "./components/GradientHeader";
import BottomNav from "./components/bottomnav";

const API_BASE = "http://192.168.0.104:3000";

export default function Payments() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch payments safely
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

      const response = await fetch(`${API_BASE}/api/payments`);
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setError("Server returned invalid response.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to fetch payments.");
        setLoading(false);
        return;
      }

      const userPayments = data.filter((p) => p.user_id._id === userId);
      setPayments(userPayments);

      if (userPayments.length > 0) {
        setSelectedPayment(userPayments[0].payment_method);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh when screen comes into focus
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
                `${API_BASE}/api/payments/${paymentId}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                Alert.alert("Error", "Failed to delete payment method");
                return;
              }

              Alert.alert("Success", "Payment method deleted successfully");
              fetchPayments(); // Refresh list
            } catch (err) {
              Alert.alert("Error", "Network error. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (method) => {
    return <CreditCard size={20} color="#4338ca" />;
  };

  const formatPaymentDisplay = (payment) => {
    const method = payment.payment_method.toUpperCase();
    const last4 = payment.card_last4 ? ` •••• ${payment.card_last4}` : "";
    return `${method}${last4}`;
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
              // Empty state
              <View className="flex-1 justify-center items-center py-20">
                <CreditCard size={64} color="#D1D5DB" strokeWidth={1.5} />
                <Text className="text-gray-600 text-lg font-medium mt-4 mb-2">
                  No Payment Methods
                </Text>
                <Text className="text-gray-400 text-sm text-center mb-6">
                  Add a payment method to get started
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
                {/* Default Payment */}
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
                      {getCardIcon(selectedPayment)}
                      <Text className="text-gray-900 ml-3 font-medium">
                        {selectedPayment
                          ? payments.find(
                              (p) => p.payment_method === selectedPayment
                            )
                            ? formatPaymentDisplay(
                                payments.find(
                                  (p) => p.payment_method === selectedPayment
                                )
                              )
                            : selectedPayment.toUpperCase()
                          : "Select default payment"}
                      </Text>
                    </View>
                    <ChevronDown size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Separator */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#E5E7EB",
                    marginBottom: 20,
                    marginTop: 10,
                  }}
                />

                {/* All Payment Methods */}
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
                        {getCardIcon(payment.payment_method)}
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

                {/* Add Payment Button */}
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

        {/* Bottom Navigation */}
        <BottomNav activeRoute="/(tabs)/profile" />

        {/* Default Payment Dropdown Modal */}
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
                    {getCardIcon(payment.payment_method)}
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
