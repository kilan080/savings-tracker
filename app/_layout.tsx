import { Stack } from "expo-router";
import { SavingsProvider } from "../context/SavingsContext";

export default function RootLayout() {
  return (
    <SavingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SavingsProvider>
  );
}
