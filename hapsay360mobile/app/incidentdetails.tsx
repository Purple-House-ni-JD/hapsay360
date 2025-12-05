import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  Shield,
  Calendar,
  Clock,
  Camera,
  Video,
  FileText,
} from "lucide-react-native";
import GradientHeader from "./components/GradientHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

const API_BASE = "http://192.168.1.6:3000";

export default function IncidentDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const reporterName = params.reporterName || "";
  const reporterContact = params.reporterContact || "";
  const reporterAddress = params.reporterAddress || "";

  // States
  const [incidentType, setIncidentType] = useState("Theft");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Date/Time State
  const [selectedDateObj, setSelectedDateObj] = useState(new Date());

  // Location States
  const [incidentLocation, setIncidentLocation] = useState({
    latitude: 8.4542,
    longitude: 124.6319,
  });
  const [incidentSpecificAddress, setIncidentSpecificAddress] =
    useState(reporterAddress);
  const [userLocation, setUserLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [locationLoaded, setLocationLoaded] = useState(false);

  const [attachments, setAttachments] = useState({
    photos: [],
    videos: [],
    documents: [],
  });
  const MAX_ATTACHMENTS = 5;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [policeStations, setPoliceStations] = useState([]);
  const [stationsLoaded, setStationsLoaded] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationDistance, setStationDistance] = useState(null);
  const [stationTime, setStationTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- HELPER: FORMAT DATE DISPLAY ---
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // --- HELPER: FORMAT TIME DISPLAY ---
  const formatTimeDisplay = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchPoliceStations = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await fetch(
          `${API_BASE}/api/police-stations/getStations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (data.success) {
          const mappedStations = data.data.map((station) => ({
            id: station._id,
            name: station.name,
            address: station.address,
            latitude: parseFloat(station.location.latitude),
            longitude: parseFloat(station.location.longitude),
            contact: station.contact,
          }));

          setPoliceStations(mappedStations);
          setStationsLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        setStationsLoaded(true);
      }
    };

    fetchPoliceStations();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestStation = () => {
    if (!locationLoaded || !stationsLoaded || policeStations.length === 0)
      return;

    let nearest = policeStations[0];
    let minDistance = calculateDistance(
      incidentLocation.latitude,
      incidentLocation.longitude,
      policeStations[0].latitude,
      policeStations[0].longitude
    );

    policeStations.forEach((station) => {
      const dist = calculateDistance(
        incidentLocation.latitude,
        incidentLocation.longitude,
        station.latitude,
        station.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = station;
      }
    });

    setSelectedStation(nearest);
    setStationDistance(minDistance.toFixed(1));
    const estimatedTime = Math.round((minDistance / 30) * 60);
    setStationTime(estimatedTime);
  };

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required.");
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setUserLocation(coords);
        setIncidentLocation(coords);
        setLocationLoaded(true);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (locationLoaded && stationsLoaded) {
      findNearestStation();
    }
  }, [locationLoaded, stationsLoaded]);

  // --- PICKER HANDLERS ---
  const handleDateChange = (event, selected) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(false);
    if (selected) {
      const newDate = new Date(selectedDateObj);
      newDate.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate()
      );
      setSelectedDateObj(newDate);
    }
  };

  const handleTimeChange = (event, selected) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }
    setShowTimePicker(false);
    if (selected) {
      const newDate = new Date(selectedDateObj);
      newDate.setHours(selected.getHours(), selected.getMinutes());
      setSelectedDateObj(newDate);
    }
  };

  // --- ATTACHMENTS ---
  const requestCameraPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (
      cameraStatus.status !== "granted" ||
      mediaLibraryStatus.status !== "granted"
    ) {
      Alert.alert(
        "Permission Denied",
        "Camera/Media permissions are required."
      );
      return false;
    }
    return true;
  };

  const handlePhotoUpload = async (fromCamera = false) => {
    if (attachments.photos.length >= MAX_ATTACHMENTS) return;
    if (!(await requestCameraPermissions())) return;

    let result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: "Images",
          quality: 0.7,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "Images",
          quality: 0.7,
        });

    if (!result.canceled) {
      setAttachments((prev) => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri],
      }));
    }
  };

  const handleVideoUpload = async (fromCamera = false) => {
    if (attachments.videos.length >= MAX_ATTACHMENTS) return;
    if (!(await requestCameraPermissions())) return;

    let result = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: "Videos" })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "Videos" });

    if (!result.canceled) {
      setAttachments((prev) => ({
        ...prev,
        videos: [...prev.videos, result.assets[0].uri],
      }));
    }
  };

  const handleDocumentUpload = async () => {
    if (attachments.documents.length >= MAX_ATTACHMENTS) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachments((prev) => ({
          ...prev,
          documents: [
            ...prev.documents,
            { uri: result.assets[0].uri, name: result.assets[0].name },
          ],
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const showUploadOptions = (type) => {
    const buttons = [];
    if (type === "photo") {
      buttons.push(
        { text: "Camera", onPress: () => handlePhotoUpload(true) },
        { text: "Gallery", onPress: () => handlePhotoUpload(false) }
      );
    } else if (type === "video") {
      buttons.push(
        { text: "Camera", onPress: () => handleVideoUpload(true) },
        { text: "Gallery", onPress: () => handleVideoUpload(false) }
      );
    } else if (type === "document") {
      buttons.push({ text: "Files", onPress: () => handleDocumentUpload() });
    }
    buttons.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Upload", "Choose option", buttons);
  };

  // --- UPDATED SUBMIT FUNCTION ---
  const handleSubmit = async () => {
    // 1. Validation
    if (!incidentType || !description) {
      Alert.alert("Error", "Please fill out all required fields.");
      return;
    }
    if (!selectedStation) {
      Alert.alert("Error", "Please select a police station.");
      return;
    }
    if (description.length < 10) {
      Alert.alert("Error", "Description must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert("Error", "Please login first");
        return;
      }

      // --- HELPER: Convert File to Base64 ---
      const convertToBase64 = async (uri) => {
        try {
          // 1. Fetch the file uri
          const response = await fetch(uri);

          // 2. Get the blob (binary data)
          const blob = await response.blob();

          // 3. Convert blob to Base64 using FileReader
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // reader.result returns "data:image/jpeg;base64,....."
              // We split it to get ONLY the raw base64 string
              const base64data = reader.result.split(",")[1];
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
      // --- PREPARE ATTACHMENTS ---
      const processedAttachments = [];

      // Process Photos
      for (const uri of attachments.photos) {
        const base64Data = await convertToBase64(uri);
        if (base64Data) {
          processedAttachments.push({
            filename: `photo_${Date.now()}.jpg`,
            mimetype: "image/jpeg",
            // This 'data' field is what the backend expects!
            data: `data:image/jpeg;base64,${base64Data}`,
            size: base64Data.length * 0.75,
          });
        }
      }

      // Process Videos (Caution: Large videos might be slow)
      for (const uri of attachments.videos) {
        const base64Data = await convertToBase64(uri);
        if (base64Data) {
          processedAttachments.push({
            filename: `video_${Date.now()}.mp4`,
            mimetype: "video/mp4",
            data: `data:video/mp4;base64,${base64Data}`,
            size: base64Data.length * 0.75,
          });
        }
      }

      // Process Documents
      for (const doc of attachments.documents) {
        const base64Data = await convertToBase64(doc.uri);
        if (base64Data) {
          processedAttachments.push({
            filename: doc.name || `doc_${Date.now()}`,
            mimetype: "application/pdf",
            data: `data:application/pdf;base64,${base64Data}`,
            size: base64Data.length * 0.75,
          });
        }
      }

      // Prepare Strings for Display
      const dateString = formatDateDisplay(selectedDateObj);
      const timeString = formatTimeDisplay(selectedDateObj);

      const blotterData = {
        userId: userId,
        incidentType,
        incidentDate: selectedDateObj,
        incidentTime: timeString,
        incidentDescription: description,
        latitude: incidentLocation.latitude,
        longitude: incidentLocation.longitude,
        address: incidentSpecificAddress || reporterAddress,
        reporterName,
        reporterContact,
        reporterAddress,
        officerId: null,
        attachments: processedAttachments, // <--- SENDING THE CONVERTED DATA
      };

      const response = await fetch(`${API_BASE}/api/blotters/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blotterData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit blotter");
      }

      router.push({
        pathname: "/submitincident",
        params: {
          blotterNumber: data.data.blotterNumber,
          incidentType: incidentType,
          date: dateString,
          time: timeString,
          description: description,
          location: incidentSpecificAddress || reporterAddress,
          status: "Pending",
          reporterName: reporterName,
          reporterContact: reporterContact,
          stationName: selectedStation.name,
        },
      });
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", error.message || "Failed to submit blotter");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <GradientHeader title="File Blotter" onBack={() => router.back()} />
      <ScrollView className="px-4 py-6 bg-white">
        <View className="items-center pt-4 pb-6">
          <Text className="text-blue-900 text-3xl font-bold">
            Incident Details
          </Text>
        </View>

        {/* Incident Type */}
        <Text className="mb-2 text-gray-700 font-medium">Incident Type</Text>
        <TouchableOpacity
          onPress={() => setDropdownOpen(!dropdownOpen)}
          className="border border-gray-300 rounded-lg px-3 py-3 mb-6 bg-white flex-row justify-between items-center"
        >
          <Text className="text-gray-800 text-base">{incidentType}</Text>
          <Text>▼</Text>
        </TouchableOpacity>
        {dropdownOpen && (
          <View className="border border-gray-300 rounded-lg mb-6 bg-white">
            {["Theft", "Robbery", "Assault", "Accident", "Other"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setIncidentType(type);
                    setDropdownOpen(false);
                  }}
                  className="px-3 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-700">{type}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Date & Time */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 active:bg-blue-50"
          >
            <View className="flex-row items-center mb-1">
              <Calendar size={18} color="#4f46e5" />
              <Text className="text-gray-500 text-xs ml-2 font-medium uppercase">
                Date
              </Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">
              {formatDateDisplay(selectedDateObj)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTimePicker(true)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 active:bg-blue-50"
          >
            <View className="flex-row items-center mb-1">
              <Clock size={18} color="#4f46e5" />
              <Text className="text-gray-500 text-xs ml-2 font-medium uppercase">
                Time
              </Text>
            </View>
            <Text className="text-gray-900 text-lg font-bold">
              {formatTimeDisplay(selectedDateObj)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDateObj}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDateObj}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Location Map */}
        <Text className="mb-2 text-gray-700 font-medium">
          Incident Location (Drag to adjust)
        </Text>
        {locationLoaded ? (
          <Text className="mb-2 text-gray-600 text-sm">
            Lat: {incidentLocation.latitude.toFixed(6)}, Lng:{" "}
            {incidentLocation.longitude.toFixed(6)}
          </Text>
        ) : (
          <Text className="mb-2 text-gray-600">
            Loading current location...
          </Text>
        )}
        <View className="h-64 mb-6 rounded-xl overflow-hidden">
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            region={{
              latitude: incidentLocation.latitude,
              longitude: incidentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              coordinate={incidentLocation}
              draggable
              onDragEnd={(e) => {
                setIncidentLocation(e.nativeEvent.coordinate);
                setTimeout(() => findNearestStation(), 100);
              }}
              title="Incident Location"
              description="Drag to adjust location"
            >
              <View className="items-center">
                <View className="bg-red-600 w-12 h-12 rounded-full items-center justify-center shadow-lg border-4 border-white">
                  <View className="w-3 h-3 bg-white rounded-full" />
                </View>
              </View>
            </Marker>
          </MapView>
        </View>

        {/* Description */}
        <Text className="mb-2 text-gray-700 font-medium">Description *</Text>
        <TextInput
          placeholder="Enter detailed description (minimum 10 characters)"
          value={description}
          onChangeText={setDescription}
          multiline
          className="border border-gray-300 rounded-lg px-3 py-4 mb-6 bg-white h-40 text-base"
        />

        {/* Attachments Section */}
        <Text className="mb-2 text-gray-700 font-medium">
          Attachments / Evidence (Optional)
        </Text>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            onPress={() => showUploadOptions("photo")}
            className="flex-1 bg-indigo-600 border border-indigo-600 rounded-lg py-3 mr-2 items-center shadow-sm"
          >
            <Text className="text-white font-medium">📸 Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showUploadOptions("video")}
            className="flex-1 bg-indigo-600 border border-indigo-600 rounded-lg py-3 mx-1 items-center shadow-sm"
          >
            <Text className="text-white font-medium">🎥 Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showUploadOptions("document")}
            className="flex-1 bg-indigo-600 border border-indigo-600 rounded-lg py-3 ml-2 items-center shadow-sm"
          >
            <Text className="text-white font-medium">📄 Document</Text>
          </TouchableOpacity>
        </View>

        {/* Attachments List */}
        {attachments.photos.length > 0 && (
          <View className="mb-4">
            <Text className="text-gray-600 font-medium mb-2">Photos</Text>
            <FlatList
              horizontal
              data={attachments.photos}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{
                    width: 100,
                    height: 100,
                    marginRight: 8,
                    borderRadius: 8,
                  }}
                />
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {/* Police Station Select */}
        <Text className="mb-2 text-gray-700 font-medium text-lg">
          Select Police Station
        </Text>
        {!stationsLoaded ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text className="text-gray-500">Loading stations...</Text>
          </View>
        ) : selectedStation ? (
          <View className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <View className="flex-row items-center mb-2">
              <View className="w-10 h-10 bg-blue-900 rounded-full items-center justify-center mr-3">
                <Shield size={20} color="white" />
              </View>
              <View>
                <Text className="font-bold">{selectedStation.name}</Text>
                <Text className="text-xs">{selectedStation.address}</Text>
              </View>
            </View>
            <View className="flex-row justify-between border-t border-blue-200 pt-2">
              <Text className="text-xs">Est: {stationTime} mins</Text>
              <Text className="text-xs">Dist: {stationDistance} km</Text>
            </View>
          </View>
        ) : (
          <Text className="text-gray-500 italic mb-4">No stations found.</Text>
        )}

        {/* Stations Map */}
        {stationsLoaded && (
          <View className="h-80 mb-4 rounded-xl overflow-hidden">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={{
                latitude: incidentLocation.latitude,
                longitude: incidentLocation.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              showsUserLocation
            >
              <Marker coordinate={incidentLocation} title="Incident">
                <View className="items-center">
                  <View className="bg-red-600 w-10 h-10 rounded-full items-center justify-center shadow-lg border-2 border-white" />
                </View>
              </Marker>
              {policeStations.map((station) => (
                <Marker
                  key={station.id}
                  coordinate={{
                    latitude: station.latitude,
                    longitude: station.longitude,
                  }}
                  title={station.name}
                  onPress={() => {
                    setSelectedStation(station);
                    const dist = calculateDistance(
                      incidentLocation.latitude,
                      incidentLocation.longitude,
                      station.latitude,
                      station.longitude
                    );
                    setStationDistance(dist.toFixed(1));
                    setStationTime(Math.round((dist / 30) * 60));
                  }}
                >
                  <View className="items-center">
                    <View
                      className={`w-8 h-8 rounded-full items-center justify-center border-2 border-white ${
                        selectedStation?.id === station.id
                          ? "bg-blue-900"
                          : "bg-gray-600"
                      }`}
                    >
                      <Shield size={14} color="white" />
                    </View>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>
        )}

        <TouchableOpacity
          onPress={findNearestStation}
          className="bg-white border-2 border-indigo-600 rounded-xl py-3 mb-6"
        >
          <Text className="text-indigo-600 text-center font-semibold">
            Find Nearest Station
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-indigo-600 rounded-xl py-4 mb-6"
        >
          <Text className="text-white text-center font-semibold text-lg">
            {submitting ? "Submitting..." : "Submit Blotter"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
