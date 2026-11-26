import { Stack } from 'expo-router';

export default function EmpresaLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />

      <Stack.Screen name="painel" />

      <Stack.Screen
        name="publicar-vaga"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen name="vaga/[id]" />
    </Stack>
  );
}