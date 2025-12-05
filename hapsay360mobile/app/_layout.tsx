import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main tab navigator */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="myaccount" options={{ headerShown: false }} />
      <Stack.Screen name="changepassword" options={{ headerShown: false }} />
      <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
      <Stack.Screen name="newpassword" options={{ headerShown: false }} />
      <Stack.Screen name="myappointments" options={{ headerShown: false }} />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name="addpayment" options={{ headerShown: false }} />
      <Stack.Screen name="address" options={{ headerShown: false }} />
      <Stack.Screen name="trackrequests" options={{ headerShown: false }} />
      <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
      <Stack.Screen name="appointments" options={{ headerShown: false }} />
      <Stack.Screen name="incidentdetails" options={{ headerShown: false }} />
      <Stack.Screen name="submitincident" options={{ headerShown: false }} />
      <Stack.Screen
        name="blotterconfirmation"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="applicationform" options={{ headerShown: false }} />
      <Stack.Screen name="sos" options={{ headerShown: false }} />
      <Stack.Screen name="logout" options={{ headerShown: false }} />
      <Stack.Screen
        name="bookpoliceclearancescreen"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="bookpoliceclearance"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="policeclearancepayment"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="policeclearancesummary"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="policeclearanceconfirmation"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
