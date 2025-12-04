import React from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import BottomNav from "./components/bottomnav";
import GradientHeader from "./components/GradientHeader";

const ChevronRight = () => (
  <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
);

const MenuItem = ({ icon, title, onPress, textColor = "#1E3A8A" }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-4 px-5 rounded-xl mb-3 mx-3"
    style={{
      backgroundColor: "#DEEBF8",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    }}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={20} color={textColor} />
      <Text
        className="text-base font-medium"
        style={{ color: textColor === "#DC2626" ? "#DC2626" : "#111827" }}
      >
        {title}
      </Text>
    </View>
    <ChevronRight />
  </TouchableOpacity>
);

export default function Settings() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Reusable Gradient Header */}
      <GradientHeader title="My Account" onBack={() => router.back()} />

      {/* Settings Content */}
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* General Section */}
        <View className="mt-4 mx-2 bg-white rounded-2xl overflow-hidden">
          <Text className="text-gray-900 font-semibold text-base px-5 py-3">
            General
          </Text>

          <MenuItem
            icon="swap-horizontal-outline"
            title="Switch Account"
            onPress={() => alert("Switch Account")}
          />
          <MenuItem
            icon="language-outline"
            title="Language"
            onPress={() => alert("Language Settings")}
          />
          <MenuItem
            icon="moon-outline"
            title="Dark Mode"
            onPress={() => alert("Dark Mode Settings")}
          />
        </View>

        {/* Others Section */}
        <View className="mt-6 mx-2 bg-white rounded-2xl overflow-hidden">
          <Text className="text-gray-900 font-semibold text-base px-5 py-3">
            Others
          </Text>

          <MenuItem
            icon="lock-closed-outline"
            title="Privacy Policy"
            onPress={() => alert("Privacy Policy")}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Customer Support"
            onPress={() => alert("Customer Support")}
          />
          <MenuItem
            icon="document-text-outline"
            title="Terms and Conditions"
            onPress={() => alert("Terms and Conditions")}
          />
        </View>

        {/* Danger Actions Section */}
        <View className="mt-6 mx-2 bg-white rounded-2xl overflow-hidden mb-6">
          <Text className="text-red-600 font-semibold text-base px-5 py-3">
            Danger Actions
          </Text>

          <MenuItem
            icon="trash-outline"
            title="Delete Account"
            textColor="#DC2626"
            onPress={() => alert("Delete Account")}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeRoute="/(tabs)/profile" />
    </SafeAreaView>
  );
}
