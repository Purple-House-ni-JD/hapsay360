import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Upload, Camera, Image as ImageIcon } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";

// UPDATE TO YOUR IP
const API_BASE = "http://192.168.1.6:3000/api";

export default function PoliceClearancePaymentProof() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Data passed from Summary (NOT SAVED YET)
  const {
    purpose,
    stationId,
    appointmentDate,
    timeSlot,
    paymentMethodId,
    amount,
    policeStationName,
  } = params;

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- PICK IMAGE ---
  const pickImage = async (useCamera: boolean) => {
    const { status } = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your camera/gallery."
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.5,
        });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // --- CONVERT BASE64 ---
  const convertToBase64 = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Conversion error", e);
      return null;
    }
  };

  const handleSubmitAll = async () => {
    if (isSubmitting) return; // Prevent double submission

    if (!imageUri) {
      Alert.alert(
        "Requirement",
        "Please upload a payment screenshot to proceed."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setUploading(true);

      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const base64Data = await convertToBase64(imageUri);
      if (!base64Data) throw new Error("Failed to process image");

      const payload = {
        purpose,
        policeStation: stationId,
        appointmentDate,
        timeSlot,
        paymentMethodId,
        amount: parseFloat(amount as string),
        attachments: [
          {
            filename: `payment_proof_${Date.now()}.jpg`,
            mimetype: "image/jpeg",
            data: base64Data,
          },
        ],
      };

      const response = await fetch(`${API_BASE}/clearance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      router.replace({
        pathname: "/policeclearanceconfirmation",
        params: {
          clearanceId: data.data._id,
          amount: amount,
          policeStation: policeStationName,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message);
      setIsSubmitting(false); // Reset on error
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <StatusBar barStyle="light-content" />
      <GradientHeader title="Upload Proof" onBack={() => router.back()} />

      <ScrollView
        className="flex-1 px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-100 rounded-xl p-12 mb-6">
          <Text className="text-blue-900 font-bold text-lg mb-2">
            Verification Required
          </Text>
          <Text className="text-blue-800 text-sm leading-5">
            To confirm your appointment at{" "}
            <Text className="font-bold">{policeStationName}</Text>, please
            upload a screenshot of your payment receipt.
          </Text>
        </View>

        {/* Amount */}
        <View className="items-center mb-8">
          <Text className="text-gray-500 text-sm font-medium mb-1">
            AMOUNT DUE
          </Text>
          <Text className="text-4xl font-bold text-gray-900">
            ₱{parseFloat((amount as string) || "0").toFixed(2)}
          </Text>
        </View>

        {/* Upload Area */}
        <Text className="text-gray-900 font-bold text-lg mb-3">
          Attach Screenshot
        </Text>

        {imageUri ? (
          <View className="mb-8">
            <View className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                className="absolute top-3 right-3 bg-black/60 p-2 rounded-full"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setImageUri(null)}>
              <Text className="text-indigo-600 text-center mt-3 font-medium">
                Change Image
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-4 mb-10">
            <TouchableOpacity
              onPress={() => pickImage(true)}
              className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-xl py-8 items-center justify-center"
            >
              <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mb-2">
                <Camera size={24} color="#4f46e5" />
              </View>
              <Text className="text-gray-600 font-medium">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage(false)}
              className="flex-1 bg-white border-2 border-dashed border-gray-300 rounded-xl py-8 items-center justify-center"
            >
              <View className="w-12 h-12 bg-indigo-50 rounded-full items-center justify-center mb-2">
                <ImageIcon size={24} color="#4f46e5" />
              </View>
              <Text className="text-gray-600 font-medium">Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit Button */}
        <View className="mt-auto">
          <TouchableOpacity
            onPress={handleSubmitAll}
            disabled={uploading || !imageUri}
            className={`w-full bg-indigo-600 py-4 rounded-xl items-center shadow-sm ${
              uploading || !imageUri ? "opacity-50" : "opacity-100"
            }`}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Upload size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">
                  Submit Proof & Finish
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmitAll}
            disabled={uploading || !imageUri}
            className={`w-full bg-white
               py-4 rounded-xl items-center shadow-sm ${
                 uploading || !imageUri ? "opacity-50" : "opacity-100"
               }`}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Upload size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg"></Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
