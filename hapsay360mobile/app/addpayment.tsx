import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreditCard, ChevronDown } from "lucide-react-native";
import GradientHeader from "./components/GradientHeader";

const API_BASE = "http://192.168.1.41:3000";

export default function AddPayment() {
  const router = useRouter();
  const { method } = useLocalSearchParams();

  const [isDefault, setIsDefault] = useState(false);
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardType, setCardType] = useState("");
  const [showCardTypeModal, setShowCardTypeModal] = useState(false);

  // Available card types from your schema
  const cardTypes = [
    { value: "visa", label: "Visa" },
    { value: "mastercard", label: "Mastercard" },
    { value: "gcash", label: "GCash" },
    { value: "paymaya", label: "PayMaya" },
  ];

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  // Format expiry date
  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    if (cleaned.length <= 16) {
      setCardNumber(cleaned);
    }
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiry(text);
    if (formatted.length <= 5) {
      setExpiry(formatted);
    }
  };

  const validateCard = () => {
    // Validate cardholder name
    if (!cardholder.trim()) {
      return "Please enter cardholder name";
    }

    // Validate card number
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      return "Please enter a valid card number (13-19 digits)";
    }

    // Card type is required
    if (!cardType) {
      return "Please select a card type";
    }

    // Validate expiry
    if (expiry.length !== 5) {
      return "Please enter expiry date in MM/YY format";
    }

    const [month, year] = expiry.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(month) < 1 || parseInt(month) > 12) {
      return "Invalid month in expiry date";
    }

    if (
      parseInt(year) < currentYear ||
      (parseInt(year) === currentYear && parseInt(month) < currentMonth)
    ) {
      return "Card has expired";
    }

    // Validate CVV
    if (cvv.length < 3 || cvv.length > 4) {
      return "Please enter a valid CVV";
    }

    return null;
  };

  const handleConfirm = async () => {
    setError("");

    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("User not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Prepare payment data according to schema
      const paymentData = {
        user_id: userId,
        payment_method: cardType, // Use manually selected card type
        card_last4: cardNumber.slice(-4),
        provider: cardType, // Same as payment_method
      };

      console.log("Sending payment data:", paymentData);

      const response = await fetch(`${API_BASE}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        setError(data.error || "Failed to save payment method.");
        setLoading(false);
        return;
      }

      Alert.alert("Success", "Payment method saved successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
        <GradientHeader title="Add Payment Card" onBack={() => router.back()} />

        <ScrollView className="flex-1 px-6 mt-6">
          {/* Card Preview */}
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: "#4338ca",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <View className="flex-row justify-between items-start mb-8">
              <CreditCard size={32} color="#fff" />
              <Text className="text-white text-xs font-medium uppercase">
                {cardType || "Card Type"}
              </Text>
            </View>

            <Text className="text-white text-xl tracking-widest mb-4 font-mono">
              {formatCardNumber(cardNumber) || "•••• •••• •••• ••••"}
            </Text>

            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-indigo-200 text-xs mb-1">
                  CARDHOLDER NAME
                </Text>
                <Text className="text-white text-sm font-medium uppercase">
                  {cardholder || "YOUR NAME"}
                </Text>
              </View>
              <View>
                <Text className="text-indigo-200 text-xs mb-1">EXPIRES</Text>
                <Text className="text-white text-sm font-medium">
                  {expiry || "MM/YY"}
                </Text>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <Text className="text-red-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          {/* Set as Default */}
          <View
            className="flex-row justify-between items-center mb-6 rounded-xl px-4 py-4"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            <Text className="text-gray-900 font-medium text-base">
              Set as Default Payment
            </Text>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              thumbColor={isDefault ? "#4338ca" : "#f4f3f4"}
              trackColor={{ false: "#d1d5db", true: "#a5b4fc" }}
            />
          </View>

          {/* Card Type Selector */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 text-sm">
              CARD TYPE
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-xl p-4 flex-row justify-between items-center"
              style={{ backgroundColor: "#F9FAFB" }}
              onPress={() => setShowCardTypeModal(true)}
            >
              <Text className={cardType ? "text-gray-900" : "text-gray-400"}>
                {cardType
                  ? cardTypes.find((t) => t.value === cardType)?.label
                  : "Select card type"}
              </Text>
              <ChevronDown size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Cardholder Name */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 text-sm">
              CARDHOLDER NAME
            </Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-base"
              style={{ backgroundColor: "#F9FAFB" }}
              placeholder="John Doe"
              value={cardholder}
              onChangeText={setCardholder}
              autoCapitalize="words"
            />
          </View>

          {/* Card Number */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2 text-sm">
              CARD NUMBER
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base"
                style={{ backgroundColor: "#F9FAFB" }}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                value={formatCardNumber(cardNumber)}
                onChangeText={handleCardNumberChange}
                maxLength={19}
              />
              <View className="absolute right-4 top-4">
                <TouchableOpacity onPress={() => setShowCardTypeModal(true)}>
                  <Text className="text-indigo-600 font-semibold text-xs uppercase">
                    {cardType || "Select"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Expiration Date & CVV Row */}
          <View className="flex-row mb-6" style={{ gap: 12 }}>
            {/* Expiration Date */}
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2 text-sm">
                EXPIRY DATE
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base"
                style={{ backgroundColor: "#F9FAFB" }}
                placeholder="MM/YY"
                keyboardType="numeric"
                value={expiry}
                onChangeText={handleExpiryChange}
                maxLength={5}
              />
            </View>

            {/* CVV */}
            <View className="flex-1">
              <Text className="text-gray-700 font-semibold mb-2 text-sm">
                CVV
              </Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base"
                style={{ backgroundColor: "#F9FAFB" }}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={(text) => {
                  if (text.length <= 4) setCvv(text);
                }}
                maxLength={4}
              />
            </View>
          </View>

          {/* Security Notice */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-blue-800 text-xs text-center">
              🔒 Your card information is encrypted and secure
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            className={`${loading ? "bg-gray-400" : "bg-indigo-600"} py-4 rounded-xl mb-10`}
            style={{
              shadowColor: "#4338ca",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">
                Add Card
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Card Type Modal */}
        <Modal visible={showCardTypeModal} transparent animationType="fade">
          <Pressable
            className="flex-1 bg-black/50 justify-center items-center"
            onPress={() => setShowCardTypeModal(false)}
          >
            <View className="bg-white rounded-2xl w-4/5 overflow-hidden">
              <View className="p-4 border-b border-gray-100">
                <Text className="text-gray-900 font-semibold text-base">
                  Select Card Type
                </Text>
              </View>
              <ScrollView className="max-h-80">
                {cardTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    className="p-4 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => {
                      setCardType(type.value);
                      setShowCardTypeModal(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        cardType === type.value
                          ? "text-indigo-600 font-semibold"
                          : "text-gray-900"
                      }`}
                    >
                      {type.label}
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
