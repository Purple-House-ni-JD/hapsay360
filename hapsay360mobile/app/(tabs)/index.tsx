import {
  View,
  Text,
  TextInput,
  ScrollView,
  StatusBar,
  useColorScheme,
  Animated,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// UPDATE THIS TO YOUR IP
const API_BASE = "http://192.168.0.104:3000";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // --- DYNAMIC DATA STATE (Make sure these are here!) ---
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH NEWS FROM API ---
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        const response = await fetch(`${API_BASE}/api/announcements`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setNews(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Animation for SOS button
  const animation = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const handlePressIn = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Progress circle animation
  const strokeDashoffset = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [440, 0],
  });

  const rippleScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const rippleOpacity = animation.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <SafeAreaView
      className="flex-1"
      edges={["left", "right"]}
      style={{ backgroundColor: isDark ? "#1a1f4d" : "#ffffff" }}
    >
      {/* Header with gradient background */}
      <View className="relative">
        <LinearGradient
          colors={["#3b3b8a", "#141545"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            height: 220,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <StatusBar barStyle="light-content" />
          <View className="items-center">
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
            />
            <Text className="text-white text-2xl font-bold mt-2 tracking-widest">
              HAPSAY360
            </Text>
          </View>
        </LinearGradient>

        {/* Floating Search Bar */}
        <View
          className="absolute left-0 right-0 px-6 z-20"
          style={{
            bottom: -25,
          }}
        >
          <View className="bg-white rounded-xl flex-row items-center px-4 py-3.5 shadow-lg">
            <TextInput
              className="flex-1 text-gray-700 text-base"
              placeholder="Search"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ height: 30 }}
            />
            <Ionicons name="search-outline" size={22} color="#9ca3af" />
          </View>
        </View>
      </View>

      {/* Content Area */}
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: isDark ? "#1a1f4d" : "#ffffff" }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 60,
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
      >
        {/* Action Cards Grid */}
        <View className="flex-row justify-between mb-4">
          <Pressable
            className="rounded-2xl w-[48%] p-6 items-center"
            style={{ backgroundColor: isDark ? "#2a3166" : "#DEEBF8" }}
            onPress={() => router.push("/appointments")}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: isDark ? "#3a4180" : "#ffffff" }}
            >
              <Ionicons
                name="calendar-outline"
                size={32}
                color={isDark ? "#ffffff" : "#1a1f4d"}
              />
            </View>
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: isDark ? "#ffffff" : "#1f2937" }}
            >
              Book appointment
            </Text>
          </Pressable>

          <Pressable
            className="rounded-2xl w-[48%] p-6 items-center"
            style={{ backgroundColor: isDark ? "#2a3166" : "#DEEBF8" }}
            onPress={() => router.push("/trackrequests")}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: isDark ? "#3a4180" : "#ffffff" }}
            >
              <Ionicons
                name="trending-up-outline"
                size={32}
                color={isDark ? "#ffffff" : "#1a1f4d"}
              />
            </View>
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: isDark ? "#ffffff" : "#1f2937" }}
            >
              Track Activity
            </Text>
          </Pressable>
        </View>

        <View className="flex-row justify-between mb-6">
          <Pressable
            className="rounded-2xl w-[48%] p-6 items-center"
            style={{ backgroundColor: isDark ? "#2a3166" : "#DEEBF8" }}
            onPress={() => router.push("/reporterinfo")}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: isDark ? "#3a4180" : "#ffffff" }}
            >
              <Ionicons
                name="file-tray-full-outline"
                size={32}
                color={isDark ? "#ffffff" : "#1a1f4d"}
              />
            </View>
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: isDark ? "#ffffff" : "#1f2937" }}
            >
              File Blotter
            </Text>
          </Pressable>

          <Pressable
            className="rounded-2xl w-[48%] p-6 items-center"
            style={{ backgroundColor: isDark ? "#2a3166" : "#DEEBF8" }}
            onPress={() => router.push("/nearesthelp")}
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: isDark ? "#3a4180" : "#ffffff" }}
            >
              <Ionicons
                name="navigate-outline"
                size={32}
                color={isDark ? "#ffffff" : "#1a1f4d"}
              />
            </View>
            <Text
              className="text-sm font-semibold text-center"
              style={{ color: isDark ? "#ffffff" : "#1f2937" }}
            >
              Nearest help
            </Text>
          </Pressable>
        </View>

        {/* Emergency Section */}
        <View className="items-center mt-10">
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: isDark ? "#ffffff" : "#000000",
              marginBottom: 20,
            }}
          />

          <Text
            className="text-xl font-bold mb-3"
            style={{ color: isDark ? "#ffffff" : "#111827" }}
          >
            Are you in an emergency?
          </Text>
          <Text
            className="text-sm text-center mb-8"
            style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
          >
            Press the SOS button, your live location will be{"\n"}
            shared with the nearest help centre and{"\n"}
            your emergency contacts.
          </Text>

          {/* Main SOS Box */}
          <View
            className="rounded-3xl p-6 mb-10 items-center"
            style={{
              backgroundColor: "#DEEBF8",
              paddingVertical: 40,
              width: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <View
              style={{
                width: 160,
                height: 160,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: "#ef4444",
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                }}
              />

              <Svg
                width={160}
                height={160}
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <Circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="none"
                />
                <AnimatedCircle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#22c55e"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin="80, 80"
                />
              </Svg>

              <Pressable
                onPressIn={() => {
                  handlePressIn();
                  timeoutRef.current = setTimeout(() => {
                    router.push("../sos");
                  }, 3000);
                }}
                onPressOut={() => {
                  handlePressOut();
                  clearTimeout(timeoutRef.current);
                }}
              >
                <View
                  style={{
                    width: 144,
                    height: 144,
                    borderRadius: 72,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Svg
                    width={144}
                    height={144}
                    style={{ position: "absolute", top: 0, left: 0 }}
                  >
                    <Defs>
                      <RadialGradient
                        id="grad"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                      >
                        <Stop offset="0%" stopColor="#3AB4E6" stopOpacity="1" />
                        <Stop
                          offset="100%"
                          stopColor="#013971"
                          stopOpacity="1"
                        />
                      </RadialGradient>
                    </Defs>
                    <Circle cx="72" cy="72" r="72" fill="url(#grad)" />
                  </Svg>
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text className="text-white text-2xl font-bold">SOS</Text>
                    <Text className="text-white text-[12px]">
                      Press for 3 seconds
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ======================================================= */}
        {/* DYNAMIC ANNOUNCEMENTS & NEWS                            */}
        {/* ======================================================= */}
        <View className="px-1 pb-10">
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: isDark ? "#ffffff" : "#000000",
              opacity: 0.2,
              marginBottom: 20,
            }}
          />

          <Text
            className="text-lg font-bold text-center mb-5"
            style={{ color: isDark ? "#ffffff" : "#000000" }}
          >
            Announcements & News
          </Text>

          <View className="gap-y-4">
            {loading ? (
              <ActivityIndicator size="small" color="#3b3b8a" />
            ) : news.length === 0 ? (
              <Text className="text-center text-gray-500 italic">
                No recent announcements.
              </Text>
            ) : (
              news.map((item, index) => {
                // Construct Image URL
                let imageUrl = "https://picsum.photos/200/300?grayscale";
                if (item.attachments && item.attachments.length > 0) {
                  imageUrl = `${API_BASE}${item.attachments[0].url}`;
                }

                return (
                  <View
                    key={item._id || index}
                    className="flex-row rounded-3xl p-3 items-center border"
                    style={{
                      backgroundColor: isDark ? "#2a3166" : "#ffffff",
                      borderColor: isDark ? "#3a4180" : "#1f2937",
                    }}
                  >
                    {/* News Image */}
                    <View className="w-28 h-20 bg-gray-400 rounded-2xl overflow-hidden mr-4">
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1 pr-2">
                      <Text
                        className="font-bold text-base mb-1"
                        style={{ color: isDark ? "#ffffff" : "#000000" }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="text-xs leading-4"
                        style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
                        numberOfLines={2}
                      >
                        {item.details}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
