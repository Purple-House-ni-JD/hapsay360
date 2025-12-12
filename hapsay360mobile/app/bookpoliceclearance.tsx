import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./components/bottomnav";
import GradientHeader from "./components/GradientHeader";

const purposes = [
  "Employment",
  "Visa Application",
  "Loan Application",
  "Scholarship",
  "Travel Abroad",
  "Business Permit",
  "School Requirements",
  "Immigration",
  "Adoption",
  "Others",
];

const today = new Date();
const dates = Array.from({ length: 9 }, (_, i) => {
  const date = new Date();
  date.setDate(today.getDate() + i);
  return {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    label: date.toLocaleDateString("en-US", { weekday: "short" }),
    fullDate: date,
  };
});

const timeSlots = {
  morning: ["7:00", "9:00", "10:00", "11:00"],
  afternoon: ["1:00", "3:00", "4:00", "5:00"],
};

export default function BookingPoliceClearance() {
  const router = useRouter();
  const API_BASE = "https://hapsay360backend-1kyj.onrender.com/api";

  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [station, setStation] = useState("");
  const [stationId, setStationId] = useState("");
  const [policeStations, setPoliceStations] = useState<any[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState("1:00");
  const [timeSlot, setTimeSlot] = useState("P.M");
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");

  // Get auth token from AsyncStorage
  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  // Fetch police stations from backend
  const fetchPoliceStations = async () => {
    try {
      setLoadingStations(true);
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/police-stations/getStations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setPoliceStations(data.data);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch police stations");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Unable to load police stations");
    } finally {
      setLoadingStations(false);
    }
  };

  useEffect(() => {
    fetchPoliceStations();
  }, []);

  const handleProceed = () => {
    if (!purpose || !stationId) {
      Alert.alert(
        "Validation Error",
        "Please select purpose and police station"
      );
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const selectedDateObj = dates.find((d) => d.day === selectedDate);
      if (!selectedDateObj) {
        throw new Error("Invalid date selected");
      }

      const appointmentData = {
        purpose,
        stationId,
        station,
        appointmentDate: selectedDateObj.fullDate.toISOString(),
        timeSlot: `${selectedTime} ${timeSlot}`,
        amount: 250,
      };

      await AsyncStorage.setItem(
        "pendingAppointment",
        JSON.stringify(appointmentData)
      );

      setShowConfirmation(false);
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Error saving appointment:", err);
      Alert.alert("Error", err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPayment = async () => {
    setShowSuccess(false);

    try {
      const appointmentDataString =
        await AsyncStorage.getItem("pendingAppointment");

      if (!appointmentDataString) {
        throw new Error(
          "Appointment data not found. Please try booking again."
        );
      }

      const appointmentData = JSON.parse(appointmentDataString);

      router.push({
        pathname: "/policeclearancepayment",
        params: {
          appointmentData: JSON.stringify(appointmentData),
        },
      });
    } catch (err: any) {
      console.error("Error going to payment:", err);
      Alert.alert("Error", err.message || "Failed to proceed to payment");
    }
  };

  const selectedDateObj = dates.find((d) => d.day === selectedDate);
  const formattedDate = selectedDateObj
    ? `${selectedDateObj.month + 1}/${selectedDateObj.day}/${selectedDateObj.year} ${selectedDateObj.label}`
    : "";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />
      <GradientHeader title="Book Appointment" onBack={() => router.back()} />

      {/* Stepper */}
      <View className="bg-white px-6 py-5">
        <View className="flex-row items-center justify-between">
          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-indigo-600 items-center justify-center mb-2">
              <Text className="text-white font-bold">1</Text>
            </View>
            <Text className="text-xs text-gray-900 font-semibold">
              Book date
            </Text>
          </View>

          <View
            className="flex-1 h-px mx-2"
            style={{
              marginTop: -20,
              backgroundColor: "#D1D5DB",
            }}
          />

          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mb-2">
              <Text className="text-white font-bold">2</Text>
            </View>
            <Text className="text-xs text-gray-500 ">Payment</Text>
          </View>

          <View
            className="flex-1 h-px mx-2"
            style={{
              marginTop: -20,
              backgroundColor: "#D1D5DB",
            }}
          />

          <View className="items-center" style={{ width: 70 }}>
            <View className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center mb-2">
              <Text className="text-white font-bold">3</Text>
            </View>
            <Text className="text-xs text-gray-500">Save</Text>
          </View>
        </View>
      </View>

      {/* Booking Form */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Purpose Dropdown */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium text-sm mb-2 mt-4">
            Purpose
          </Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
            style={{ backgroundColor: "#DEEBF8" }}
            onPress={() => setShowPurposeDropdown(true)}
            activeOpacity={0.7}
          >
            <Text className={purpose ? "text-gray-900" : "text-gray-400"}>
              {purpose || "Select purpose"}
            </Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Police Station Dropdown */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium text-sm mb-2">
            Select police station
          </Text>
          <TouchableOpacity
            className="border border-gray-200 rounded-xl p-4 flex-row justify-between items-center"
            style={{ backgroundColor: "#DEEBF8" }}
            onPress={() => setShowStationDropdown(true)}
            activeOpacity={0.7}
          >
            <Text
              className={
                station ? "text-gray-900 flex-1" : "text-gray-400 flex-1"
              }
              numberOfLines={1}
            >
              {station ||
                (loadingStations ? "Loading..." : "Select police station")}
            </Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Appointment Date */}
        <View className="mb-5">
          <Text className="text-gray-700 font-medium text-sm mb-2">
            Appointment date
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date.day}
                className={`mr-3 px-5 py-3 rounded-xl border ${
                  selectedDate === date.day
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-white border-gray-200"
                }`}
                onPress={() => setSelectedDate(date.day)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-lg font-semibold ${
                    selectedDate === date.day ? "text-white" : "text-gray-900"
                  }`}
                >
                  {date.day}
                </Text>
                <Text
                  className={`text-xs ${
                    selectedDate === date.day ? "text-white" : "text-gray-500"
                  }`}
                >
                  {date.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View className="relative mb-10 flex-row">
          <View
            style={{
              position: "absolute",
              left: 18,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: "#E5E7EB",
            }}
          />

          <View>
            <View
              style={{
                position: "absolute",
                left: 12,
                top: 8,
                width: 15,
                height: 15,
                borderRadius: 8,
                backgroundColor: timeSlot === "A.M" ? "#3b82f6" : "#CBD5E1",
                borderWidth: 2,
                borderColor: "#3b82f6",
              }}
            />
            <View
              style={{
                position: "absolute",
                left: 12,
                top: 140,
                width: 15,
                height: 15,
                borderRadius: 8,
                backgroundColor: timeSlot === "P.M" ? "#f97316" : "#CBD5E1",
                borderWidth: 2,
                borderColor: "#f97316",
              }}
            />
          </View>

          <View style={{ marginLeft: 35, flex: 1 }}>
            {/* Morning */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium text-sm mb-2">
                Morning
              </Text>
              <View className="flex-row flex-wrap">
                {timeSlots.morning.map((time) => (
                  <TouchableOpacity
                    key={time}
                    className={`mr-2 mb-2 px-6 py-3 rounded-xl border ${
                      selectedTime === time && timeSlot === "A.M"
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => {
                      setSelectedTime(time);
                      setTimeSlot("A.M");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={
                        selectedTime === time && timeSlot === "A.M"
                          ? "text-white font-medium"
                          : "text-gray-700"
                      }
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Afternoon */}
            <View>
              <Text className="text-gray-700 font-medium text-sm mb-2">
                Afternoon
              </Text>
              <View className="flex-row flex-wrap">
                {timeSlots.afternoon.map((time) => (
                  <TouchableOpacity
                    key={time}
                    className={`mr-2 mb-2 px-6 py-3 rounded-xl border ${
                      selectedTime === time && timeSlot === "P.M"
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-white border-gray-200"
                    }`}
                    onPress={() => {
                      setSelectedTime(time);
                      setTimeSlot("P.M");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={
                        selectedTime === time && timeSlot === "P.M"
                          ? "text-white font-medium"
                          : "text-gray-700"
                      }
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Price and Proceed */}
        <View
          className="flex-row items-center justify-between mb-8 pb-4 rounded-2xl px-4 py-4"
          style={{ backgroundColor: "#DEEBF8", zIndex: 20 }}
        >
          <Text className="text-2xl font-bold text-gray-900">₱250.00</Text>
          <TouchableOpacity
            className="bg-indigo-600 rounded-xl px-12 py-4 shadow-md z-20"
            onPress={handleProceed}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? "Processing..." : "Proceed"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNav activeRoute="/(tabs)/clearance" />

      {/* Purpose Dropdown Modal */}
      <Modal visible={showPurposeDropdown} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowPurposeDropdown(false)}
        >
          <View className="bg-white rounded-2xl w-4/5 max-h-96 overflow-hidden">
            <ScrollView>
              {purposes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="p-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setPurpose(item);
                    setShowPurposeDropdown(false);
                  }}
                >
                  <Text className="text-gray-900 text-base">{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Police Station Dropdown Modal */}
      <Modal visible={showStationDropdown} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowStationDropdown(false)}
        >
          <View className="bg-white rounded-2xl w-4/5 max-h-96 overflow-hidden">
            <ScrollView>
              {policeStations.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  className="p-4 border-b border-gray-100 active:bg-gray-50"
                  onPress={() => {
                    setStation(`${item.name}, ${item.address}`);
                    setStationId(item._id);
                    setShowStationDropdown(false);
                  }}
                >
                  <Text className="text-gray-900 text-base">
                    {item.name}, {item.address}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent
        animationType="slide"
        onRequestClose={() => !loading && setShowConfirmation(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-[60%] items-center">
            <Text className="text-lg font-semibold mb-3">
              Confirm Appointment
            </Text>
            <Text className="text-gray-700 text-center mb-1">
              {formattedDate}
            </Text>
            <Text className="text-indigo-900 text-lg font-bold mb-1">{`${selectedTime} ${timeSlot}`}</Text>
            <Text className="text-gray-700 text-center mb-6">{station}</Text>

            <TouchableOpacity
              className="bg-indigo-600 px-8 py-3 rounded-xl w-full"
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base text-center">
                {loading ? "Confirming..." : "Confirm and Proceed"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-[50%] items-center">
            <Text className="text-lg font-semibold mb-3">
              Appointment Saved
            </Text>
            <Text className="text-gray-700 text-center mb-6">
              Your appointment has been successfully booked. Continue to
              payment.
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-8 py-3 mb-10 rounded-xl"
              onPress={handleGoToPayment}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Continue to Payment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
