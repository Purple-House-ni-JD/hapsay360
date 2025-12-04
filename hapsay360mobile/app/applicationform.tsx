import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GradientHeader from "./components/GradientHeader";

// ----------------------- Helpers -----------------------
const SectionTitle = ({
  children,
  color,
}: {
  children: string;
  color: string;
}) => (
  <Text
    style={{
      color,
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 24,
      marginBottom: 12,
    }}
  >
    {children}
  </Text>
);

const Divider = ({ color }: { color: string }) => (
  <View style={{ height: 1, backgroundColor: color, marginVertical: 16 }} />
);

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  color,
  style,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  color: string;
  style?: object;
  keyboardType?: any;
}) => (
  <View style={[{ marginBottom: 16 }, style]}>
    <Text style={{ color, marginBottom: 4, fontSize: 14 }}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={`${color}66`}
      keyboardType={keyboardType}
      style={{
        borderWidth: 1,
        borderColor: `${color}33`,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color,
        backgroundColor: `${color}05`,
      }}
    />
  </View>
);

const Checkbox = ({
  label,
  value,
  onToggle,
  color,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  color: string;
}) => (
  <Pressable
    onPress={onToggle}
    style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
  >
    <Ionicons
      name={value ? "checkmark-circle" : "ellipse-outline"}
      size={24}
      color={value ? color : "#999"}
      style={{ marginRight: 8 }}
    />
    <Text style={{ color, fontSize: 14 }}>{label}</Text>
  </Pressable>
);

const Button = ({
  label,
  onPress,
  disabled,
  bgColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  bgColor: string;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={{
      backgroundColor: disabled ? "#999" : bgColor,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      marginVertical: 24,
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
      {label}
    </Text>
  </Pressable>
);

const OptionSelector = ({
  label,
  options,
  selected,
  onSelect,
  color,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  color: string;
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ color, marginBottom: 8, fontSize: 14 }}>{label}</Text>
    {options.map((opt) => (
      <Pressable
        key={opt}
        onPress={() => onSelect(opt)}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        <Ionicons
          name={selected === opt ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={selected === opt ? color : "#999"}
          style={{ marginRight: 8 }}
        />
        <Text style={{ color, fontSize: 14 }}>{opt}</Text>
      </Pressable>
    ))}
  </View>
);

const formatDateToLocal = (isoDate: string) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

// ----------------------- ApplicationForm -----------------------
export default function ApplicationForm() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const bgColor = isDark ? "#1a1f4d" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#141545";
  const buttonColor = isDark ? "#3b82f6" : "#1a1f4d";

  const [loading, setLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // ----------------------- Personal Info Fields -----------------------
  const [givenName, setGivenName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [qualifier, setQualifier] = useState("");
  const [sex, setSex] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [isPWD, setIsPWD] = useState(false);
  const [isFirstTimeJobSeeker, setIsFirstTimeJobSeeker] = useState(false);
  const [nationality, setNationality] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [otherCountry, setOtherCountry] = useState("");

  // ----------------------- Address Fields -----------------------
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [telephone, setTelephone] = useState("");

  // ----------------------- Other Info Fields -----------------------
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [complexion, setComplexion] = useState("");
  const [identifyingMarks, setIdentifyingMarks] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [religion, setReligion] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");

  // ----------------------- Family Info Fields -----------------------
  // Father
  const [fatherGiven, setFatherGiven] = useState("");
  const [fatherMiddle, setFatherMiddle] = useState("");
  const [fatherSurname, setFatherSurname] = useState("");
  const [fatherQualifier, setFatherQualifier] = useState("");
  const [fatherBirthPlace, setFatherBirthPlace] = useState("");
  const [fatherOtherCountry, setFatherOtherCountry] = useState("");

  // Mother
  const [motherGiven, setMotherGiven] = useState("");
  const [motherMiddle, setMotherMiddle] = useState("");
  const [motherSurname, setMotherSurname] = useState("");
  const [motherQualifier, setMotherQualifier] = useState("");
  const [motherBirthPlace, setMotherBirthPlace] = useState("");
  const [motherOtherCountry, setMotherOtherCountry] = useState("");

  // Spouse
  const [spouseGiven, setSpouseGiven] = useState("");
  const [spouseMiddle, setSpouseMiddle] = useState("");
  const [spouseSurname, setSpouseSurname] = useState("");
  const [spouseQualifier, setSpouseQualifier] = useState("");

  // ----------------------- Auth / API -----------------------
  const API_BASE = "http://192.168.0.104:3000/api/application";

  const getAuthToken = async () => {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/my-application`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          router.push("/login");
          return;
        }
        const errText = await res.text().catch(() => "Unknown error");
        throw new Error(errText);
      }

      const data = await res.json();
      const p = data.profile || {};

      if (p.personal_info?.givenName) {
        setHasExistingProfile(true);

        // Personal info
        setGivenName(p.personal_info?.givenName || "");
        setMiddleName(p.personal_info?.middleName || "");
        setSurname(p.personal_info?.surname || "");
        setQualifier(p.personal_info?.qualifier || "");
        setSex(p.personal_info?.sex || "");
        setCivilStatus(p.personal_info?.civilStatus || "");
        setBirthdate(formatDateToLocal(p.personal_info?.birthdate || ""));
        setIsPWD(p.personal_info?.isPWD || false);
        setIsFirstTimeJobSeeker(p.personal_info?.isFirstTimeJobSeeker || false);
        setNationality(p.personal_info?.nationality || "");
        setBirthPlace(p.personal_info?.birthPlace || "");
        setOtherCountry(p.personal_info?.otherCountry || "");

        // Address
        setHouseNo(p.address?.houseNo || "");
        setStreet(p.address?.street || "");
        setCity(p.address?.city || "");
        setBarangay(p.address?.barangay || "");
        setProvince(p.address?.province || "");
        setPostalCode(p.address?.postalCode || "");
        setCountry(p.address?.country || "");
        setEmail(p.address?.email || "");
        setMobile(p.address?.mobile || "");
        setTelephone(p.address?.telephone || "");

        // Family
        setFatherGiven(p.family?.father?.given || "");
        setFatherMiddle(p.family?.father?.middle || "");
        setFatherSurname(p.family?.father?.surname || "");
        setFatherQualifier(p.family?.father?.qualifier || "");
        setFatherBirthPlace(p.family?.father?.birthPlace || "");
        setFatherOtherCountry(p.family?.father?.otherCountry || "");

        setMotherGiven(p.family?.mother?.given || "");
        setMotherMiddle(p.family?.mother?.middle || "");
        setMotherSurname(p.family?.mother?.surname || "");
        setMotherQualifier(p.family?.mother?.qualifier || "");
        setMotherBirthPlace(p.family?.mother?.birthPlace || "");
        setMotherOtherCountry(p.family?.mother?.otherCountry || "");

        setSpouseGiven(p.family?.spouse?.given || "");
        setSpouseMiddle(p.family?.spouse?.middle || "");
        setSpouseSurname(p.family?.spouse?.surname || "");
        setSpouseQualifier(p.family?.spouse?.qualifier || "");
      } else {
        setHasExistingProfile(false);
      }

      setUserLoaded(true);
    } catch (err: any) {
      console.error("fetchProfile failed:", err);
      setUserLoaded(true);
      setHasExistingProfile(false);
      Alert.alert(
        "Could Not Load Profile",
        "Unable to load your previous data. You can still fill out the form. Error: " +
          err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!givenName || !surname || !email) {
      Alert.alert(
        "Validation Error",
        "Please fill in your given name, surname, and email."
      );
      return;
    }

    const profile = {
      // Fields that will sync to User
      personal_info: {
        given_name: givenName,
        middle_name: middleName,
        surname: surname,
        qualifier: qualifier,
        sex: sex,
        civil_status: civilStatus,
        birthday: birthdate ? new Date(birthdate) : null,
        pwd: isPWD,
        nationality: nationality,
      },
      address: {
        houseNo: houseNo,
        street: street,
        city: city,
        barangay: barangay,
        province: province,
        postalCode: postalCode,
        country: country,
        email: email,
        mobile: mobile,
        telephone: telephone,
      },

      // Fields only for ApplicationProfile
      other_info: {
        height: height,
        weight: weight,
        complexion: complexion,
        identifying_marks: identifyingMarks,
        blood_type: bloodType,
        religion: religion,
        education: education,
        occupation: occupation,
      },
      family: {
        father: {
          given_name: fatherGiven,
          middle_name: fatherMiddle,
          surname: fatherSurname,
          qualifier: fatherQualifier,
          birth_place: fatherBirthPlace,
          other_country: fatherOtherCountry,
        },
        mother: {
          given_name: motherGiven,
          middle_name: motherMiddle,
          surname: motherSurname,
          qualifier: motherQualifier,
          birth_place: motherBirthPlace,
          other_country: motherOtherCountry,
        },
        spouse: {
          given_name: spouseGiven,
          middle_name: spouseMiddle,
          surname: spouseSurname,
          qualifier: spouseQualifier,
        },
      },
    };

    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Please login again");
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_BASE}/my-application`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        if (res.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          router.push("/login");
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Server error");
      }

      const result = await res.json();

      Alert.alert(
        "Success",
        result.message ||
          (hasExistingProfile ? "Profile updated!" : "Profile saved!"),
        [
          {
            text: "OK",
            onPress: () => router.push("/bookpoliceclearancescreen"),
          },
        ]
      );
    } catch (err: any) {
      console.error("[DEBUG] saveProfile failed:", err);
      Alert.alert("Error", `Failed to save profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!userLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: textColor, fontSize: 16 }}>
            Loading your profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: bgColor }}
      edges={["left", "right"]}
    >
      <GradientHeader title="Application Form" onBack={() => router.back()} />
      <KeyboardAwareScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 8 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== PERSONAL INFORMATION ==================== */}
        <SectionTitle color={textColor}>Personal Information</SectionTitle>

        <InputField
          label="Given Name *"
          value={givenName}
          onChangeText={setGivenName}
          color={textColor}
          placeholder="Enter your first name"
        />
        <InputField
          label="Middle Name"
          value={middleName}
          onChangeText={setMiddleName}
          color={textColor}
          placeholder="Enter your middle name"
        />
        <InputField
          label="Surname *"
          value={surname}
          onChangeText={setSurname}
          color={textColor}
          placeholder="Enter your last name"
        />
        <InputField
          label="Qualifier (Jr., Sr., III, etc.)"
          value={qualifier}
          onChangeText={setQualifier}
          color={textColor}
          placeholder="e.g., Jr."
        />

        <OptionSelector
          label="Sex"
          options={["Male", "Female"]}
          selected={sex}
          onSelect={setSex}
          color={textColor}
        />

        <InputField
          label="Civil Status"
          value={civilStatus}
          onChangeText={setCivilStatus}
          color={textColor}
          placeholder="e.g., Single, Married, Divorced"
        />

        <InputField
          label="Birthdate (MM/DD/YYYY)"
          value={birthdate}
          onChangeText={setBirthdate}
          color={textColor}
          placeholder="MM/DD/YYYY"
        />

        <Checkbox
          label="Person with Disability (PWD)"
          value={isPWD}
          onToggle={() => setIsPWD(!isPWD)}
          color={textColor}
        />

        <Checkbox
          label="First Time Job Seeker"
          value={isFirstTimeJobSeeker}
          onToggle={() => setIsFirstTimeJobSeeker(!isFirstTimeJobSeeker)}
          color={textColor}
        />

        <InputField
          label="Nationality"
          value={nationality}
          onChangeText={setNationality}
          color={textColor}
          placeholder="e.g., Filipino"
        />

        <InputField
          label="Birth Place"
          value={birthPlace}
          onChangeText={setBirthPlace}
          color={textColor}
          placeholder="City/Municipality where you were born"
        />

        <InputField
          label="Other Country (if applicable)"
          value={otherCountry}
          onChangeText={setOtherCountry}
          color={textColor}
          placeholder="If born in another country"
        />

        <Divider color={`${textColor}22`} />

        {/* ==================== ADDRESS ==================== */}
        <SectionTitle color={textColor}>Address</SectionTitle>

        <InputField
          label="House/Unit/Bldg No."
          value={houseNo}
          onChangeText={setHouseNo}
          color={textColor}
          placeholder="House number"
        />

        <InputField
          label="Street"
          value={street}
          onChangeText={setStreet}
          color={textColor}
          placeholder="Street name"
        />

        <InputField
          label="Barangay"
          value={barangay}
          onChangeText={setBarangay}
          color={textColor}
          placeholder="Barangay"
        />

        <InputField
          label="City/Municipality"
          value={city}
          onChangeText={setCity}
          color={textColor}
          placeholder="City or Municipality"
        />

        <InputField
          label="Province"
          value={province}
          onChangeText={setProvince}
          color={textColor}
          placeholder="Province"
        />

        <InputField
          label="Postal Code"
          value={postalCode}
          onChangeText={setPostalCode}
          color={textColor}
          placeholder="Postal/Zip code"
          keyboardType="numeric"
        />

        <InputField
          label="Country"
          value={country}
          onChangeText={setCountry}
          color={textColor}
          placeholder="Country"
        />

        <InputField
          label="Email *"
          value={email}
          onChangeText={setEmail}
          color={textColor}
          placeholder="your.email@example.com"
          keyboardType="email-address"
        />

        <InputField
          label="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          color={textColor}
          placeholder="+63 912 345 6789"
          keyboardType="phone-pad"
        />

        <InputField
          label="Telephone Number"
          value={telephone}
          onChangeText={setTelephone}
          color={textColor}
          placeholder="Landline number"
          keyboardType="phone-pad"
        />

        <Divider color={`${textColor}22`} />

        {/* ==================== OTHER INFORMATION ==================== */}
        <SectionTitle color={textColor}>Other Information</SectionTitle>

        <InputField
          label="Height (cm)"
          value={height}
          onChangeText={setHeight}
          color={textColor}
          placeholder="e.g., 170"
          keyboardType="numeric"
        />

        <InputField
          label="Weight (kg)"
          value={weight}
          onChangeText={setWeight}
          color={textColor}
          placeholder="e.g., 65"
          keyboardType="numeric"
        />

        <InputField
          label="Complexion"
          value={complexion}
          onChangeText={setComplexion}
          color={textColor}
          placeholder="e.g., Fair, Medium, Dark"
        />

        <InputField
          label="Identifying Marks"
          value={identifyingMarks}
          onChangeText={setIdentifyingMarks}
          color={textColor}
          placeholder="e.g., Scar on left arm, mole on right cheek"
        />

        <InputField
          label="Blood Type"
          value={bloodType}
          onChangeText={setBloodType}
          color={textColor}
          placeholder="e.g., O+, A-, AB+"
        />

        <InputField
          label="Religion"
          value={religion}
          onChangeText={setReligion}
          color={textColor}
          placeholder="Your religion"
        />

        <InputField
          label="Education"
          value={education}
          onChangeText={setEducation}
          color={textColor}
          placeholder="Highest educational attainment"
        />

        <InputField
          label="Occupation"
          value={occupation}
          onChangeText={setOccupation}
          color={textColor}
          placeholder="Current occupation"
        />

        <Divider color={`${textColor}22`} />

        {/* ==================== FAMILY INFORMATION ==================== */}
        <SectionTitle color={textColor}>Family Information</SectionTitle>

        <Text
          style={{
            color: textColor,
            fontSize: 16,
            fontWeight: "600",
            marginTop: 12,
            marginBottom: 8,
          }}
        >
          Father's Information
        </Text>

        <InputField
          label="Given Name"
          value={fatherGiven}
          onChangeText={setFatherGiven}
          color={textColor}
          placeholder="Father's first name"
        />

        <InputField
          label="Middle Name"
          value={fatherMiddle}
          onChangeText={setFatherMiddle}
          color={textColor}
          placeholder="Father's middle name"
        />

        <InputField
          label="Surname"
          value={fatherSurname}
          onChangeText={setFatherSurname}
          color={textColor}
          placeholder="Father's last name"
        />

        <InputField
          label="Qualifier"
          value={fatherQualifier}
          onChangeText={setFatherQualifier}
          color={textColor}
          placeholder="e.g., Jr., Sr."
        />

        <InputField
          label="Birth Place"
          value={fatherBirthPlace}
          onChangeText={setFatherBirthPlace}
          color={textColor}
          placeholder="Where father was born"
        />

        <InputField
          label="Other Country"
          value={fatherOtherCountry}
          onChangeText={setFatherOtherCountry}
          color={textColor}
          placeholder="If born abroad"
        />

        <Text
          style={{
            color: textColor,
            fontSize: 16,
            fontWeight: "600",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          Mother's Information
        </Text>

        <InputField
          label="Given Name"
          value={motherGiven}
          onChangeText={setMotherGiven}
          color={textColor}
          placeholder="Mother's first name"
        />

        <InputField
          label="Middle Name"
          value={motherMiddle}
          onChangeText={setMotherMiddle}
          color={textColor}
          placeholder="Mother's middle name"
        />

        <InputField
          label="Surname"
          value={motherSurname}
          onChangeText={setMotherSurname}
          color={textColor}
          placeholder="Mother's maiden name"
        />

        <InputField
          label="Qualifier"
          value={motherQualifier}
          onChangeText={setMotherQualifier}
          color={textColor}
          placeholder="e.g., Jr., Sr."
        />

        <InputField
          label="Birth Place"
          value={motherBirthPlace}
          onChangeText={setMotherBirthPlace}
          color={textColor}
          placeholder="Where mother was born"
        />

        <InputField
          label="Other Country"
          value={motherOtherCountry}
          onChangeText={setMotherOtherCountry}
          color={textColor}
          placeholder="If born abroad"
        />

        <Text
          style={{
            color: textColor,
            fontSize: 16,
            fontWeight: "600",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          Spouse's Information (if married)
        </Text>

        <InputField
          label="Given Name"
          value={spouseGiven}
          onChangeText={setSpouseGiven}
          color={textColor}
          placeholder="Spouse's first name"
        />

        <InputField
          label="Middle Name"
          value={spouseMiddle}
          onChangeText={setSpouseMiddle}
          color={textColor}
          placeholder="Spouse's middle name"
        />

        <InputField
          label="Surname"
          value={spouseSurname}
          onChangeText={setSpouseSurname}
          color={textColor}
          placeholder="Spouse's last name"
        />

        <InputField
          label="Qualifier"
          value={spouseQualifier}
          onChangeText={setSpouseQualifier}
          color={textColor}
          placeholder="e.g., Jr., Sr."
        />

        {/* ==================== SAVE BUTTON ==================== */}
        <Button
          label={
            loading
              ? "Saving..."
              : hasExistingProfile
                ? "Update Profile"
                : "Save Profile"
          }
          onPress={handleSaveProfile}
          disabled={loading}
          bgColor={buttonColor}
        />

        <View style={{ height: 40 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
