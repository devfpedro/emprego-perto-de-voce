import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function CandidatoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="empresa" />
    </Stack>
  );
}