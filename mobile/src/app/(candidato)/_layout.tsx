
import { Stack } from 'expo-router';

export default function CandidatoLayout() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="empresa" />
    </Stack>
  );
}
