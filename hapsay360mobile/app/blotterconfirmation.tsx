import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // <--- Import this
import GradientHeader from "./components/GradientHeader";

export default function BlotterConfirmation() {
  const router = useRouter();

  // 1. GET DATA FROM PARAMS
  const params = useLocalSearchParams();
  const blotterNumber = params.blotterNumber || "BLT-PENDING";
  const status = params.status || "Pending";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header */}
      <GradientHeader
        title="Blotter Confirmation"
        // Prevent going back to the form (optional, usually better to go home)
        onBack={() => router.replace("/(tabs)")}
      />

      {/* Main Content */}
      <View className="flex-1 bg-white rounded-t-3xl px-7 py-12">
        {/* Success Message */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-4">
            <Check size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Blotter Submitted Successfully!
          </Text>
          <Text className="text-gray-600 text-center">
            Your blotter has been recorded and will be reviewed by the
            authorities.
          </Text>
        </View>

        {/* Blotter Number Card */}
        <View className="bg-indigo-50 rounded-2xl p-6 mb-6 border-2 border-indigo-200">
          <Text className="text-gray-600 text-sm text-center mb-2">
            Your Blotter Number
          </Text>
          <Text className="text-3xl font-bold text-indigo-600 text-center mb-2">
            {blotterNumber}
          </Text>
          <Text className="text-gray-500 text-xs text-center">
            Save this number to track your blotter status
          </Text>
        </View>

        {/* Status Badge */}
        <View className="items-center mb-6">
          <View className="bg-yellow-100 border border-yellow-300 rounded-full px-6 py-2">
            <Text className="text-yellow-800 font-semibold">
              Status: {status}
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="space-y-4 mt-auto mb-10">
          <TouchableOpacity
            className="w-full bg-indigo-600 py-4 rounded-xl mb-4 items-center"
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)")} // Use replace to reset stack
          >
            <Text className="text-white font-semibold text-base">
              Back to Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-indigo-50 py-4 rounded-xl items-center border border-indigo-200"
            activeOpacity={0.8}
            // Navigate to the Track Requests tab we fixed earlier
            onPress={() => router.replace("/(tabs)/trackactivity")}
          >
            <Text className="text-indigo-700 font-semibold text-base">
              View Submitted Blotters
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
