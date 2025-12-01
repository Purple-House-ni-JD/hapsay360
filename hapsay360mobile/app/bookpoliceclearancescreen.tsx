import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./components/bottomnav";
import GradientHeader from "./components/GradientHeader";

export default function BookPoliceClearanceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1a1f4d" : "#ffffff";

  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");

  // Format address
  const formatAddress = (addr: any) => {
    if (!addr) return "";
    return [addr.houseNo, addr.barangay, addr.city, addr.province]
      .filter(Boolean)
      .join(", ");
  };

  // Format ISO date to YYYY-MM-DD in local timezone
  const formatLocalDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "Please login again");
          router.push("/login");
          return;
        }

        const res = await fetch(
          "http://192.168.1.6:3000/api/application/my-application",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();

        if (data.profile) {
          setProfile(data.profile);

          // Set state values
          setEmail(data.profile.address?.email || "");
          setBirthday(formatLocalDate(data.profile.personal_info?.birthdate));
          setSex(data.profile.personal_info?.sex || "");
          setAddress(formatAddress(data.profile.address));
        }
      } catch (err: any) {
        console.error(err);
        Alert.alert("Error", "Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  // Navigate to ApplicationForm with profile data
  const handleEditProfile = () => {
    if (!profile) {
      Alert.alert("Error", "Profile not loaded yet");
      return;
    }

    router.push({
      pathname: "/applicationform",
      params: {
        profile: JSON.stringify(profile),
      },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: bgColor }}
      edges={["left", "right"]}
    >
      <GradientHeader title="Book Appointment" onBack={() => router.back()} />

      <ScrollView className="flex-1 bg-white">
        {/* Profile Section */}
        <View className="items-center pt-10 pb-4">
          <View className="w-36 h-36 rounded-full overflow-hidden mb-3">
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
              }}
              className="w-full h-full"
            />
          </View>
          <Text className="text-gray-900 text-xl font-semibold">
            {profile?.personal_info?.givenName}{" "}
            {profile?.personal_info?.surname}
          </Text>
        </View>

        {/* Editable Info Fields */}
        <View className="px-6 py-4 rounded-2xl mt-2">
          {/* Email */}
          <View className="flex-row items-center mb-3">
            <Text className="w-28 text-gray-700 text-sm font-medium text-left">
              Email:
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              editable={false}
              placeholder="Email"
              keyboardType="email-address"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900"
              style={{ backgroundColor: "#DEEBF8" }}
            />
          </View>

          {/* Birthday */}
          <View className="flex-row items-center mb-3">
            <Text className="w-28 text-gray-700 text-sm font-medium text-left">
              Birthday:
            </Text>
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              editable={false}
              placeholder="MM/DD/YYYY"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900"
              style={{ backgroundColor: "#DEEBF8" }}
            />
          </View>

          {/* Sex */}
          <View className="flex-row items-center mb-3">
            <Text className="w-28 text-gray-700 text-sm font-medium text-left">
              Sex:
            </Text>
            <TextInput
              value={sex}
              onChangeText={setSex}
              editable={false}
              placeholder="Sex"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900"
              style={{ backgroundColor: "#DEEBF8" }}
            />
          </View>

          {/* Address */}
          <View className="flex-row items-start">
            <Text className="w-28 text-gray-700 text-sm font-medium text-left mt-2">
              Address:
            </Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              editable={false}
              placeholder="Address"
              multiline
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-base text-gray-900"
              style={{ backgroundColor: "#DEEBF8" }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 mb-8 px-6">
          <TouchableOpacity
            onPress={handleEditProfile}
            style={{ backgroundColor: "#3234AB", marginBottom: 16 }}
            className="rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Edit profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/bookpoliceclearance")}
            style={{ backgroundColor: "#3234AB", marginBottom: 16 }}
            className="rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Clearance application
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/myappointments")}
            style={{ backgroundColor: "#3234AB" }}
            className="rounded-lg py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Transactions
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav activeRoute="/(tabs)/clearance" />
    </SafeAreaView>
  );
}
