import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import this
import { Ionicons } from "@expo/vector-icons";
import GradientHeader from "./components/GradientHeader";

const API_BASE = "http://192.168.1.6:3000";

// --- Helper Functions (Distance) ---
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export default function SOSEmergencyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [location, setLocation] = useState(null);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosSent, setSosSent] = useState(false); // Track if SOS was saved

  // Animation Refs
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const opacity1 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(1)).current;
  const opacity3 = useRef(new Animated.Value(1)).current;

  // --- FUNCTION TO SEND SOS TO BACKEND ---
  const sendSOSAlert = async (userLoc, nearestStation) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("No user ID found");
        return;
      }

      const response = await fetch(`${API_BASE}/api/sos/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          nearest_station_id: nearestStation._id,
          latitude: userLoc.latitude,
          longitude: userLoc.longitude,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("SOS Saved to Database:", data.data);
        setSosSent(true);
        Alert.alert("SOS Sent", "Help has been requested successfully.");
      }
    } catch (error) {
      console.error("Failed to send SOS:", error);
    }
  };

  // --- Main Logic ---
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied");
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);

        // Fetch Stations
        const response = await fetch(`${API_BASE}/api/police-stations`);
        const data = await response.json();

        if (data.success) {
          const stationsWithDistance = data.data.map((station) => {
            const stLat = parseFloat(station.location.latitude);
            const stLon = parseFloat(station.location.longitude);
            const distance = getDistanceFromLatLonInKm(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude,
              stLat,
              stLon
            );
            return { ...station, distance };
          });

          // Sort to find nearest
          const sorted = stationsWithDistance
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 4);

          setNearbyStations(sorted);

          // --- TRIGGER SOS SAVE IF NOT SENT YET ---
          if (sorted.length > 0 && !sosSent) {
            // sorted[0] is the nearest station
            await sendSOSAlert(currentLocation.coords, sorted[0]);
          }
        }
      } catch (error) {
        console.error("Error initializing SOS:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Run once on mount

  // --- Animation Logic ---
  useEffect(() => {
    const createAnimation = (animValue, opacityValue) => {
      return Animated.loop(
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };
    const anim1 = createAnimation(pulse1, opacity1);
    const anim2 = createAnimation(pulse2, opacity2);
    const anim3 = createAnimation(pulse3, opacity3);

    anim1.start();
    setTimeout(() => anim2.start(), 400);
    setTimeout(() => anim3.start(), 800);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const scale1 = pulse1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });
  const scale2 = pulse2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });
  const scale3 = pulse3.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  // --- Bubble Render ---
  const renderStationBubble = (station, index, total) => {
    const radius = 150;
    const angleOffset = -Math.PI / 2;
    const angle = angleOffset + (index * (2 * Math.PI)) / total;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    return (
      <View
        key={station._id || index}
        className="absolute items-center justify-center bg-white shadow-sm"
        style={{
          transform: [{ translateX: x }, { translateY: y }],
          width: 90,
          height: 90,
          borderRadius: 45,
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
          zIndex: 10,
        }}
      >
        <View className="bg-blue-100 p-2 rounded-full mb-1">
          <Ionicons name="shield-checkmark" size={18} color="#1E3A8A" />
        </View>
        <Text
          className="text-[10px] font-bold text-gray-800 text-center px-2"
          numberOfLines={1}
        >
          {station.name}
        </Text>
        <Text className="text-[10px] text-blue-600 font-semibold">
          {station.distance.toFixed(2)} km
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["left", "right"]}
      style={{ backgroundColor: isDark ? "#1a1f4d" : "#ffffff" }}
    >
      <GradientHeader title="SOS" onBack={() => router.back()} />

      <View className="mt-6 mb-10 px-6 flex-none">
        <Text
          className="text-4xl font-extrabold text-center mb-4 tracking-tight"
          style={{ color: isDark ? "#ffffff" : "#111827" }}
        >
          {sosSent
            ? "Help Requested!"
            : loading
              ? "Locating..."
              : "Calling Help..."}
        </Text>
        <Text
          className="text-base text-center leading-6 font-medium"
          style={{ color: isDark ? "#d1d5db" : "#4b5563" }}
        >
          Please stand by, we are currently requesting for help. Nearby rescue
          services would see your call for help.
        </Text>
        <Text
          className="text-xs text-center mt-2 opacity-60"
          style={{ color: isDark ? "#d1d5db" : "#6B7280" }}
        >
          {location
            ? `GPS: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
            : ""}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: -40,
        }}
      >
        <View
          className="items-center justify-center relative"
          style={{ height: 320, width: 320 }}
        >
          {/* Pulses */}
          <Animated.View
            className="rounded-full border-2 border-dashed border-blue-400"
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              transform: [{ scale: scale3 }],
              opacity: opacity3,
            }}
          />
          <Animated.View
            className="rounded-full border-2 border-dashed border-blue-400"
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              transform: [{ scale: scale2 }],
              opacity: opacity2,
            }}
          />
          <Animated.View
            className="rounded-full border-2 border-dashed border-blue-400"
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              transform: [{ scale: scale1 }],
              opacity: opacity1,
            }}
          />

          <View className="absolute w-44 h-44 rounded-full border-2 border-dashed border-blue-400" />
          <View className="absolute w-36 h-36 rounded-full border-2 border-dashed border-blue-400" />

          {/* Bubbles */}
          {!loading && nearbyStations.length > 0 && (
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              {nearbyStations.map((station, index) =>
                renderStationBubble(station, index, nearbyStations.length)
              )}
            </View>
          )}

          {/* Center Button */}
          <View
            style={{
              width: 144,
              height: 144,
              borderRadius: 72,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              elevation: 5,
              backgroundColor: "white",
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
                  <Stop offset="100%" stopColor="#013971" stopOpacity="1" />
                </RadialGradient>
              </Defs>
              <Circle cx="72" cy="72" r="72" fill="url(#grad)" />
            </Svg>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Text className="text-white text-2xl font-bold tracking-wider">
                SOS
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
